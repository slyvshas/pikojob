-- Contact Messages Table
-- Stores messages submitted through the contact form

CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an index on created_at for faster sorting
CREATE INDEX idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Create an index on status for filtering
CREATE INDEX idx_contact_messages_status ON contact_messages(status);

-- Enable Row Level Security (RLS)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert (submit contact form)
CREATE POLICY "Anyone can submit contact form" ON contact_messages
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated admin users can view messages
CREATE POLICY "Admins can view all contact messages" ON contact_messages
  FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Policy: Only authenticated admin users can update messages (change status)
CREATE POLICY "Admins can update contact messages" ON contact_messages
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Policy: Only authenticated admin users can delete messages
CREATE POLICY "Admins can delete contact messages" ON contact_messages
  FOR DELETE
  USING (
    auth.role() = 'authenticated' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function on update
CREATE TRIGGER update_contact_messages_updated_at
  BEFORE UPDATE ON contact_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to the table
COMMENT ON TABLE contact_messages IS 'Stores contact form submissions from users';
