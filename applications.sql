-- Drop applications table and related objects
DROP TABLE IF EXISTS applications CASCADE;

-- Create applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id) -- Prevent duplicate applications
);

-- Create index for faster queries
CREATE INDEX applications_user_id_idx ON applications(user_id);
CREATE INDEX applications_job_id_idx ON applications(job_id);

-- Add RLS policies
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own applications
CREATE POLICY "Users can view their own applications"
    ON applications FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to create their own applications
CREATE POLICY "Users can create their own applications"
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own applications
CREATE POLICY "Users can update their own applications"
    ON applications FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow admins to view all applications
CREATE POLICY "Admins can view all applications"
    ON applications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    );

-- Allow admins to update all applications
CREATE POLICY "Admins can update all applications"
    ON applications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = true
        )
    ); 