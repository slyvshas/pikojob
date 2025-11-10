# Contact Form Setup Instructions

## Database Setup

To enable the contact form to work with Supabase, you need to run the SQL script to create the `contact_messages` table.

### Steps:

1. **Go to your Supabase Dashboard**
   - Visit: https://ppdprbmlnxntojwjjkbu.supabase.co
   - Navigate to: SQL Editor

2. **Run the SQL Script**
   - Copy the entire contents of `contact_messages.sql`
   - Paste it into the SQL Editor
   - Click "Run" or press Ctrl+Enter

3. **Verify the Table**
   - Go to: Table Editor
   - You should see a new table called `contact_messages`

### What the SQL creates:

- **Table**: `contact_messages` with columns:
  - `id` (UUID, primary key)
  - `name` (text, required)
  - `email` (text, required)
  - `subject` (text, required)
  - `message` (text, required)
  - `status` (text, default: 'unread', options: unread/read/replied/archived)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

- **Row Level Security (RLS) Policies**:
  - Anyone can insert (submit contact form)
  - Only admins can view, update, and delete messages

- **Indexes** for better performance on:
  - `created_at` (for sorting)
  - `status` (for filtering)

- **Trigger** to automatically update `updated_at` timestamp

## How It Works

### For Users:
1. Users fill out the contact form at `/contact`
2. Form submits data to Supabase `contact_messages` table
3. User sees success toast notification
4. Form resets

### For Admins:
1. Login as admin user
2. Navigate to: Admin Dashboard → Contact Messages
3. View all submissions in a table
4. Actions available:
   - View full message (opens modal)
   - Reply via email (opens mail client)
   - Change status (unread → read → replied → archived)
   - Delete message
5. Messages marked as "unread" appear bold
6. Clicking "View" auto-marks message as "read"

## Features

### Contact Form (`/contact`)
- Required fields: name, email, subject, message
- Form validation
- Saves to Supabase
- Success/error toast notifications
- Auto-resets after submission

### Admin Dashboard (`/admin/contact-messages`)
- Table view of all messages
- Sort by date (newest first)
- Filter by status via dropdown
- View message details in modal
- Quick reply via email link
- Delete messages
- Refresh button to reload data
- Real-time status updates

## Testing

1. **Submit a test message**:
   - Go to: http://localhost:5173/contact
   - Fill out the form
   - Submit

2. **View as admin**:
   - Login as admin
   - Go to: Admin Dashboard → Contact Messages
   - You should see your test message

## Security

- RLS policies ensure only admins can view messages
- Anyone can submit (required for public contact form)
- All data stored securely in Supabase
- Email addresses are clickable but not exposed to non-admins

## Status Types

- **Unread** (red badge): New messages
- **Read** (blue badge): Viewed messages
- **Replied** (green badge): Messages you've responded to
- **Archived** (gray badge): Old/completed messages
