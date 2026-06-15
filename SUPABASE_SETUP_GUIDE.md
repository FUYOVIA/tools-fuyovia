# FUYOVIA 社区 Supabase 配置完整教程

> 目标：5步完成社区论坛的数据库和登录系统配置
> 预计时间：15分钟
> 前提：国内网络可正常访问 supabase.com

---

## 第一步：创建 Supabase 项目（3分钟）

### 1.1 注册/登录
1. 打开浏览器，访问 **https://supabase.com**
2. 点击右上角 **"Start your project"**
3. 用 GitHub 账号登录（推荐）或用邮箱注册

### 1.2 创建新项目
1. 登录后，点击 **"New Project"**
2. 填写项目信息：

| 字段 | 填写内容 |
|------|----------|
| **Name** | `fuyovia-community` |
| **Database Password** | 自己设一个密码（记下来！之后要用） |
| **Region** | 选 **Northeast Asia (Tokyo)** 或 **Southeast Asia (Singapore)**（离你最近） |
| **Plan** | Free（免费版足够） |

3. 点击 **"Create new project"**
4. 等待约 1-2 分钟，项目创建完成

---

## 第二步：运行数据库迁移 SQL（2分钟）

### 2.1 打开 SQL 编辑器
1. 在左侧菜单，点击 **"SQL Editor"**（图标是一个 `</>` 符号）
2. 点击 **"New Query"**

### 2.2 粘贴并执行 SQL
1. 把下面的**完整 SQL 代码**全部复制粘贴到编辑器中：

```sql
-- FUYOVIA Community Database Schema
-- Run this in your Supabase Dashboard > SQL Editor

-- ============================================================
-- TABLE: discussions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.discussions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('all', 'feedback', 'bug_report', 'feature_request', 'general')),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  author_avatar TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'under_review', 'planned', 'implemented', 'closed')),
  votes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discussions_category ON public.discussions(category);
CREATE INDEX IF NOT EXISTS idx_discussions_status ON public.discussions(status);
CREATE INDEX IF NOT EXISTS idx_discussions_author ON public.discussions(author_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created ON public.discussions(created_at DESC);

-- ============================================================
-- TABLE: comments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'Anonymous',
  author_avatar TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_discussion ON public.comments(discussion_id, created_at ASC);

-- ============================================================
-- TABLE: votes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID NOT NULL REFERENCES public.discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(discussion_id, user_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Anyone can read (public community)
CREATE POLICY "Discussions are publicly viewable" ON public.discussions
  FOR SELECT USING (true);

CREATE POLICY "Comments are publicly viewable" ON public.comments
  FOR SELECT USING (true);

-- Authenticated users can create
CREATE POLICY "Authenticated users can create discussions" ON public.discussions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Author can update/delete their own discussion
CREATE POLICY "Authors can update own discussions" ON public.discussions
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own discussions" ON public.discussions
  FOR DELETE USING (auth.uid() = author_id);

-- Authenticated users can vote (toggle)
CREATE POLICY "Authenticated users can vote" ON public.votes
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- HELPER FUNCTIONS for atomic count updates
-- ============================================================

CREATE OR REPLACE FUNCTION increment_votes_count(p_disc_id UUID)
RETURNS INTEGER AS $$
BEGIN
  UPDATE public.discussions SET votes_count = votes_count + 1 WHERE id = p_disc_id;
  RETURN COALESCE((SELECT votes_count FROM public.discussions WHERE id = p_disc_id), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_votes_count(p_disc_id UUID)
RETURNS INTEGER AS $$
BEGIN
  UPDATE public.discussions SET votes_count = GREATEST(0, votes_count - 1) WHERE id = p_disc_id;
  RETURN COALESCE((SELECT votes_count FROM public.discussions WHERE id = p_disc_id), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_comments_count(p_disc_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.discussions SET comments_count = comments_count + 1 WHERE id = p_disc_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Seed data: Welcome post from FUYOVIA team
-- ============================================================
INSERT INTO public.discussions (title, content, category, author_id, author_name, author_avatar, status)
VALUES (
  'Welcome to the FUYOVIA Community!',
  'We are thrilled to have you here!\n\nThis is where you can:\n\n• **Suggest new features** — Tell us what tools or improvements you''d love to see\n• **Report bugs** — Help us identify and fix issues faster\n• **Share feedback** — Let us know what works well and what doesn''t\n• **Chat with others** — Connect with fellow creators using our AI tools\n\n## How it works\n1. **Sign in** with email, Google, or Facebook to participate\n2. **Upvote** ideas you care about — popular ones get prioritized\n3. **Leave comments** with detailed thoughts and use cases\n4. **Track progress** — We update statuses as we work on requests\n\nWe read every single discussion. Your voice directly shapes what we build next.\n\n— The FUYOVIA Team',
  'feedback',
  '00000000-0000-0000-0000-000000000001',
  'FUYOVIA Team',
  null,
  'implemented'
) ON CONFLICT DO NOTHING;

-- Grant anon key user permission to execute functions
GRANT EXECUTE ON FUNCTION increment_votes_count TO anon;
GRANT EXECUTE ON FUNCTION decrement_votes_count TO anon;
GRANT EXECUTE ON FUNCTION increment_comments_count TO anon;
```

