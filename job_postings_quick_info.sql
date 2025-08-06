-- Add quick info fields to job_postings table
ALTER TABLE job_postings 
ADD COLUMN IF NOT EXISTS quick_info JSONB DEFAULT '{}';

-- Add company_description_short field
ALTER TABLE job_postings 
ADD COLUMN IF NOT EXISTS company_description_short TEXT;

-- Add some example quick info fields that admins can populate
-- The JSONB format allows flexibility for different types of quick info
-- Example structure:
-- {
--   "industry": "Technology",
--   "experience_level": "Senior",
--   "company_size": "50-100 employees",
--   "work_mode": "Remote",
--   "benefits": ["Health Insurance", "401k", "Flexible Hours"],
--   "skills": ["React", "Node.js", "PostgreSQL"],
--   "deadline": "2024-02-15"
-- }

-- Create an index on the quick_info JSONB column for better query performance
CREATE INDEX IF NOT EXISTS idx_job_postings_quick_info ON job_postings USING GIN (quick_info);

-- Add a comment to document the quick_info field
COMMENT ON COLUMN job_postings.quick_info IS 'JSONB field containing quick info data like industry, experience level, company size, benefits, skills, etc. that admins can customize for each job posting';