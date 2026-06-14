-- =============================================
-- FUYOVIA AI Tools - Supabase Database Schema
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- Users table (synced from Supabase Auth)
-- =============================================
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  display_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro', 'studio')),
  credits integer not null default 0,
  credits_refreshed_at timestamp with time zone default now(),
  plan_expires_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- =============================================
-- Tool usage logs
-- =============================================
create table if not exists public.tool_usage (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  tool_id text not null,
  tool_type text not null check (tool_type in ('free', 'premium')),
  credits_used integer default 0,
  input_length integer,
  output_length integer,
  created_at timestamp with time zone default now()
);

-- =============================================
-- Subscriptions (Stripe)
-- =============================================
create table if not exists public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null check (plan in ('starter', 'pro', 'studio')),
  status text not null default 'active' check (status in ('active', 'canceled', 'past_due')),
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- =============================================
-- Course unlock mapping (Shoplazza integration)
-- =============================================
create table if not exists public.course_unlocks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  course_sku text not null,
  unlocked_tool_ids text[] not null,
  unlocked_at timestamp with time zone default now()
);

-- =============================================
-- Credits purchase history
-- =============================================
create table if not exists public.credit_purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  stripe_payment_intent_id text,
  credits_purchased integer not null,
  amount_paid_usd decimal(10,2) not null,
  status text default 'completed' check (status in ('pending', 'completed', 'failed')),
  created_at timestamp with time zone default now()
);

-- =============================================
-- Indexes
-- =============================================
create index if not exists idx_tool_usage_user_id on public.tool_usage(user_id);
create index if not exists idx_tool_usage_created_at on public.tool_usage(created_at);
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_course_unlocks_user_id on public.course_unlocks(user_id);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
alter table public.users enable row level security;
alter table public.tool_usage enable row level security;
alter table public.subscriptions enable row level security;
alter table public.course_unlocks enable row level security;
alter table public.credit_purchases enable row level security;

-- Users can read their own data
create policy if not exists "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy if not exists "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Users can view their own tool usage
create policy if not exists "Users can view own tool usage"
  on public.tool_usage for select
  using (auth.uid() = user_id);

-- Users can view their own subscriptions
create policy if not exists "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Users can view their own course unlocks
create policy if not exists "Users can view own course unlocks"
  on public.course_unlocks for select
  using (auth.uid() = user_id);

-- Users can view their own credit purchases
create policy if not exists "Users can view own credit purchases"
  on public.credit_purchases for select
  using (auth.uid() = user_id);

-- =============================================
-- Functions
-- =============================================

-- Refresh daily free credits
create or replace function public.refesh_daily_credits()
returns void
language plpgsql
security definer
as $$
begin
  update public.users
  set 
    credits = case 
      when plan = 'free' then least(credits + 5, 5)
      when plan = 'starter' then credits  -- no daily limit for paid
      when plan = 'pro' then credits
      when plan = 'studio' then credits
    end,
    credits_refreshed_at = now()
  where 
    plan = 'free'
    and credits_refreshed_at < date_trunc('day', now() - interval '1 day');
end;
$$;

-- Deduct credits (with atomic check)
create or replace function public.deduct_credits(
  p_user_id uuid,
  p_amount integer
)
returns boolean
language plpgsql
security definer
as $$
declare
  current_credits integer;
begin
  select credits into current_credits from public.users where id = p_user_id for update;
  
  if current_credits >= p_amount then
    update public.users
    set credits = credits - p_amount
    where id = p_user_id;
    return true;
  else
    return false;
  end if;
end;
$$;

-- =============================================
-- Trigger: Create user profile on signup
-- =============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================
-- Initial data: Tool definitions
-- =============================================
-- (This would be stored in a separate config, but we keep a reference table)
create table if not exists public.tools_catalog (
  id text primary key,
  name text not null,
  tool_type text not null check (tool_type in ('free', 'premium')),
  credits_cost integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

insert into public.tools_catalog (id, name, tool_type, credits_cost) values
  -- Free tools
  ('image-compressor', 'Image Compressor', 'free', 0),
  ('pdf-tools', 'PDF Toolkit', 'free', 0),
  ('qr-generator', 'QR Code Generator', 'free', 0),
  ('json-formatter', 'JSON Formatter', 'free', 0),
  ('password-generator', 'Password Generator', 'free', 0),
  ('word-counter', 'Word Counter', 'free', 0),
  ('color-converter', 'Color Converter', 'free', 0),
  ('base64-tool', 'Base64 Tool', 'free', 0),
  ('markdown-preview', 'Markdown Preview', 'free', 0),
  ('meta-tag-generator', 'Meta Tag Generator', 'free', 0),
  -- Premium tools
  ('ai-humanizer', 'AI Humanizer', 'premium', 2),
  ('social-media-generator', 'Social Media Writer', 'premium', 1),
  ('product-description', 'Product Description Writer', 'premium', 1),
  ('email-copy-generator', 'Email Copy Writer', 'premium', 1),
  ('seo-blog-generator', 'SEO Blog Writer', 'premium', 3),
  ('video-script-generator', 'Video Script Writer', 'premium', 2),
  ('ai-image-generator', 'AI Image Generator', 'premium', 5),
  ('hashtag-generator', 'Hashtag Generator', 'premium', 1),
  ('resume-optimizer', 'Resume & Cover Letter', 'premium', 2),
  ('readability-optimizer', 'Readability Optimizer', 'premium', 1)
on conflict (id) do nothing;
