CREATE POLICY "Users can view own comments"
  ON public.blog_comments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all comments"
  ON public.blog_comments FOR SELECT TO authenticated
  USING (is_active_admin(auth.uid()));
