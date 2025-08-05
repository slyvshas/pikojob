-- Create opportunities table
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('conferences', 'events', 'competitions', 'fellowship', 'scholarship', 'exchange_programs')),
    organization TEXT,
    location TEXT,
    deadline DATE,
    link TEXT,
    blog_slug TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create saved_opportunities table
CREATE TABLE saved_opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, opportunity_id) -- Prevent duplicate saves
);

-- Enable Row Level Security
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies for opportunities table
-- Allow all users to read opportunities
CREATE POLICY "Allow all users to read opportunities" ON opportunities
    FOR SELECT USING (true);

-- Allow only authenticated users to insert opportunities (admin check should be done in application)
CREATE POLICY "Allow authenticated users to insert opportunities" ON opportunities
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow only authenticated users to update opportunities
CREATE POLICY "Allow authenticated users to update opportunities" ON opportunities
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow only authenticated users to delete opportunities
CREATE POLICY "Allow authenticated users to delete opportunities" ON opportunities
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for saved_opportunities table
-- Allow users to read their own saved opportunities
CREATE POLICY "Allow users to read their own saved opportunities" ON saved_opportunities
    FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own saved opportunities
CREATE POLICY "Allow users to insert their own saved opportunities" ON saved_opportunities
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own saved opportunities
CREATE POLICY "Allow users to delete their own saved opportunities" ON saved_opportunities
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_opportunities_category ON opportunities(category);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at);
CREATE INDEX idx_saved_opportunities_user_id ON saved_opportunities(user_id);
CREATE INDEX idx_saved_opportunities_opportunity_id ON saved_opportunities(opportunity_id); 