2. 点击右下角绿色按钮 **"Run"**（或按 `Ctrl+Enter`）
3. 看到 **"Success"** 绿色提示 = 执行成功

### 2.3 验证表已创建
1. 左侧菜单点击 **"Table Editor"**
2. 应该看到 3 个表：`discussions`、`comments`、`votes`
3. 点击 `discussions` 表，应该能看到一条 "Welcome to the FUYOVIA Community!" 的数据

---

## 第三步：获取 API 密钥（1分钟）

### 3.1 找到 Project URL 和 Anon Key
1. 左侧菜单点击 **"Settings"**（齿轮图标）
2. 点击 **"API"**
3. 你会看到两个关键值：

| 名称 | 示例格式 | 说明 |
|------|----------|------|
| **Project URL** | `https://abcdefghijk.supabase.co` | 项目地址 |
| **anon public** | `eyJhbGciOiJIUzI1NiIs...`（很长的字符串） | 公开密钥 |

4. **把这两个值复制保存下来**（下面 Vercel 配置要用）

### 3.2 获取 Service Role Key（后台管理用）
1. 同一个页面，往下滚动
2. 找到 **"service_role secret"**（标注了 "secret" 的那个）
3. 点击 **"Reveal"** 显示，复制保存

> ⚠️ **安全提醒**：service_role key 拥有完全数据库权限，绝不能暴露到前端代码！

---

## 第四步：配置 Vercel 环境变量（2分钟）

### 4.1 打开 Vercel 项目设置
1. 访问 **https://vercel.com** 并登录
2. 进入 **fuyovia** 项目（即 tools.fuyovia.com 对应的项目）
3. 点击顶部 **"Settings"**
4. 左侧选择 **"Environment Variables"**

### 4.2 添加 3 个环境变量

点击 "Add New"，逐个添加以下变量：

| 变量名 | 填写内容 | Environment |
|--------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Project URL（如 `https://abcdefghijk.supabase.co`） | Production, Preview, Development 全选 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 anon public key（长字符串） | Production, Preview, Development 全选 |
| `SUPABASE_SERVICE_ROLE_KEY` | 你的 service_role secret key | Production, Preview, Development 全选 |

每个变量：
1. 在 **Name** 输入变量名（如 `NEXT_PUBLIC_SUPABASE_URL`）
2. 在 **Value** 粘贴对应的值
3. **Environments** 三个都勾选（Production + Preview + Development）
4. 点击 **"Save"**

### 4.3 触发重新部署
添加完 3 个变量后，需要重新部署才能生效：
1. 回到项目主页，点击 **"Deployments"**
2. 找到最新的一条部署记录
3. 点击右侧 **"..."** 菜单 → **"Redeploy"**
4. 点击 **"Redeploy"** 确认

---

## 第五步：开启邮件认证 + 关闭邮箱确认（5分钟）

### 5.1 确认 Email 认证已开启
1. 回到 Supabase Dashboard
2. 左侧菜单点击 **"Authentication"**
3. 点击 **"Providers"**
4. 找到 **"Email"** 行
5. 确认右侧开关是 **打开** 状态（蓝色）
6. 如果关闭，点击打开它

### 5.2 关闭"注册需确认邮箱"（重要！）

