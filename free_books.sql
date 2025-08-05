-- Create free_books table
CREATE TABLE free_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('programming', 'design', 'business', 'marketing', 'finance', 'self_help', 'technology', 'science', 'fiction', 'non_fiction')),
    author TEXT,
    publisher TEXT,
    language TEXT DEFAULT 'English',
    pages INTEGER,
    format TEXT CHECK (format IN ('pdf', 'epub', 'mobi', 'online', 'multiple')),
    link TEXT,
    cover_image_url TEXT,
    blog_slug TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create saved_books table
CREATE TABLE saved_books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES free_books(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id) -- Prevent duplicate saves
);

-- Enable Row Level Security
ALTER TABLE free_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_books ENABLE ROW LEVEL SECURITY;

-- RLS Policies for free_books table
-- Allow all users to read free_books
CREATE POLICY "Allow all users to read free_books" ON free_books
    FOR SELECT USING (true);

-- Allow only authenticated users to insert free_books (admin check should be done in application)
CREATE POLICY "Allow authenticated users to insert free_books" ON free_books
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow only authenticated users to update free_books
CREATE POLICY "Allow authenticated users to update free_books" ON free_books
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow only authenticated users to delete free_books
CREATE POLICY "Allow authenticated users to delete free_books" ON free_books
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for saved_books table
-- Allow users to read their own saved books
CREATE POLICY "Allow users to read their own saved books" ON saved_books
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own saved books
CREATE POLICY "Allow users to insert their own saved books" ON saved_books
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own saved books
CREATE POLICY "Allow users to delete their own saved books" ON saved_books
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_free_books_category ON free_books(category);
CREATE INDEX idx_free_books_created_at ON free_books(created_at);
CREATE INDEX idx_saved_books_user_id ON saved_books(user_id);
CREATE INDEX idx_saved_books_book_id ON saved_books(book_id); 