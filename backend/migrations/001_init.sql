-- ============================================
-- 订阅通知中台 — 数据库初始化 DDL
-- 适配: Supabase (PostgreSQL 15)
-- ============================================

-- 数据源配置表
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    endpoint TEXT NOT NULL,
    method VARCHAR(10) NOT NULL DEFAULT 'GET',
    headers JSONB DEFAULT '{}',
    body_template TEXT,
    parse_path VARCHAR(255) NOT NULL,
    cron_schedule VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 订阅表
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) NOT NULL,
    source_id UUID REFERENCES data_sources(id) ON DELETE CASCADE,
    condition_type VARCHAR(20) NOT NULL,
    condition_value VARCHAR(255) NOT NULL,
    last_triggered_value VARCHAR(255),
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 通知历史表
CREATE TABLE IF NOT EXISTS notification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    triggered_value VARCHAR(255) NOT NULL,
    sent_status VARCHAR(20),
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_subscriptions_source_id ON subscriptions(source_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_enabled ON subscriptions(enabled);
CREATE INDEX IF NOT EXISTS idx_notification_history_subscription_id ON notification_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_is_active ON data_sources(is_active);
