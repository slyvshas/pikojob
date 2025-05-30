-- Add is_featured column to job_postings table
ALTER TABLE job_postings ADD COLUMN is_featured BOOLEAN DEFAULT false;

-- Create index for faster featured jobs queries
CREATE INDEX job_postings_is_featured_idx ON job_postings(is_featured); 