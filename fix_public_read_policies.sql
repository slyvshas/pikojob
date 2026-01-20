-- Fix public read access for N8N Workflows page
-- Add missing SELECT policies for public access to categories and workflows

-- Allow public read access to categories
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

-- Allow public read access to workflows
DROP POLICY IF EXISTS "Workflows are viewable by everyone" ON workflows;
CREATE POLICY "Workflows are viewable by everyone" ON workflows
    FOR SELECT USING (true);

-- Allow public read access to favorites (for user's own favorites)
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to manage their own favorites
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
CREATE POLICY "Users can insert their own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);