# Database Setup Instructions

This document provides instructions for setting up all required database tables in Supabase.

## Prerequisites

- A Supabase project with database access
- Supabase SQL Editor or database connection

## Setup Order

Execute the SQL files in the following order to ensure proper dependency handling:

### 1. Core Tables

#### Profiles Table (Required First)
```bash
# Run: profiles.sql
```
This creates the user profiles table and sets up automatic profile creation for new users.

**After creating the profiles table**, make your first admin user:
```sql
UPDATE profiles SET is_admin = true WHERE email = 'your-admin-email@example.com';
```

#### Blog Posts Table
```bash
# Run: blog_posts.sql
```
Creates the blog_posts table with RLS policies allowing public read access.

#### Free Courses Table
```bash
# Run: free_courses.sql
```
Creates the free_courses table with RLS policies allowing public read access.

### 2. Feature Tables

Execute these in any order:

- `opportunities.sql` - Opportunities/scholarships table
- `free_books.sql` - Free books table
- `job_postings.sql` - Job postings table
- `job_postings_quick_info.sql` - Job quick info table
- `contact_messages.sql` - Contact form messages table

### 3. User-Specific Tables

These tables store user bookmarks/saved items:

- `saved_blogs.sql`
- `saved_courses.sql`
- `saved_books.sql`
- `saved_jobs.sql`
- `applications.sql`

### 4. Storage Bucket

```bash
# Run: storage_bucket.sql
```
Sets up storage buckets for file uploads (images, documents, etc.).

## Row Level Security (RLS) Overview

All tables use RLS policies:

- **Public Tables** (`blog_posts`, `free_courses`, `opportunities`, `free_books`, `job_postings`):
  - Anonymous users: READ access
  - Authenticated users: INSERT, UPDATE, DELETE access

- **User-Specific Tables** (`saved_*`, `applications`):
  - Users can only access their own data

- **Admin Features**:
  - Admin status is stored in `profiles.is_admin`
  - Frontend checks admin status for admin dashboard access
  - Backend/RLS enforces authentication requirement

## Verifying Setup

After running all SQL files, verify in Supabase:

1. Check that all tables exist in **Database > Tables**
2. Verify RLS is enabled for each table
3. Test queries in the SQL Editor:

```sql
-- Should work without authentication
SELECT * FROM blog_posts WHERE published = true LIMIT 5;
SELECT * FROM free_courses LIMIT 5;
SELECT * FROM opportunities LIMIT 5;

-- Verify your admin status
SELECT id, email, is_admin FROM profiles WHERE email = 'your-email@example.com';
```

## Environment Variables

Ensure your `.env` file has:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Troubleshooting

### 400 Errors on Public Pages

If you see 400 errors when loading the homepage:

1. **Check RLS Policies**: Ensure `blog_posts`, `free_courses`, and `opportunities` tables have policies allowing `SELECT` for all users (`USING (true)`)

2. **Verify Tables Exist**: Go to Supabase Dashboard > Table Editor and confirm all tables are created

3. **Check Query Syntax**: Open browser console and look for the full error message

### Admin Dashboard Not Working

1. Verify your user has `is_admin = true` in the profiles table
2. Sign out and sign in again to refresh the auth session
3. Check browser console for authentication errors

## Making Changes

When modifying table structures:

1. Update the corresponding `.sql` file
2. Run the migration in Supabase SQL Editor
3. Update RLS policies if column access changes
4. Test with both authenticated and anonymous users

## Quick Setup Script

For a fresh Supabase project, you can run all scripts at once:

```sql
-- Copy and paste the contents of each file in this order:
-- 1. profiles.sql
-- 2. blog_posts.sql
-- 3. free_courses.sql
-- 4. opportunities.sql
-- 5. free_books.sql
-- 6. job_postings.sql
-- 7. saved_blogs.sql
-- 8. saved_courses.sql
-- 9. saved_books.sql
-- 10. saved_jobs.sql
-- 11. applications.sql
-- 12. contact_messages.sql
-- 13. storage_bucket.sql

-- Then set your first admin:
UPDATE profiles SET is_admin = true WHERE email = 'your-email@example.com';
```

## Support

For issues with database setup:
- Check Supabase Dashboard > Logs for error details
- Verify API keys are correct in `.env`
- Ensure RLS is properly configured for public access on content tables
