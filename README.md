# 订阅通知中台

## 快速开始

### 后端

```bash
cd backend
cp .env.example .env  # 编辑 .env，填入 Supabase DSN 和 SMTP 配置
go run ./cmd/server/
```

### 前端

```bash
cd frontend
pnpm install
pnpm dev
```

前端运行在 http://localhost:5173，通过 Vite 代理连接到后端 http://localhost:8080。

## 技术栈

| 层级 | 技术 |
| :--- | :--- |
| 前端 | React 19 + Vite 6 + Tailwind CSS 3.4 |
| 后端 | Go 1.22+ + Gin + GORM |
| 数据库 | Supabase (PostgreSQL 15) |
| 调度器 | robfig/cron/v3 |
| 状态管理 | @tanstack/react-query + zustand |
