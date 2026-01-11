-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category TEXT,
    tags TEXT[],
    author TEXT,
    image_url TEXT,
    cover_image_url TEXT,
    reading_time INTEGER,
    published BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_posts table
-- Allow all users (including anonymous) to read published blog_posts
CREATE POLICY "Allow all users to read published blog_posts" ON blog_posts
    FOR SELECT USING (published = true);

-- Allow authenticated users to read all blog_posts (including drafts)
CREATE POLICY "Allow authenticated users to read all blog_posts" ON blog_posts
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow only authenticated users to insert blog_posts
CREATE POLICY "Allow authenticated users to insert blog_posts" ON blog_posts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow only authenticated users to update blog_posts
CREATE POLICY "Allow authenticated users to update blog_posts" ON blog_posts
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow only authenticated users to delete blog_posts
CREATE POLICY "Allow authenticated users to delete blog_posts" ON blog_posts
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS blog_posts_updated_at_trigger ON blog_posts;
CREATE TRIGGER blog_posts_updated_at_trigger
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_blog_posts_updated_at();
