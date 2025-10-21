# 🚀 JARVIS Deployment Guide

Complete step-by-step guide to deploy your JARVIS AI Assistant for free.

## 📋 Prerequisites

1. **GitHub Account** - [Sign up at github.com](https://github.com/signup)
2. **Vercel Account** - [Sign up at vercel.com](https://vercel.com/signup) (use GitHub login)
3. **Render Account** - [Sign up at render.com](https://render.com/register) (use GitHub login)
4. **Git installed** on your computer

---

## Part 1: Push Code to GitHub

### Step 1: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `jarvis-ai-assistant`
3. Description: `JARVIS - AI Voice Assistant`
4. Choose **Public** (required for free hosting)
5. **DO NOT** initialize with README (you already have one)
6. Click **Create repository**

### Step 2: Push Your Code to GitHub

Open PowerShell in your project folder and run:

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit - JARVIS AI Assistant"

# Add your GitHub repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/jarvis-ai-assistant.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note**: You'll be asked to login to GitHub. Use your GitHub credentials.

---

## Part 2: Deploy Backend to Render

### Step 1: Create New Web Service

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect account"** to connect your GitHub
4. Select your `jarvis-ai-assistant` repository
5. Click **"Connect"**

### Step 2: Configure Web Service

Fill in these settings:

- **Name**: `jarvis-backend` (or any name you like)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`
- **Instance Type**: `Free`

### Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these variables:

| Key | Value |
|-----|-------|
| `PYTHON_VERSION` | `3.11.0` |
| `GROQ_API_KEY` | Your Groq API key (get free at console.groq.com) |
| `SUPABASE_URL` | Your Supabase URL |
| `SUPABASE_KEY` | Your Supabase anon key |
| `SECRET_KEY` | Any random string (e.g., `jarvis-secret-key-2024`) |
| `FLASK_ENV` | `production` |

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for deployment
3. Once deployed, you'll see a URL like: `https://jarvis-backend.onrender.com`
4. **SAVE THIS URL** - you'll need it for frontend!

### Step 5: Test Backend

Visit: `https://your-backend-url.onrender.com/api/health`

You should see:
```json
{
  "status": "online",
  "message": "JARVIS systems operational"
}
```

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Create Environment File

1. In your project root, create a file named `.env` (if not exists)
2. Add this line (replace with YOUR backend URL from Render):

```
VITE_API_URL=https://jarvis-backend.onrender.com
```

3. Commit and push this change:

```powershell
git add .env.example
git commit -m "Add production API URL"
git push
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your `jarvis-ai-assistant` repository
4. Click **"Import"**

### Step 3: Configure Project

- **Framework Preset**: `Vite`
- **Root Directory**: `./` (leave as is)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://jarvis-backend.onrender.com` (your Render URL) |

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. You'll get a URL like: `https://jarvis-ai-assistant.vercel.app`
4. Click **"Visit"** to see your live app!

---

## Part 4: Update Backend CORS

Your backend needs to allow requests from your Vercel frontend.

### Step 1: Update app.py

In `backend/app.py`, find this line:
```python
CORS(app, resources={r"/api/*": {"origins": "*"}})
```

For production, you should update it to:
```python
CORS(app, resources={r"/api/*": {
    "origins": [
        "http://localhost:3000",
        "https://jarvis-ai-assistant.vercel.app",  # Your Vercel URL
        "https://*.vercel.app"  # All Vercel preview deployments
    ]
}})
```

### Step 2: Push Update

```powershell
git add backend/app.py
git commit -m "Update CORS for production"
git push
```

Render will automatically redeploy your backend!

---

## 🎉 You're Done!

Your JARVIS AI Assistant is now live!

- **Frontend**: `https://jarvis-ai-assistant.vercel.app`
- **Backend**: `https://jarvis-backend.onrender.com`

### Important Notes:

1. **Free Tier Limitations**:
   - Render free tier: Backend sleeps after 15 min of inactivity (first request takes ~30 sec to wake up)
   - Voice features (microphone/speaker) won't work on cloud (browser security)
   - Chat and AI features work perfectly!

2. **Keep Your Secrets Safe**:
   - Never commit `.env` file to GitHub
   - Always use environment variables in Render/Vercel dashboard

3. **Custom Domain** (Optional):
   - Both Vercel and Render allow free custom domains
   - Configure in their dashboards

---

## 🔧 Troubleshooting

### Backend not responding?
- Check Render logs: Dashboard → Your Service → Logs
- Verify environment variables are set correctly
- Free tier sleeps - first request is slow

### Frontend can't connect to backend?
- Check VITE_API_URL in Vercel environment variables
- Verify CORS settings in backend
- Check browser console for errors

### Need Help?
- Render docs: [render.com/docs](https://render.com/docs)
- Vercel docs: [vercel.com/docs](https://vercel.com/docs)

---

**"Sometimes you gotta run before you can walk."** - Tony Stark
