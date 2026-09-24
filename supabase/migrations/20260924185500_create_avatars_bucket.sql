-- Create a public bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for storage.objects if not already enabled
-- Note: Already enabled by default in Supabase.

-- Allow public read access to all files in the avatars bucket
-- This ensures the <img> tags on the frontend can load the images without authentication
CREATE POLICY "Avatar Images are Publicly Accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- (Optional) If you ever upload directly from the frontend using anon key, you would need INSERT/UPDATE policies.
-- Since the Node.js backend handles uploads with the service_role key, it bypasses RLS for inserting/updating.
