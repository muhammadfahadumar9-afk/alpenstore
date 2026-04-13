
-- Site content table for editable page sections
CREATE TABLE public.site_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL,
  section_key TEXT NOT NULL,
  title TEXT,
  content TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page_key, section_key)
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Admins can insert site content" ON public.site_content FOR INSERT TO authenticated WITH CHECK (is_active_admin(auth.uid()));
CREATE POLICY "Admins can update site content" ON public.site_content FOR UPDATE TO authenticated USING (is_active_admin(auth.uid())) WITH CHECK (is_active_admin(auth.uid()));
CREATE POLICY "Admins can delete site content" ON public.site_content FOR DELETE TO authenticated USING (is_active_admin(auth.uid()));

-- Team members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  title TEXT,
  bio TEXT,
  image_url TEXT,
  section TEXT NOT NULL DEFAULT 'management',
  branch_name TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view team members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Admins can insert team members" ON public.team_members FOR INSERT TO authenticated WITH CHECK (is_active_admin(auth.uid()));
CREATE POLICY "Admins can update team members" ON public.team_members FOR UPDATE TO authenticated USING (is_active_admin(auth.uid())) WITH CHECK (is_active_admin(auth.uid()));
CREATE POLICY "Admins can delete team members" ON public.team_members FOR DELETE TO authenticated USING (is_active_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
