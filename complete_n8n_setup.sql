-- COMPLETE N8N WORKFLOWS SETUP SCRIPT
-- Run this in your Supabase SQL editor to ensure everything is properly set up

-- Step 1: Create tables if they don't exist
CREATE TABLE IF NOT EXISTS categories (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text UNIQUE NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workflows (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
    tools_used text[],
    trigger_type text,
    difficulty_level text CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    json_storage_path text,
    source_url text,
    slug text UNIQUE NOT NULL,
    downloads_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favorites (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, workflow_id)
);

-- Step 2: Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop all existing policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Workflows are viewable by everyone" ON workflows;
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
DROP POLICY IF EXISTS "Only admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON categories;
DROP POLICY IF EXISTS "Only admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Only admins can insert workflows" ON workflows;
DROP POLICY IF EXISTS "Only admins can update workflows" ON workflows;
DROP POLICY IF EXISTS "Only admins can delete workflows" ON workflows;

-- Step 4: Create public read policies
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Workflows are viewable by everyone" ON workflows
    FOR SELECT USING (true);

-- Step 5: Create admin write policies (using profiles table)
CREATE POLICY "Only admins can insert categories" ON categories
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE is_admin = true
        )
    );

CREATE POLICY "Only admins can update categories" ON categories
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE is_admin = true
        )
    );

CREATE POLICY "Only admins can delete categories" ON categories
    FOR DELETE USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE is_admin = true
        )
    );

CREATE POLICY "Only admins can insert workflows" ON workflows
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE is_admin = true
        )
    );

CREATE POLICY "Only admins can update workflows" ON workflows
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE is_admin = true
        )
    );

CREATE POLICY "Only admins can delete workflows" ON workflows
    FOR DELETE USING (
        auth.uid() IN (
            SELECT id FROM profiles 
            WHERE is_admin = true
        )
    );

-- Step 6: Create favorites policies
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS workflows_category_id_idx ON workflows(category_id);
CREATE INDEX IF NOT EXISTS workflows_title_idx ON workflows USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS workflows_description_idx ON workflows USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS workflows_tools_used_idx ON workflows USING gin(tools_used);
CREATE INDEX IF NOT EXISTS workflows_difficulty_level_idx ON workflows(difficulty_level);
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_workflow_id_idx ON favorites(workflow_id);

-- Step 8: Test query (this should work without errors)
SELECT 
    'Database setup complete!' as status,
    (SELECT COUNT(*) FROM categories) as category_count,
    (SELECT COUNT(*) FROM workflows) as workflow_count,
    (SELECT COUNT(*) FROM favorites) as favorite_count;

-- Step 9: Sample data (if tables are empty)
-- Run this only if you don't have data yet
-- INSERT INTO categories (name, slug) VALUES 
--     ('Test Category', 'test-category')
-- ON CONFLICT (slug) DO NOTHING;

-- INSERT INTO workflows (title, description, slug, category_id) VALUES 
--     ('Test Workflow', 'A test workflow', 'test-workflow', (SELECT id FROM categories WHERE slug = 'test-category' LIMIT 1))
-- ON CONFLICT (slug) DO NOTHING;