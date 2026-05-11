# 部署指南

## 方式一：Vercel 临时域名（推荐快速测试）

### 第一步：创建 GitHub 仓库并推送代码

1. 打开 https://github.com 并登录
2. 点击右上角 **+** → **New repository**
3. 仓库名称填：`container-platform`
4. 选择 **Private**（私有）
5. 点击 **Create repository**
6. 在页面下方找到 "…or push an existing repository from the command line"，复制命令粘贴执行：

```bash
cd C:\Users\Admin\.openclaw\workspace\container-platform
git remote add origin https://github.com/YOUR_USERNAME/container-platform.git
git branch -M main
git push -u origin main
```

把 `YOUR_USERNAME` 替换为你的 GitHub 用户名。

### 第二步：Vercel 部署

1. 打开 https://vercel.com 并用 GitHub 账号登录
2. 点击 **Add New...** → **Project**
3. 选择刚创建的 `container-platform` 仓库
4. 在 **Environment Variables** 中添加：
   - `NEXT_PUBLIC_SUPABASE_URL` = 你的 Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = 你的 Supabase anon/public key
5. 点击 **Deploy**

部署完成后 Vercel 会给你一个临时域名（如 `container-platform.vercel.app`）。

---

## 方式二：Supabase（免费 PostgreSQL + Auth）

1. 打开 https://supabase.com 注册/登录
2. 点击 **New Project**，项目名称：`container-platform`
3. 等待创建完成，获取 **Project URL** 和 **API Key**（Settings → API）
4. 在 **SQL Editor** 中运行 `supabase/schema.sql`
5. 把获取的值填入 Vercel 的环境变量

---

## 完成后配置

部署成功后需要：
1. 在 Supabase Dashboard 的 **Authentication** → **URL Configuration** 中添加 Vercel 给的临时域名到 **Site URL** 和 **Redirect URLs**
2. 测试各页面是否正常

---

## 平台访问地址

- 首页：`https://你的域名/`
- 库存查询：`https://你的域名/inventory`
- 询价表单：`https://你的域名/quote`
- 客户登录：`https://你的域名/auth/login`
- 管理后台：`https://你的域名/admin`