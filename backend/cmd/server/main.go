package main

import (
	"fmt"
	"log"
	"log/slog"
	"net/http"

	"subscription-notification/internal/controller"
	"subscription-notification/internal/model"
	"subscription-notification/internal/pkg"
	"subscription-notification/internal/repository"
	"subscription-notification/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

func main() {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()
	if err := viper.ReadInConfig(); err != nil {
		slog.Warn("no .env file found, using env vars", "error", err)
	}

	port := viper.GetString("PORT")
	if port == "" {
		port = "8080"
	}

	dsn := viper.GetString("DB_DSN")
	if dsn == "" {
		log.Fatal("DB_DSN not configured")
	}

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{
		Logger: gormlogger.Default.LogMode(gormlogger.Warn),
	})
	if err != nil {
		log.Fatalf("connect database: %v", err)
	}

	if err := db.AutoMigrate(
		&model.DataSource{},
		&model.Subscription{},
		&model.NotificationHistory{},
	); err != nil {
		log.Fatalf("auto migrate: %v", err)
	}
	slog.Info("database migrated")

	seedMockData(db)

	dsRepo := repository.NewDataSourceRepo(db)
	subRepo := repository.NewSubscriptionRepo(db)
	histRepo := repository.NewNotificationHistoryRepo(db)

	dsSvc := service.NewDataSourceService(dsRepo)
	subSvc := service.NewSubscriptionService(subRepo)

	var notifier *pkg.Notifier
	smtpHost := viper.GetString("SMTP_HOST")
	if smtpHost != "" {
		notifier = pkg.NewNotifier(
			smtpHost,
			viper.GetInt("SMTP_PORT"),
			viper.GetString("SMTP_USER"),
			viper.GetString("SMTP_PASS"),
		)
		slog.Info("email notifier configured")
	} else {
		slog.Warn("SMTP not configured, notifications will be logged only")
	}

	scheduler := service.NewSchedulerService(dsRepo, subRepo, histRepo, notifier)
	if err := scheduler.Start(); err != nil {
		log.Fatalf("start scheduler: %v", err)
	}
	defer scheduler.Stop()

	dsCtl := controller.NewDataSourceController(dsSvc)
	subCtl := controller.NewSubscriptionController(subSvc)

	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery())

	api := r.Group("/api")
	{
		api.GET("/health", controller.HealthCheck)

		sources := api.Group("/datasources")
		{
			sources.GET("", dsCtl.List)
			sources.GET("/:id", dsCtl.GetByID)
			sources.POST("", dsCtl.Create)
			sources.PUT("/:id", func(ctx *gin.Context) {
				dsCtl.Update(ctx)
				scheduler.Reload()
			})
			sources.DELETE("/:id", func(ctx *gin.Context) {
				dsCtl.Delete(ctx)
				scheduler.Reload()
			})
		}

		subscriptions := api.Group("/subscriptions")
		{
			subscriptions.GET("", subCtl.List)
			subscriptions.GET("/:id", subCtl.GetByID)
			subscriptions.POST("", subCtl.Create)
			subscriptions.PUT("/:id", subCtl.Update)
			subscriptions.DELETE("/:id", subCtl.Delete)
		}
	}

	addr := fmt.Sprintf(":%s", port)
	slog.Info("server starting", "addr", addr)
	if err := http.ListenAndServe(addr, r); err != nil {
		log.Fatalf("server: %v", err)
	}
}

func seedMockData(db *gorm.DB) {
	var count int64
	db.Model(&model.DataSource{}).Count(&count)
	if count > 0 {
		return
	}

	mock := &model.DataSource{
		Name:         "QDII基金限购状态",
		Endpoint:     "https://httpbin.org/json",
		Method:       "GET",
		Headers:      `{}`,
		ParsePath:    "slideshow.title",
		CronSchedule: "0 */5 * * * *",
		IsActive:     true,
	}
	if err := db.Create(mock).Error; err != nil {
		slog.Warn("seed mock data failed", "error", err)
		return
	}
	slog.Info("seed mock data inserted", "name", mock.Name)
}