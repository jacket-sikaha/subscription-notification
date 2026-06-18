package service

import (
	"errors"

	"subscription-notification/internal/model"
	"subscription-notification/internal/repository"

	"gorm.io/gorm"
)

type SubscriptionService struct {
	repo repository.SubscriptionRepo
}

func NewSubscriptionService(repo repository.SubscriptionRepo) *SubscriptionService {
	return &SubscriptionService{repo: repo}
}

func (s *SubscriptionService) List() ([]model.Subscription, error) {
	return s.repo.List()
}

func (s *SubscriptionService) GetByID(id string) (*model.Subscription, error) {
	return s.repo.GetByID(id)
}

func (s *SubscriptionService) Create(sub *model.Subscription) error {
	if sub.UserEmail == "" || sub.SourceID == "" || sub.ConditionType == "" || sub.ConditionValue == "" {
		return errors.New("user_email, source_id, condition_type and condition_value are required")
	}
	return s.repo.Create(sub)
}

func (s *SubscriptionService) Update(sub *model.Subscription) error {
	existing, err := s.repo.GetByID(sub.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("subscription not found")
		}
		return err
	}
	existing.UserEmail = sub.UserEmail
	existing.ConditionType = sub.ConditionType
	existing.ConditionValue = sub.ConditionValue
	existing.Enabled = sub.Enabled
	return s.repo.Update(existing)
}

func (s *SubscriptionService) Delete(id string) error {
	return s.repo.Delete(id)
}
