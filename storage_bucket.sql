-- Create storage bucket for book cover images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow authenticated users to upload images
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND 
  auth.role() = 'authenticated'
);

-- Create storage policy to allow public read access to images
CREATE POLICY "Allow public read access to images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Create storage policy to allow authenticated users to update their own images
CREATE POLICY "Allow authenticated users to update images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' AND 
  auth.role() = 'authenticated'
);

-- Create storage policy to allow authenticated users to delete images
CREATE POLICY "Allow authenticated users to delete images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' AND 
  auth.role() = 'authenticated'
); 