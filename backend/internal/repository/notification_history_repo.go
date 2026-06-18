package repository

import (
	"subscription-notification/internal/model"

	"gorm.io/gorm"
)

type NotificationHistoryRepo interface {
	ListBySubscriptionID(subID string) ([]model.NotificationHistory, error)
	Create(history *model.NotificationHistory) error
}

type notificationHistoryRepo struct{ db *gorm.DB }

func NewNotificationHistoryRepo(db *gorm.DB) NotificationHistoryRepo {
	return &notificationHistoryRepo{db: db}
}

func (r *notificationHistoryRepo) ListBySubscriptionID(subID string) ([]model.NotificationHistory, error) {
	var rows []model.NotificationHistory
	err := r.db.Where("subscription_id = ?", subID).Order("sent_at DESC").Find(&rows).Error
	return rows, err
}

func (r *notificationHistoryRepo) Create(history *model.NotificationHistory) error {
	return r.db.Create(history).Error
}
