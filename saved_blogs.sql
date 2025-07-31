-- Create saved_blogs table
CREATE TABLE saved_blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    blog_slug TEXT NOT NULL,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, blog_slug) -- Prevent duplicate saves
);

-- Create index for faster queries
CREATE INDEX saved_blogs_user_id_idx ON saved_blogs(user_id);
CREATE INDEX saved_blogs_blog_slug_idx ON saved_blogs(blog_slug);

-- Add RLS policies
ALTER TABLE saved_blogs ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own saved blogs
CREATE POLICY "Users can view their own saved blogs"
    ON saved_blogs FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to save blogs
CREATE POLICY "Users can save blogs"
    ON saved_blogs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to unsave blogs
CREATE POLICY "Users can unsave blogs"
    ON saved_blogs FOR DELETE
    USING (auth.uid() = user_id); 