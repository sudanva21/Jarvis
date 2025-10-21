# ✅ Deployment Checklist

Use this checklist to track your deployment progress.

---

## 📦 Pre-Deployment (Already Done! ✅)

- [x] Created `backend/Procfile`
- [x] Created `backend/runtime.txt`
- [x] Updated `requirements.txt` with gunicorn
- [x] Created `src/config.js` for API endpoints
- [x] Updated frontend to use environment variables
- [x] Created deployment guides

---

## 🐙 Step 1: GitHub Setup

- [ ] Created GitHub account
- [ ] Created new repository `jarvis-ai-assistant`
- [ ] Set repository to **Public**
- [ ] Initialized git in project folder
- [ ] Added all files with `git add .`
- [ ] Committed with `git commit -m "Ready for deployment"`
- [ ] Added remote with `git remote add origin ...`
- [ ] Pushed to GitHub with `git push -u origin main`
- [ ] Verified code is visible on GitHub

---

## 🐍 Step 2: Backend Deployment (Render)

### Account Setup
- [ ] Created Render account at render.com
- [ ] Connected GitHub account to Render
- [ ] Authorized Render to access repositories

### Service Configuration
- [ ] Created new Web Service
- [ ] Selected `jarvis-ai-assistant` repository
- [ ] Set name to `jarvis-backend`
- [ ] Set root directory to `backend`
- [ ] Set runtime to `Python 3`
- [ ] Set build command to `pip install -r requirements.txt`
- [ ] Set start command to `gunicorn app:app`
- [ ] Selected **Free** instance type

### Environment Variables
- [ ] Added `PYTHON_VERSION` = `3.11.0`
- [ ] Added `GROQ_API_KEY` (got from console.groq.com)
- [ ] Added `SUPABASE_URL` (from Supabase project)
- [ ] Added `SUPABASE_KEY` (from Supabase project)
- [ ] Added `SECRET_KEY` (any random string)
- [ ] Added `FLASK_ENV` = `production`

### Deployment
- [ ] Clicked "Create Web Service"
- [ ] Waited for deployment to complete
- [ ] Saw "Live" status
- [ ] Copied backend URL (e.g., `https://jarvis-backend-xxxx.onrender.com`)
- [ ] Tested `/api/health` endpoint
- [ ] Received successful JSON response

**My Backend URL**: ___________________________________

---

## ⚛️ Step 3: Frontend Deployment (Vercel)

### Account Setup
- [ ] Created Vercel account at vercel.com
- [ ] Signed up with GitHub
- [ ] Authorized Vercel

### Project Import
- [ ] Clicked "Add New..." → "Project"
- [ ] Found `jarvis-ai-assistant` repository
- [ ] Clicked "Import"

### Configuration
- [ ] Verified Framework Preset is `Vite`
- [ ] Verified Root Directory is `./`
- [ ] Verified Build Command is `npm run build`
- [ ] Verified Output Directory is `dist`

### Environment Variables
- [ ] Added `VITE_API_URL` with backend URL from Step 2
- [ ] Verified URL has no trailing slash

### Deployment
- [ ] Clicked "Deploy"
- [ ] Waited for deployment to complete
- [ ] Saw "Congratulations!" message
- [ ] Clicked "Visit" to view live app
- [ ] Tested login/registration
- [ ] Tested chat functionality
- [ ] Verified API connection works

**My Frontend URL**: ___________________________________

---

## 🎉 Post-Deployment

- [ ] Shared frontend URL with friends/team
- [ ] Bookmarked both URLs
- [ ] Tested all major features
- [ ] Set up UptimeRobot (optional - to keep backend awake)
- [ ] Added custom domain (optional)

---

## 📝 Important URLs to Save

| Service | URL | Notes |
|---------|-----|-------|
| **GitHub Repo** | https://github.com/YOUR_USERNAME/jarvis-ai-assistant | Source code |
| **Backend (Render)** | https://jarvis-backend-xxxx.onrender.com | API server |
| **Frontend (Vercel)** | https://jarvis-ai-assistant.vercel.app | Live app |
| **Render Dashboard** | https://dashboard.render.com | Manage backend |
| **Vercel Dashboard** | https://vercel.com/dashboard | Manage frontend |
| **Groq Console** | https://console.groq.com | API keys |

---

## 🔄 How to Update Your App

When you make changes to your code:

```powershell
# Save your changes in VS Code/editor

# Stage changes
git add .

# Commit
git commit -m "Description of changes"

# Push to GitHub
git push
```

Both Render and Vercel will **automatically redeploy**! 🚀

---

## ⚠️ Common Issues & Solutions

### Issue: Backend shows "Service Unavailable"
**Solution**: Free tier sleeps after 15 min. Wait 30 seconds and refresh.

### Issue: Frontend can't connect to backend
**Solution**: Check VITE_API_URL in Vercel environment variables.

### Issue: Git push rejected
**Solution**: Run `git pull origin main` first, then push again.

### Issue: Render build fails
**Solution**: Check logs in Render dashboard. Usually missing environment variables.

### Issue: Vercel build fails
**Solution**: Check build logs. Usually missing dependencies or wrong build command.

---

## 🎯 Next Steps After Deployment

1. **Test thoroughly**: Try all features
2. **Monitor logs**: Check Render and Vercel dashboards
3. **Set up monitoring**: Use UptimeRobot to keep backend awake
4. **Share**: Send your Vercel URL to others
5. **Iterate**: Make improvements and push updates

---

## 📞 Support Resources

- **Render Support**: https://render.com/docs
- **Vercel Support**: https://vercel.com/docs
- **GitHub Help**: https://docs.github.com

---

**Status**: 
- [ ] Not Started
- [ ] In Progress
- [ ] Deployed Successfully! 🎉

---

Good luck! You've got this! 💪
