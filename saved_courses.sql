-- Create saved_courses table
CREATE TABLE saved_courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES free_courses(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, course_id) -- Prevent duplicate saves
);

-- Create index for faster queries
CREATE INDEX saved_courses_user_id_idx ON saved_courses(user_id);
CREATE INDEX saved_courses_course_id_idx ON saved_courses(course_id);

-- Add RLS policies
ALTER TABLE saved_courses ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own saved courses
CREATE POLICY "Users can view their own saved courses"
    ON saved_courses FOR SELECT
    USING (auth.uid() = user_id);

-- Allow users to save courses
CREATE POLICY "Users can save courses"
    ON saved_courses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to unsave courses
CREATE POLICY "Users can unsave courses"
    ON saved_courses FOR DELETE
    USING (auth.uid() = user_id); 