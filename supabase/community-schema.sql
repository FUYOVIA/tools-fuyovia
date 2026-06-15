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
  'Welcome to the FUYOVIA Community! 🎉',
  'We are thrilled to have you here!\n\nThis is where you can:\n\n• **Suggest new features** — Tell us what tools or improvements you''d love to see\n• **Report bugs** — Help us identify and fix issues faster\n• **Share feedback** — Let us know what works well and what doesn''t\n• **Chat with others** — Connect with fellow creators using our AI tools\n\n## How it works\n1. **Sign in** with Google or Facebook to participate\n2. **Upvote** ideas you care about — popular ones get prioritized\n3. **Leave comments** with detailed thoughts and use cases\n4. **Track progress** — We update statuses as we work on requests\n\nWe read every single discussion. Your voice directly shapes what we build next.\n\n— The FUYOVIA Team ✨',
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
