-- Add category column to free_courses table
ALTER TABLE free_courses ADD COLUMN category TEXT;

-- Create index for faster category-based queries
CREATE INDEX free_courses_category_idx ON free_courses(category);

-- Add a check constraint to ensure category is one of the predefined values
ALTER TABLE free_courses ADD CONSTRAINT free_courses_category_check 
CHECK (category IN (
  'Programming & Development',
  'Data Science & Analytics',
  'Web Development',
  'Mobile Development',
  'Design & UX',
  'Business & Marketing',
  'Digital Marketing',
  'Project Management',
  'Cybersecurity',
  'Cloud Computing',
  'Artificial Intelligence',
  'Machine Learning',
  'DevOps',
  'Database Management',
  'Other'
)); 