package service

import (
	"fmt"
	"log/slog"

	"subscription-notification/internal/model"
	"subscription-notification/internal/pkg"
	"subscription-notification/internal/repository"

	"github.com/robfig/cron/v3"
)

// SchedulerService 定时调度器 —— 加载活跃数据源，周期性抓取并判定
type SchedulerService struct {
	dsRepo   repository.DataSourceRepo
	subRepo  repository.SubscriptionRepo
	histRepo repository.NotificationHistoryRepo
	notifier *pkg.Notifier
	cron     *cron.Cron
}

func NewSchedulerService(
	dsRepo repository.DataSourceRepo,
	subRepo repository.SubscriptionRepo,
	histRepo repository.NotificationHistoryRepo,
	notifier *pkg.Notifier,
) *SchedulerService {
	return &SchedulerService{
		dsRepo:   dsRepo,
		subRepo:  subRepo,
		histRepo: histRepo,
		notifier: notifier,
		cron: cron.New(cron.WithSeconds()),
	}
}

// Start 从数据库加载所有活跃数据源，注册到 cron 调度器并启动
func (s *SchedulerService) Start() error {
	sources, err := s.dsRepo.ListActive()
	if err != nil {
		return fmt.Errorf("list active sources: %w", err)
	}

	for _, ds := range sources {
		s.registerJob(ds)
	}

	s.cron.Start()
	slog.Info("scheduler started", "active_sources", len(sources))
	return nil
}

// Reload 重新加载数据源（供 API 调用，在数据源增删改后触发）
func (s *SchedulerService) Reload() error {
	// 清空现有任务（cron/v3 的 Remove 需要 EntryID）
	for _, entry := range s.cron.Entries() {
		s.cron.Remove(entry.ID)
	}

	sources, err := s.dsRepo.ListActive()
	if err != nil {
		return fmt.Errorf("list active sources: %w", err)
	}

	for _, ds := range sources {
		s.registerJob(ds)
	}

	slog.Info("scheduler reloaded", "active_sources", len(sources))
	return nil
}

// Stop 停止调度器
func (s *SchedulerService) Stop() {
	ctx := s.cron.Stop()
	<-ctx.Done()
	slog.Info("scheduler stopped")
}

// registerJob 为单个数据源注册定时任务
func (s *SchedulerService) registerJob(ds model.DataSource) {
	dsID := ds.ID
	dsName := ds.Name

	_, err := s.cron.AddFunc(ds.CronSchedule, func() {
		s.executeJob(dsID, dsName)
	})
	if err != nil {
		slog.Error("register cron job failed", "source", dsName, "schedule", ds.CronSchedule, "error", err)
	}
}

// executeJob 执行单次抓取-判定-通知闭环
func (s *SchedulerService) executeJob(sourceID, sourceName string) {
	ds, err := s.dsRepo.GetByID(sourceID)
	if err != nil {
		slog.Error("get data source failed", "source", sourceName, "error", err)
		return
	}

	// 1. 抓取并提取
	result, err := pkg.FetchAndExtract(ds.Method, ds.Endpoint, ds.Headers, ds.BodyTemplate, ds.ParsePath)
	if err != nil {
		slog.Error("fetch failed", "source", sourceName, "error", err)
		return
	}
	currentValue := result.Parsed
	slog.Info("fetch result", "source", sourceName, "value", currentValue)

	// 2. 获取该数据源下所有启用的订阅
	subs, err := s.subRepo.ListEnabledBySourceID(sourceID)
	if err != nil {
		slog.Error("list subscriptions failed", "source", sourceName, "error", err)
		return
	}

	// 3. 逐一判定
	for _, sub := range subs {
		s.evaluateAndNotify(sub, currentValue, sourceName)
	}
}

// evaluateAndNotify 核心状态机：仅状态翻转时触发通知
func (s *SchedulerService) evaluateAndNotify(sub model.Subscription, currentValue, sourceName string) {
	isMet := pkg.Evaluate(sub.ConditionType, currentValue, sub.ConditionValue)

	// 首次拉取：仅记录当前值，不触发通知
	if sub.LastTriggeredValue == "" {
		if err := s.subRepo.UpdateLastTriggeredValue(sub.ID, currentValue); err != nil {
			slog.Error("update first value failed", "sub_id", sub.ID, "error", err)
		}
		slog.Info("first fetch recorded", "sub_id", sub.ID, "value", currentValue)
		return
	}

	// 状态翻转判定：条件满足 且 值已变化
	if isMet && currentValue != sub.LastTriggeredValue {
		slog.Info("condition triggered", "sub_id", sub.ID,
			"last", sub.LastTriggeredValue, "current", currentValue)

		// 发送邮件通知
		subject := fmt.Sprintf("[订阅通知] %s 状态变更", sourceName)
		body := fmt.Sprintf(
			"数据源: %s\n当前值: %s\n上次值: %s\n条件: %s %s\n触发时间: 请登录查看详情",
			sourceName, currentValue, sub.LastTriggeredValue,
			sub.ConditionType, pkg.Describe(sub.ConditionType, sub.ConditionValue),
		)

		status := "success"
		var errMsg string
		if s.notifier != nil {
			if err := s.notifier.SendEmail(sub.UserEmail, subject, body); err != nil {
				status = "failed"
				errMsg = err.Error()
			}
		} else {
			slog.Warn("notifier not configured, skip sending", "to", sub.UserEmail)
		}

		// 更新 last_triggered_value 防止重复触发
		if err := s.subRepo.UpdateLastTriggeredValue(sub.ID, currentValue); err != nil {
			slog.Error("update last value failed", "sub_id", sub.ID, "error", err)
		}

		// 记录通知历史
		history := &model.NotificationHistory{
			SubscriptionID: sub.ID,
			TriggeredValue: currentValue,
			SentStatus:     status,
			ErrorMessage:   errMsg,
		}
		if err := s.histRepo.Create(history); err != nil {
			slog.Error("create history failed", "sub_id", sub.ID, "error", err)
		}
	} else if isMet && currentValue == sub.LastTriggeredValue {
		slog.Debug("condition met but value unchanged, skip", "sub_id", sub.ID, "value", currentValue)
	} else if !isMet && currentValue != sub.LastTriggeredValue {
		// 条件不再满足，仅更新记录值
		if err := s.subRepo.UpdateLastTriggeredValue(sub.ID, currentValue); err != nil {
			slog.Error("update last value failed", "sub_id", sub.ID, "error", err)
		}
	}
}
