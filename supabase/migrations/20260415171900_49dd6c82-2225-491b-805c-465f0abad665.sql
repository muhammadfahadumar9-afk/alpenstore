
INSERT INTO storage.buckets (id, name, public) VALUES ('page-images', 'page-images', true);

CREATE POLICY "Anyone can view page images"
ON storage.objects FOR SELECT
USING (bucket_id = 'page-images');

CREATE POLICY "Admins can upload page images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'page-images' AND public.is_active_admin(auth.uid()));

CREATE POLICY "Admins can update page images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'page-images' AND public.is_active_admin(auth.uid()));

CREATE POLICY "Admins can delete page images"
ON storage.objects FOR DELETE
USING (bucket_id = 'page-images' AND public.is_active_admin(auth.uid()));
