package model

import (
	"time"
)

// DataSource 数据源配置 —— 定义抓取目标（API端点、解析路径、Cron调度）
type DataSource struct {
	ID           string    `json:"id" gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
	Name         string    `json:"name" gorm:"type:varchar(255);not null"`
	Endpoint     string    `json:"endpoint" gorm:"type:text;not null"`
	Method       string    `json:"method" gorm:"type:varchar(10);not null;default:GET"`
	Headers      string    `json:"headers" gorm:"type:jsonb;default:'{}'"`
	BodyTemplate string    `json:"body_template" gorm:"type:text"`
	ParsePath    string    `json:"parse_path" gorm:"type:varchar(255);not null"`
	CronSchedule string    `json:"cron_schedule" gorm:"type:varchar(50);not null"`
	IsActive     bool      `json:"is_active" gorm:"default:true"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
}
