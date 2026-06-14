# FUYOVIA AI Tools - 部署指南

## ✅ 当前状态

- 20 个工具已全部可运行（本地构建成功）
- 免费工具：浏览器端直接运行，无需任何 API
- AI 工具：免费试用模式，调用 OpenAI API（需配置 API Key）
- 代码已提交到本地 Git 仓库（`main` 分支）

---

## 🚀 部署步骤（共 3 步）

### 第 1 步：推送到 GitHub

1. 登录 GitHub，新建仓库：
   - 仓库名：`tools-fuyovia`
   - 可见性：Public（Vercel 免费版支持公开仓库）
   - 不要勾选"Initialize with README"

2. 在本地执行（替换为你的 GitHub 用户名）：
```bash
cd "D:\A福优未界\3AI部署工具\全球网站数据\2026-06-10-15-59-36\tools-fuyovia"
git remote add origin https://github.com/FUYOVIA/tools-fuyovia.git
git push -u origin main
```

> 如果提示需要登录，用 GitHub Token（设置 → Developer settings → Personal access tokens → 生成 token，勾选 `repo` 权限）

---

### 第 2 步：部署到 Vercel

1. 登录 [vercel.com](https://vercel.com)（用 GitHub 账号登录）
2. 点击 "Add New" → "Project"
3. 选择 `FUYOVIA/tools-fuyovia` 仓库 → Import
4. 配置环境变量（在 "Environment Variables" 区域添加）：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `OPENAI_API_KEY` | `sk-...` | **必需** - 你的 OpenAI API Key |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://placeholder.supabase.co` | 暂时用占位符（无需 Supabase） |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `placeholder` | 暂时用占位符 |
| `SUPABASE_SERVICE_ROLE_KEY` | `placeholder` | 暂时用占位符 |
| `NEXT_PUBLIC_SITE_URL` | `https://tools.fuyovia.com` | 你的工具站点域名 |

5. 点击 "Deploy" — 等待 2-3 分钟

6. 部署成功后，Vercel 会给你一个临时域名：
   - 例如：`https://tools-fuyovia-xxx.vercel.app`
   - **记下这个 URL！**

---

### 第 3 步：绑定自定义域名（可选，推荐）

1. 在 Vercel 项目页面 → "Settings" → "Domains"
2. 输入：`tools.fuyovia.com`
3. 按 Vercel 提示，去你的域名服务商（阿里云/腾讯云等）添加 CNAME 记录：
   - 主机记录：`tools`
   - 记录类型：`CNAME`
   - 记录值：`cname.vercel-dns.com`
4. 等待 DNS 生效（10 分钟 ~ 24 小时）
5. 生效后访问 `https://tools.fuyovia.com` 确认可以打开

---

## 🔗 第 4 步：更新店匠主页链接

部署成功后，需要把店匠主页（`fuyovia-tools.html`）里的工具链接改成 Vercel 的 URL。

**需要修改的链接格式：**
- 原来：`/free/image-compressor`
- 改为：`https://tools.fuyovia.com/free/image-compressor`
- 或（用自定义域名）：`https://tools.fuyovia.com/free/image-compressor`

**等我部署成功后，我会自动更新 `fuyovia-tools.html` 并给你最新的文件。**

---

## 🧪 测试工具是否正常工作

部署后，访问你的工具站点，逐个测试：

### 免费工具（应该立刻能用）
- `https://your-url.com/free/image-compressor` — 上传图片，压缩，下载
- `https://your-url.com/free/qr-generator` — 输入 URL，生成二维码
- `https://your-url.com/free/json-formatter` — 粘贴 JSON，格式化

### AI 工具（需要 OpenAI API Key）
- `https://your-url.com/premium/ai-humanizer` — 粘贴 AI 生成的文字，点击 Humanize
- `https://your-url.com/premium/social-media-writer` — 输入内容，选择平台，生成文案

如果 OpenAI API Key 没配置，AI 工具会返回错误："AI API not configured"。

---

## 📋 环境变量说明

| 变量 | 是否必需 | 获取方式 |
|------|---------|---------|
| `OPENAI_API_KEY` | ✅ 必需 | [platform.openai.com](https://platform.openai.com/api-keys) 创建 |
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ 非必需 | 后期需要用户系统再配置 |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ 非必需 | 同上 |
| `STRIPE_SECRET_KEY` | ❌ 非必需 | 后期需要支付再配置 |

**前期只需配置 `OPENAI_API_KEY`，其他用占位符即可。**

---

## 🚨 常见问题

### 部署后打开空白页？
- 检查 Vercel 的 "Deployments" 页面，看 Build Logs 有没有报错
- 确认环境变量 `OPENAI_API_KEY` 已填写

### AI 工具返回 "AI API not configured"？
- 确认 `OPENAI_API_KEY` 环境变量已正确填写（以 `sk-` 开头）
- 在 Vercel 重新部署（Redeploy）

### 免费工具能用，AI 工具报错？
- 检查 OpenAI API Key 是否有余额（去 OpenAI 控制台查看）
- 检查 API Key 是否有权限调用 GPT-4o-mini 模型

---

## 📞 需要帮助？

把以下信息发给我：
1. Vercel 部署日志（截图或文字）
2. 浏览器控制台报错（F12 → Console）
3. 具体哪个工具不能用

我会帮你排查。
