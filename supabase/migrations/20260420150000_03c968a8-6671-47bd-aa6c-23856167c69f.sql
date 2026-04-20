-- Blog images storage bucket (kept separate from product/gallery/page buckets)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for blog-images
CREATE POLICY "Blog images are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

CREATE POLICY "Admins can upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images' AND public.is_active_admin(auth.uid()));

CREATE POLICY "Admins can update blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images' AND public.is_active_admin(auth.uid()));

CREATE POLICY "Admins can delete blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images' AND public.is_active_admin(auth.uid()));

-- Categories
CREATE TABLE public.blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blog categories"
ON public.blog_categories FOR SELECT USING (true);

CREATE POLICY "Admins manage blog categories - insert"
ON public.blog_categories FOR INSERT TO authenticated
WITH CHECK (public.is_active_admin(auth.uid()));

CREATE POLICY "Admins manage blog categories - update"
ON public.blog_categories FOR UPDATE TO authenticated
USING (public.is_active_admin(auth.uid()))
WITH CHECK (public.is_active_admin(auth.uid()));

CREATE POLICY "Admins manage blog categories - delete"
ON public.blog_categories FOR DELETE TO authenticated
USING (public.is_active_admin(auth.uid()));

-- Tags
CREATE TABLE public.blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blog tags"
ON public.blog_tags FOR SELECT USING (true);

CREATE POLICY "Admins manage blog tags - insert"
ON public.blog_tags FOR INSERT TO authenticated
WITH CHECK (public.is_active_admin(auth.uid()));

CREATE POLICY "Admins manage blog tags - update"
ON public.blog_tags FOR UPDATE TO authenticated
USING (public.is_active_admin(auth.uid()))
WITH CHECK (public.is_active_admin(auth.uid()));

CREATE POLICY "Admins manage blog tags - delete"
ON public.blog_tags FOR DELETE TO authenticated
USING (public.is_active_admin(auth.uid()));

-- Posts
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  published_at TIMESTAMPTZ,
  author_id UUID NOT NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_blog_posts_status_pub ON public.blog_posts(status, published_at DESC);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published posts"
ON public.blog_posts FOR SELECT
USING (status = 'published');

CREATE POLICY "Admins can view all posts"
ON public.blog_posts FOR SELECT TO authenticated
USING (public.is_active_admin(auth.uid()));

CREATE POLICY "Admins can insert posts"
ON public.blog_posts FOR INSERT TO authenticated
WITH CHECK (public.is_active_admin(auth.uid()) AND author_id = auth.uid());

CREATE POLICY "Admins can update posts"
ON public.blog_posts FOR UPDATE TO authenticated
USING (public.is_active_admin(auth.uid()))
WITH CHECK (public.is_active_admin(auth.uid()));

CREATE POLICY "Admins can delete posts"
ON public.blog_posts FOR DELETE TO authenticated
USING (public.is_active_admin(auth.uid()));

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Post-Category join
CREATE TABLE public.blog_post_categories (
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.blog_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);
ALTER TABLE public.blog_post_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post categories"
ON public.blog_post_categories FOR SELECT USING (true);

CREATE POLICY "Admins manage post categories - insert"
ON public.blog_post_categories FOR INSERT TO authenticated
WITH CHECK (public.is_active_admin(auth.uid()));

CREATE POLICY "Admins manage post categories - delete"
ON public.blog_post_categories FOR DELETE TO authenticated
USING (public.is_active_admin(auth.uid()));

-- Post-Tag join
CREATE TABLE public.blog_post_tags (
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
ALTER TABLE public.blog_post_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view post tags"
ON public.blog_post_tags FOR SELECT USING (true);

CREATE POLICY "Admins manage post tags - insert"
ON public.blog_post_tags FOR INSERT TO authenticated
WITH CHECK (public.is_active_admin(auth.uid()));

CREATE POLICY "Admins manage post tags - delete"
ON public.blog_post_tags FOR DELETE TO authenticated
USING (public.is_active_admin(auth.uid()));

-- Comments
CREATE TABLE public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_blog_comments_post ON public.blog_comments(post_id, created_at DESC);

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments"
ON public.blog_comments FOR SELECT USING (true);

CREATE POLICY "Logged-in users can post comments"
ON public.blog_comments FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.blog_comments FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any comment"
ON public.blog_comments FOR DELETE TO authenticated
USING (public.is_active_admin(auth.uid()));