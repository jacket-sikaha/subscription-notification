package repository

import (
	"subscription-notification/internal/model"

	"gorm.io/gorm"
)

type SubscriptionRepo interface {
	List() ([]model.Subscription, error)
	ListBySourceID(sourceID string) ([]model.Subscription, error)
	ListEnabledBySourceID(sourceID string) ([]model.Subscription, error)
	GetByID(id string) (*model.Subscription, error)
	Create(sub *model.Subscription) error
	Update(sub *model.Subscription) error
	UpdateLastTriggeredValue(id, value string) error
	Delete(id string) error
}

type subscriptionRepo struct{ db *gorm.DB }

func NewSubscriptionRepo(db *gorm.DB) SubscriptionRepo {
	return &subscriptionRepo{db: db}
}

func (r *subscriptionRepo) List() ([]model.Subscription, error) {
	var rows []model.Subscription
	err := r.db.Order("created_at DESC").Find(&rows).Error
	return rows, err
}

func (r *subscriptionRepo) ListBySourceID(sourceID string) ([]model.Subscription, error) {
	var rows []model.Subscription
	err := r.db.Where("source_id = ?", sourceID).Find(&rows).Error
	return rows, err
}

func (r *subscriptionRepo) ListEnabledBySourceID(sourceID string) ([]model.Subscription, error) {
	var rows []model.Subscription
	err := r.db.Where("source_id = ? AND enabled = ?", sourceID, true).Find(&rows).Error
	return rows, err
}

func (r *subscriptionRepo) GetByID(id string) (*model.Subscription, error) {
	var sub model.Subscription
	err := r.db.First(&sub, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

func (r *subscriptionRepo) Create(sub *model.Subscription) error {
	return r.db.Create(sub).Error
}

func (r *subscriptionRepo) Update(sub *model.Subscription) error {
	return r.db.Save(sub).Error
}

func (r *subscriptionRepo) UpdateLastTriggeredValue(id, value string) error {
	return r.db.Model(&model.Subscription{}).Where("id = ?", id).Update("last_triggered_value", value).Error
}

func (r *subscriptionRepo) Delete(id string) error {
	return r.db.Delete(&model.Subscription{}, "id = ?", id).Error
}
