package model

import (
	"time"
)

// NotificationHistory 通知历史 —— 记录每次触发通知的发送结果
type NotificationHistory struct {
	ID             string    `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	SubscriptionID string    `json:"subscription_id" gorm:"type:uuid;not null;constraint:OnDelete:CASCADE"`
	TriggeredValue string    `json:"triggered_value" gorm:"type:varchar(255);not null"`
	SentStatus     string    `json:"sent_status" gorm:"type:varchar(20)"`
	ErrorMessage   string    `json:"error_message" gorm:"type:text"`
	SentAt         time.Time `json:"sent_at" gorm:"autoCreateTime"`
}
