-- Create a separate storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to gallery images
CREATE POLICY "Anyone can view gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery-images');

-- Allow authenticated admins to upload gallery images
CREATE POLICY "Admins can upload gallery images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'gallery-images' 
  AND public.is_active_admin(auth.uid())
);

-- Allow authenticated admins to update gallery images
CREATE POLICY "Admins can update gallery images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'gallery-images' 
  AND public.is_active_admin(auth.uid())
);

-- Allow authenticated admins to delete gallery images
CREATE POLICY "Admins can delete gallery images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'gallery-images' 
  AND public.is_active_admin(auth.uid())
);