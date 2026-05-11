# 毅联国际 - 集装箱租赁平台

国际集装箱租赁在线平台，支持询价、订单管理、库存查询、邮件通知。

## 技术栈

- **前端**: Next.js 14 + TypeScript + Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **邮件**: Supabase Edge Functions + SMTP
- **部署**: Vercel

## 快速开始

### 1. 初始化 Supabase

1. 创建 [Supabase 项目](https://supabase.com)
2. 在 SQL Editor 中运行 `supabase/schema.sql`
3. 获取 `Project URL` 和 `anon/public` key

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

填入以下值：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. 安装并运行

```bash
npm install
npm run dev
```

访问 http://localhost:3000

### 4. 部署到 Vercel

```bash
npm i -g vercel
vercel
```

在 Vercel Dashboard 中添加同样的环境变量。

## 主要功能

| 页面 | 说明 | 访问 |
|------|------|------|
| `/` | 首页 | 公开 |
| `/inventory` | 库存查询 | 公开 |
| `/quote` | 提交询价 | 公开 |
| `/auth/login` | 客户登录 | 公开 |
| `/auth/register` | 客户注册 | 公开 |
| `/dashboard` | 客户控制台 | 需登录 |
| `/admin` | 管理后台 | 需登录 |

## 邮件配置

邮件通过 Supabase Edge Function 发送。配置以下环境变量：

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-password
SMTP_FROM=your@email.com
ADMIN_EMAIL=renqinjiang@ylghwl.cn
```

## 数据库

主要表结构：

- `containers` - 集装箱箱号管理（110个40HQ初始化）
- `quotes` - 询价单
- `orders` - 订单
- `profiles` - 用户扩展信息