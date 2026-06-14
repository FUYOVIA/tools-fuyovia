# 🚀 FUYOVIA AI Tools - 部署上线指南

## 第一步：环境准备

### 1.1 获取 OpenAI API Key
1. 访问 https://platform.openai.com/api-keys
2. 注册/登录 OpenAI 账号
3. 点击 "Create new secret key"
4. 复制 API Key（格式：`sk-...`）
5. ⚠️ 注意：API 调用按量计费，先充值 $5-10 测试用

### 1.2 创建 Supabase 项目
1. 访问 https://supabase.com
2. 点击 "New Project"
3. 填写：
   - Project name: `fuyovia-ai-tools`
   - Database Password: 记下这个密码！
   - Region: 选 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`（离用户最近）
4. 等待项目创建（约 2 分钟）
5. 进入项目 → Settings → API：
   - 复制 `URL` → 填入 `NEXT_PUBLIC_SUPABASE_URL`
   - 复制 `anon public` key → 填入 `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - 复制 `service_role` key → 填入 `SUPABASE_SERVICE_ROLE_KEY`

### 1.3 执行数据库 Schema
1. 在 Supabase 项目中 → SQL Editor
2. 复制 `supabase-schema.sql` 的全部内容
3. 粘贴到 SQL Editor
4. 点击 "Run" 执行

---

## 第二步：本地开发

### 2.1 配置环境变量
```bash
cd tools-fuyovia
cp .env.local.example .env.local
```

编辑 `.env.local`，填入：
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2.2 安装依赖并启动
```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`，应该能看到首页！

---

## 第三步：Stripe 支付配置（可选，先跑起来再配置）

### 3.1 创建 Stripe 账号
1. 访问 https://stripe.com
2. 注册账号（用真实邮箱）
3. 进入 Dashboard → Developers → API keys
4. 复制 `Secret key`（`sk_test_...`）→ 填入 `STRIPE_SECRET_KEY`
5. 复制 `Publishable key`（`pk_test_...`）→ 填入 `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### 3.2 创建产品（Stripe Products）
在 Stripe Dashboard → Products 创建：
- Starter: $9.9/月
- Pro: $19.9/月

复制 Price ID（`price_...`）备用。

---

## 第四步：部署到 Vercel

### 4.1 推送到 GitHub
```bash
cd tools-fuyovia
git init
git add .
git commit -m "Initial commit: FUYOVIA AI Tools"
git branch -M main
git remote add origin https://github.com/你的用户名/tools-fuyovia.git
git push -u origin main
```

### 4.2 导入 Vercel
1. 访问 https://vercel.com
2. 点击 "New Project"
3. 选择 GitHub 仓库 `tools-fuyovia`
4. 配置环境变量（复制 `.env.local` 的所有内容）
5. 点击 "Deploy"
6. 等待部署完成（约 2-3 分钟）
7. 获得生产域名：`https://tools-fuyovia.vercel.app`

### 4.3 绑定自定义域名
1. Vercel Dashboard → 项目 → Settings → Domains
2. 输入 `tools.fuyovia.com`
3. 按提示在域名服务商处添加 Vercel 提供的 DNS 记录
4. 等待 DNS 生效（约 10-30 分钟）

---

## 第五步：对接店匠（课程解锁）

### 5.1 在店匠后台创建 Webhook
1. 店匠开发者后台 → Webhooks → 创建
2. 回调 URL 填写：`https://tools.fuyovia.com/api/webhooks/shoplazza`
3. 事件选择：`orders/paid`
4. 复制 Webhook Secret → 填入 `SHOPLAZZA_WEBHOOK_SECRET`

### 5.2 配置课程-工具映射
在 Supabase SQL Editor 执行：
```sql
-- 示例：买"社交媒体课"解锁 "Social Media Writer"
insert into course_unlocks (user_id, course_sku, unlocked_tool_ids)
values (
  'user-uuid-here',
  'COURSE-SOCIAL-MEDIA',
  array['social-media-writer']
);
```

---

## 📋 检查清单

上线前确认：
- [ ] OpenAI API Key 已配置且有余额
- [ ] Supabase 项目已创建且 Schema 已执行
- [ ] `.env.local` 所有变量已填写
- [ ] 本地 `npm run dev` 能正常访问
- [ ] Vercel 部署成功
- [ ] 自定义域名 DNS 已生效
- [ ] Stripe 产品已创建（如需支付功能）
- [ ] 店匠 Webhook 已配置（如需课程解锁）

---

## 🆘 常见问题

**Q: OpenAI API 调用失败？**
A: 检查 API Key 是否正确，账户是否有余额。

**Q: Supabase 连接失败？**
A: 检查 URL 和 Key 是否正确，项目区域是否选对。

**Q: Vercel 部署失败？**
A: 查看 Build Logs，通常是环境变量缺失或 TypeScript 错误。

**Q: 域名 DNS 不生效？**
A: 等待 24-48 小时，或检查 DNS 记录是否填对。

---

*最后更新：2026-06-12*
