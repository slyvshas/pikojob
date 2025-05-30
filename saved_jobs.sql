-- Create saved_jobs table
CREATE TABLE saved_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id) -- Prevent duplicate saves
);

-- Create index for faster queries
CREATE INDEX saved_jobs_user_id_idx ON saved_jobs(user_id);
CREATE INDEX saved_jobs_job_id_idx ON saved_jobs(job_id);

-- Add RLS policies
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own saved jobs
CREATE POLICY "Users can view their own saved jobs"
    ON saved_jobs FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to save jobs
CREATE POLICY "Users can save jobs"
    ON saved_jobs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to unsave jobs
CREATE POLICY "Users can unsave jobs"
    ON saved_jobs FOR DELETE
    USING (auth.uid() = user_id); 