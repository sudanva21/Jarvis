# 🗄️ Database Setup Guide - Supabase

## 📋 Prerequisites

You already have:
- ✅ Supabase account
- ✅ Supabase project created
- ✅ Supabase URL and API key in `.env`

## 🚀 Setup Steps

### Step 1: Open Supabase Dashboard

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in to your account
3. Open your JARVIS project

### Step 2: Run the Schema

1. Click on **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Copy the entire contents of `backend/schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** button (or press Ctrl+Enter)

### Step 3: Verify Tables Created

1. Click on **"Table Editor"** in the left sidebar
2. You should see these tables:
   - ✅ `users`
   - ✅ `tasks`
   - ✅ `notes`
   - ✅ `calendar_events`
   - ✅ `user_preferences`

### Step 4: Test the Connection

Run your backend:
```bash
cd backend
python app.py
```

You should see:
```
✅ Supabase database connected successfully
```

## 📊 Database Tables

### 1. Users Table
Stores user accounts and authentication data.

**Columns:**
- `id` (UUID) - Primary key
- `email` (VARCHAR) - User email (unique)
- `password_hash` (VARCHAR) - Hashed password
- `name` (VARCHAR) - User's name
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 2. Tasks Table
Stores user tasks and reminders.

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `text` (TEXT) - Task description
- `completed` (BOOLEAN) - Completion status
- `scheduled_for` (TIMESTAMP) - When task is scheduled
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 3. Notes Table
Stores user notes and documents.

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `title` (VARCHAR) - Note title
- `content` (TEXT) - Note content
- `category` (VARCHAR) - Note category/tag
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 4. Calendar Events Table
Stores calendar events and meetings.

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users
- `title` (VARCHAR) - Event title
- `description` (TEXT) - Event description
- `start_time` (TIMESTAMP) - Event start
- `end_time` (TIMESTAMP) - Event end
- `location` (VARCHAR) - Event location
- `recurring` (BOOLEAN) - Is recurring
- `recurrence_rule` (VARCHAR) - Recurrence pattern
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 5. User Preferences Table
Stores user settings and preferences.

**Columns:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to users (unique)
- `voice_enabled` (BOOLEAN) - Voice feature enabled
- `voice_speed` (FLOAT) - Voice speed setting
- `volume` (FLOAT) - Volume setting
- `theme` (VARCHAR) - UI theme
- `location` (VARCHAR) - User location for weather
- `news_sources` (TEXT[]) - Preferred news sources
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🔒 Security Features

### Row Level Security (RLS)
All tables have RLS enabled, ensuring:
- ✅ Users can only see their own data
- ✅ Users can only modify their own data
- ✅ No cross-user data access
- ✅ Automatic security enforcement

### Password Security
- ✅ Passwords are hashed with bcrypt
- ✅ Never stored in plain text
- ✅ Secure authentication

## 🧪 Testing the Database

### Test 1: Create a User
```python
from database import db

user = db.create_user(
    email="test@example.com",
    password="securepassword123",
    name="Test User"
)
print(user)
```

### Test 2: Create a Task
```python
task = db.create_task(
    user_id=user['id'],
    text="Test JARVIS",
    scheduled_for="2025-10-21T15:00:00"
)
print(task)
```

### Test 3: Get User Tasks
```python
tasks = db.get_user_tasks(user['id'])
print(f"Found {len(tasks)} tasks")
```

## 📝 Migration from JSON Files

Your current tasks are stored in `tasks.json`. After database setup:

1. **Old system (Phase 1):** Tasks in `tasks.json`
2. **New system (Phase 2):** Tasks in Supabase database
3. **Migration:** Automatic when user logs in

The system will:
- ✅ Keep JSON files as backup
- ✅ Migrate tasks to database on first login
- ✅ Use database for all new operations

## 🔧 Troubleshooting

### Error: "Supabase credentials not found"
**Solution:** Check your `.env` file has:
```
SUPABASE_URL=your_url_here
SUPABASE_KEY=your_key_here
```

### Error: "relation does not exist"
**Solution:** Run the `schema.sql` file in Supabase SQL Editor

### Error: "permission denied"
**Solution:** Check RLS policies are created correctly

### Error: "duplicate key value"
**Solution:** Email already exists, use different email

## ✅ Verification Checklist

Before proceeding to Phase 2B:

- [ ] Supabase project created
- [ ] `schema.sql` executed successfully
- [ ] All 5 tables visible in Table Editor
- [ ] Backend shows "✅ Supabase database connected"
- [ ] Can create test user
- [ ] Can create test task
- [ ] RLS policies working

## 🎉 Next Steps

Once database is set up:
1. ✅ Update authentication to use database
2. ✅ Migrate task management to database
3. ✅ Add calendar features
4. ✅ Add notes features
5. ✅ Add user preferences

---

**Database setup complete!** Ready for Phase 2B! 🚀
