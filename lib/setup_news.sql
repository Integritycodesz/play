-- Create News Table
CREATE TABLE IF NOT EXISTS public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    excerpt TEXT,
    author TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Policies for News Table
CREATE POLICY "Enable read access for all users" ON public.news
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.news
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.news
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create Storage Bucket for News Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('news-images', 'news-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Give public access to news images" ON storage.objects
    FOR SELECT USING (bucket_id = 'news-images');

CREATE POLICY "Enable upload for authenticated users" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'news-images' AND auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON storage.objects
    FOR DELETE USING (bucket_id = 'news-images' AND auth.role() = 'authenticated');
