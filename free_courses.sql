-- Create free_courses table
CREATE TABLE IF NOT EXISTS free_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    provider TEXT,
    instructor TEXT,
    duration TEXT,
    level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced', 'all')),
    language TEXT DEFAULT 'English',
    image_url TEXT,
    course_url TEXT NOT NULL,
    rating DECIMAL(3,2),
    blog_slug TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE free_courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for free_courses table
-- Allow all users (including anonymous) to read free_courses
CREATE POLICY "Allow all users to read free_courses" ON free_courses
    FOR SELECT USING (true);

-- Allow only authenticated users to insert free_courses
CREATE POLICY "Allow authenticated users to insert free_courses" ON free_courses
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow only authenticated users to update free_courses
CREATE POLICY "Allow authenticated users to update free_courses" ON free_courses
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow only authenticated users to delete free_courses
CREATE POLICY "Allow authenticated users to delete free_courses" ON free_courses
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_free_courses_category ON free_courses(category);
CREATE INDEX IF NOT EXISTS idx_free_courses_created_at ON free_courses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_free_courses_blog_slug ON free_courses(blog_slug);