> 默认情况下，Supabase 注册后会发确认邮件，用户必须点链接才能登录。
> 但你的社区刚上线，邮件服务可能延迟或进垃圾箱。
> **建议先关闭确认，让用户注册后直接能用，等稳定后再开启。**

1. 还是在 **Authentication** → **Providers** → **Email** 页面
2. 往下看，找到 **"Confirm email"** 选项
3. 把 **"Enable email confirmations"** 的开关 **关闭**（灰色）
4. 点击 **"Save"** 保存

### 5.3 配置邮件模板（可选，以后再做）

如果你想自定义注册确认邮件的内容和样式：
1. Authentication → **Email Templates**
2. 可以编辑 "Confirm signup"、"Reset password" 等模板
3. **现在不用管，默认就行**

---

## 第六步：配置 Site URL（1分钟）

> 这个设置告诉 Supabase 你的网站域名，OAuth 回调和邮件链接会用到。

1. 在 Supabase Dashboard，左侧 **"Authentication"**
2. 点击 **"URL Configuration"**
3. 找到 **"Site URL"**，填入：`https://tools.fuyovia.com`
4. 找到 **"Redirect URLs"**，点击 **"Add URL"**，添加：
   - `https://tools.fuyovia.com/auth/callback`
5. 点击 **"Save"**

---

## 第七步：验证社区是否正常工作（1分钟）

### 7.1 浏览器测试
1. 打开 **https://tools.fuyovia.com/community**
2. 应该能看到 "Welcome to the FUYOVIA Community!" 帖子
3. 点击 **"Sign in to participate"** 或 **"New Discussion"**
4. 在弹窗中：
   - 切换到 **"Sign up free"**
   - 输入 Display Name、Email、Password
   - 点击 **"🚀 Create Account"**
5. 注册成功后，尝试：
   - 发一条新帖子
   - 给帖子投票（👍）
   - 发一条评论

### 7.2 如果遇到问题

| 问题 | 可能原因 | 解决方法 |
|------|----------|----------|
| 页面空白/报错 | Vercel 环境变量没生效 | 检查第四步，确认 3 个变量都正确，重新部署 |
| 注册后提示 "Email not confirmed" | 第五步没关闭邮箱确认 | 回 Supabase 关闭 "Enable email confirmations" |
| 能看帖子但不能发帖 | RLS 策略问题 | 检查第二步 SQL 是否完整执行 |
| 点击 Google/Facebook 按钮报错 | OAuth 未配置 | 正常，暂不需要配置，用邮箱登录即可 |

---

## 未来可选：配置 Google/Facebook OAuth

> 当你有条件翻墙访问 Google Cloud Console 和 Facebook Developers 时再配置。

### Google OAuth 配置步骤（需要翻墙）：
1. 访问 https://console.cloud.google.com
2. 创建项目 → 启用 Google+ API → 创建 OAuth 客户端
3. 授权重定向 URL 填：`https://你的项目ID.supabase.co/auth/v1/callback`
4. 复制 Client ID + Client Secret
5. 回 Supabase → Authentication → Providers → Google → 填入 → 保存

### Facebook OAuth 配置步骤（需要翻墙）：
1. 访问 https://developers.facebook.com
2. 创建应用 → 添加 Facebook 登录 → 设置
3. 有效 OAuth 重定向 URI 填：`https://你的项目ID.supabase.co/auth/v1/callback`
4. 复制 App ID + App Secret
5. 回 Supabase → Authentication → Providers → Facebook → 填入 → 保存

---

## 总结清单

| 步骤 | 操作 | 状态 |
|------|------|------|
| 1 | 创建 Supabase 项目 | ⬜ |
| 2 | 运行 SQL 迁移（复制粘贴上面那段 SQL） | ⬜ |
| 3 | 获取 API 密钥（URL + Anon Key + Service Role Key） | ⬜ |
| 4 | 在 Vercel 添加 3 个环境变量 + 重新部署 | ⬜ |
| 5 | Supabase 关闭 "Enable email confirmations" | ⬜ |
| 6 | 设置 Site URL + Redirect URL | ⬜ |
| 7 | 测试注册/发帖/评论 | ⬜ |
| 未来 | Google/Facebook OAuth（需要翻墙） | 🔮 |

**完成后你的社区就可以正常使用了！用户用邮箱注册登录，发帖、投票、评论全功能可用。**
