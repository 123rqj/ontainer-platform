# 订箱平台 - 项目规格

## 1. Concept & Vision

面向全球货代的集装箱租赁平台，让客户轻松查询可用箱量、发起询价、管理订单。界面简洁专业，信息层次清晰，以蓝色航海风格为主调，传达信任与效率。

## 2. Design Language

**Aesthetic Direction**: 现代航运风格 — 深蓝+白色为主，配以橙色点缀，传达专业与活力

**Color Palette**:
- Primary: #1E3A5F (深海蓝)
- Secondary: #2563EB (航海蓝)
- Accent: #F97316 (橙色，用于CTA按钮)
- Background: #F8FAFC
- Text Primary: #1E293B
- Text Secondary: #64748B
- Success: #10B981
- Warning: #F59E0B
- Error: #EF4444

**Typography**:
- Headings: Inter (bold)
- Body: Inter (regular)
- Fallback: system-ui, sans-serif

**Spatial System**:
- Base unit: 4px
- Section padding: 64px vertical
- Card padding: 24px
- Gap: 16px / 24px

**Motion**:
- Transitions: 200ms ease-out
- Hover states: scale(1.02) on cards
- Loading: skeleton shimmer

## 3. Layout & Structure

**页面结构**:
- `/` - 首页：Hero + 箱型展示 + 快速询价入口
- `/inventory` - 库存查询：实时可用箱量显示
- `/quote` - 询价表单：游客可提交
- `/auth/login` - 客户登录
- `/auth/register` - 客户注册
- `/dashboard` - 客户订单管理（需登录）
- `/admin` - 内部管理后台（箱号管理、订单处理）
- `/admin/containers` - 箱号精细管理

**响应式策略**: Mobile-first，支持手机/平板/PC

## 4. Features & Interactions

### 4.1 库存展示
- 按箱型显示可用数量（数量维度）
- 客户可见：40HQ 110个可用
- 状态：可用 / 已预订 / 在租 / 维修中

### 4.2 询价系统（游客可用）
- 表单字段：起运地、目的港、箱型、箱量、租期、预计用箱时间、联系人信息
- 提交后发送邮件通知管理员
- 生成询价单号，客户可查状态

### 4.3 客户系统
- 注册：邮箱 + 密码
- 登录后：可管理自己的订单
- 订单状态：待报价 → 已报价（待确认）→ 已确认 → 在租 → 已归还

### 4.4 邮件通知
- 触发条件：询价提交、报价通知、订单状态变更
- 发件人：renqinjiang@ylghwl.cn
- 使用 Supabase Edge Functions + SMTP

### 4.5 箱号管理（内部）
- 110个40HQ的箱号列表（格式：YLGH-40HQ-001 ~ YLGH-40HQ-110）
- 每个箱号状态：在库 / 已预订 / 在租 / 维修
- 订单关联具体箱号

## 5. Component Inventory

### Header
- Logo + 平台名称
- 导航：首页 | 库存 | 询价 | 登录/个人中心
- 移动端：汉堡菜单

### Hero Section
- 大标题 + 副标题
- CTA按钮：立即询价 / 查看库存

### Container Card
- 箱型图标 + 名称
- 可用数量（大数字）
- 状态标签
- Hover: 轻微放大 + 阴影加深

### Quote Form
- 必填字段带 * 标记
- 字段：起运地、目的港、箱型(下拉)、箱量(数字)、租期(天数)、预计用箱时间(日期)、联系人、邮箱、电话
- 提交按钮：accent色
- 成功：显示询价单号 + 提示邮件通知

### Order Card
- 订单号、箱型、箱量、起运地、目的港、状态标签、创建时间
- 状态颜色：待报价(黄) → 已报价(蓝) → 已确认(绿) → 在租(紫) → 已归还(灰)

### Admin Container Table
- 箱号、状态、当前订单、位置
- 可筛选状态

## 6. Technical Approach

**Framework**: Next.js 14+ (App Router)
**Styling**: Tailwind CSS
**Database**: Supabase (PostgreSQL)
**Auth**: Supabase Auth
**Email**: Supabase Edge Functions + Nodemailer (SMTP)
**Deployment**: Vercel

### 数据库设计

**表: containers**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| container_no | text | 箱号（唯一，如 YLGH-40HQ-001）|
| type | text | 箱型（40HQ/40HC/20GP等）|
| status | text | 在库/已预订/在租/维修 |
| current_order_id | uuid | 当前关联订单（可空）|
| created_at | timestamp | 创建时间 |

**表: quotes**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| quote_no | text | 询价单号（QT-YYYYMMDD-XXX）|
| origin | text | 起运地 |
| destination | text | 目的港 |
| container_type | text | 箱型 |
| quantity | integer | 箱量 |
| lease_days | integer | 租期（天）|
| estimated_date | date | 预计用箱日期 |
| contact_name | text | 联系人 |
| contact_email | text | 邮箱 |
| contact_phone | text | 电话 |
| status | text | pending/quoted/confirmed |
| created_at | timestamp | 创建时间 |

**表: orders**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| order_no | text | 订单号（SO-YYYYMMDD-XXX）|
| quote_id | uuid | 关联询价单 |
| container_ids | uuid[] | 分配的箱号 |
| rent_usd | decimal | 租金（美元）|
| loss_fee_usd | decimal | 灭失费用（美元）|
| status | text | confirmed/in-use/returned |
| created_at | timestamp | 创建时间 |

**表: users**
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键（Supabase Auth）|
| email | text | 邮箱 |
| company | text | 公司名称 |
| phone | text | 电话 |
| created_at | timestamp | 创建时间 |
