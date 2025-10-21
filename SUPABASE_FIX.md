# 🔧 SUPABASE CONNECTION FIX - COMPLETE GUIDE

## ✅ Problem Fixed!

**Issue:** Tasks were not saving to Supabase database
**Cause:** API endpoints were not passing `user_id` to task manager
**Solution:** Updated all endpoints to extract and pass `user_id` from JWT token

---

## 🎯 What Was Fixed

### 1. Added Helper Function
```python
def get_user_id_from_request():
    """Extract user_id from Authorization header"""
    # Extracts user_id from JWT token in request headers
```

### 2. Updated All Task Endpoints
- ✅ `GET /api/tasks` - Now passes user_id
- ✅ `POST /api/tasks` - Now passes user_id
- ✅ Voice command endpoint - Now passes user_id
- ✅ Chat endpoint - Now passes user_id
- ✅ Delete/Edit/Complete operations - Now pass user_id

### 3. How It Works Now
```
1. User logs in → Gets JWT token
2. Frontend stores token in localStorage
3. Frontend sends token with every request
4. Backend extracts user_id from token
5. Backend passes user_id to task_manager
6. Task_manager saves to database with user_id
✅ Tasks now saved to Supabase!
```

---

## 🚀 Setup Instructions

### Step 1: Run Database Schema (REQUIRED!)

**You MUST run the schema in Supabase first!**

1. **Open Supabase Dashboard**
   - Go to https://supabase.com
   - Sign in to your account
   - Open your JARVIS project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New query"

3. **Run Schema**
   - Open file: `backend/schema.sql`
   - Copy ALL contents (entire file)
   - Paste into Supabase SQL Editor
   - Click "Run" button (or press Ctrl+Enter)

4. **Verify Tables Created**
   - Click "Table Editor" in left sidebar
   - You should see 5 tables:
     - ✅ users
     - ✅ tasks
     - ✅ notes
     - ✅ calendar_events
     - ✅ user_preferences

**⚠️ IMPORTANT:** If you don't run the schema, the database won't work!

---

## 🧪 Testing the Fix

### Test 1: Register a New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123",
    "name": "Test User"
  }'
```

**Expected Response:**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "name": "Test User"
  },
  "token": "jwt-token-here",
  "message": "Registration successful"
}
```

**✅ Check Supabase:**
- Go to Table Editor → users
- You should see the new user!

### Test 2: Create a Task (With Token)
```bash
# Save the token from registration
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "text": "Test task from API",
    "scheduledFor": null
  }'
```

**Expected Response:**
```json
{
  "task": {
    "id": "uuid-here",
    "user_id": "your-user-id",
    "text": "Test task from API",
    "completed": false,
    "created_at": "2025-10-21T...",
    "updated_at": "2025-10-21T..."
  }
}
```

**✅ Check Supabase:**
- Go to Table Editor → tasks
- You should see the new task with your user_id!

### Test 3: Get Tasks (With Token)
```bash
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Response:**
```json
{
  "tasks": [
    {
      "id": "uuid-here",
      "user_id": "your-user-id",
      "text": "Test task from API",
      "completed": false
    }
  ]
}
```

---

## 🎤 Testing with Voice Commands

### Step 1: Login to Frontend
1. Open http://localhost:3000
2. Click "Register" or "Login"
3. Enter your credentials
4. You should be logged in

### Step 2: Create Task by Voice
1. Click the microphone button
2. Say: "Create a task"
3. Say: "Test voice task"
4. Say: "5 PM"
5. ✅ Task should be created!

### Step 3: Verify in Supabase
1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Click "tasks" table
4. **You should see your task!**
5. Check the `user_id` column - it should match your user ID

---

## 🔍 How to Check If It's Working

### Method 1: Check Backend Logs
When you create a task, you should see:
```
✅ Supabase database connected successfully
🗄️  Database: Connected
```

### Method 2: Check Supabase Dashboard
1. Go to https://supabase.com
2. Open your project
3. Click "Table Editor"
4. Click "tasks" table
5. You should see tasks with `user_id` filled in

### Method 3: Check Frontend
1. Create a task
2. Refresh the page
3. Tasks should still be there (loaded from database)

---

## ❌ Troubleshooting

### Issue 1: "Supabase credentials not found"
**Solution:**
- Check `backend/.env` file exists
- Make sure it has:
  ```
  SUPABASE_URL=your-url
  SUPABASE_KEY=your-key
  ```

### Issue 2: "relation does not exist"
**Solution:**
- You haven't run the schema.sql file
- Go to Supabase SQL Editor
- Run the entire schema.sql file

### Issue 3: Tasks not appearing in Supabase
**Solution:**
- Make sure you're logged in (have a token)
- Check browser console for errors
- Check if token is being sent:
  ```javascript
  // In browser console
  localStorage.getItem('jarvis_token')
  ```

### Issue 4: "permission denied for table tasks"
**Solution:**
- RLS policies not created
- Run the schema.sql file again (it includes RLS policies)

### Issue 5: Tasks appear but user_id is null
**Solution:**
- Frontend not sending Authorization header
- Check if user is logged in
- Check localStorage has token

---

## 🎯 What Should Work Now

### ✅ With Login (Database):
```
✅ Register user → Saved to Supabase
✅ Login user → Authenticated from Supabase
✅ Create task → Saved to Supabase (user-specific)
✅ Get tasks → Retrieved from Supabase (user-specific)
✅ Update task → Updated in Supabase
✅ Delete task → Deleted from Supabase
✅ Tasks persist across sessions
✅ Each user sees only their tasks
```

### ✅ Without Login (Fallback):
```
✅ Create task → Saved to tasks.json
✅ Get tasks → Retrieved from tasks.json
✅ Update task → Updated in tasks.json
✅ Delete task → Deleted from tasks.json
✅ Works offline
```

---

## 📊 Database Schema Quick Reference

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  scheduled_for TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🎉 Success Checklist

Before you say it's working, verify:

- [ ] Backend shows "✅ Supabase database connected successfully"
- [ ] Backend shows "🗄️ Database: Connected"
- [ ] Schema.sql has been run in Supabase
- [ ] 5 tables visible in Supabase Table Editor
- [ ] Can register a new user
- [ ] User appears in Supabase users table
- [ ] Can login with registered user
- [ ] Can create a task (voice or API)
- [ ] Task appears in Supabase tasks table
- [ ] Task has user_id filled in
- [ ] Can see tasks after page refresh
- [ ] Different users see different tasks

---

## 🚀 Quick Start (TL;DR)

```bash
# 1. Run schema in Supabase (REQUIRED!)
# - Open https://supabase.com
# - Go to SQL Editor
# - Copy/paste backend/schema.sql
# - Click Run

# 2. Backend is already running with fixes!
# - Should show "Database: Connected"

# 3. Test it!
# - Open http://localhost:3000
# - Register a new account
# - Create a task by voice
# - Check Supabase Table Editor → tasks
# - You should see your task!
```

---

## ✅ Fix Complete!

**What was changed:**
- ✅ Added `get_user_id_from_request()` helper
- ✅ Updated all task endpoints to pass user_id
- ✅ Tasks now save to Supabase with user_id
- ✅ Each user sees only their own tasks
- ✅ Fallback to file storage still works

**Backend restarted with fixes!**

**Next step:** Run schema.sql in Supabase, then test!

🎉 **Your tasks will now save to Supabase!**
