package model

import (
	"time"
)

// Subscription 订阅配置 —— 绑定用户邮箱与数据源，定义触发条件
type Subscription struct {
	ID                 string    `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	UserEmail          string    `json:"user_email" gorm:"type:varchar(255);not null"`
	SourceID           string    `json:"source_id" gorm:"type:uuid;not null;constraint:OnDelete:CASCADE"`
	ConditionType      string    `json:"condition_type" gorm:"type:varchar(20);not null"`
	ConditionValue     string    `json:"condition_value" gorm:"type:varchar(255);not null"`
	LastTriggeredValue string    `json:"last_triggered_value" gorm:"type:varchar(255)"`
	Enabled            bool      `json:"enabled" gorm:"default:true"`
	CreatedAt          time.Time `json:"created_at" gorm:"autoCreateTime"`
	Source             *DataSource `json:"source,omitempty" gorm:"foreignKey:SourceID"`
}
