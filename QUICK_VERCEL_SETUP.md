# Quick Vercel Setup - 5 Minutes

## 🎯 Langkah Cepat

### 1. Import Project (2 min)

1. Go to: https://vercel.com/new
2. Import: `canvango/canvango-group`
3. Framework: **Other**
4. Root Directory: `.` (default)

### 2. Add Environment Variables (3 min)

**Copy dari `.env` lokal Anda:**

```bash
# Backend
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
JWT_REFRESH_SECRET=

# Frontend (must start with VITE_)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_TURNSTILE_SITE_KEY=
```

**Untuk setiap variable:**
- Check: Production ✅, Preview ✅, Development ✅

### 3. Deploy

Click **Deploy** → Wait 2-5 minutes

### 4. Test

```bash
# Ganti dengan URL Vercel Anda
https://your-project.vercel.app/        # Homepage
https://your-project.vercel.app/login   # Login (not 404!)
https://your-project.vercel.app/api/health  # API
```

## ✅ Success Checklist

- [ ] Build completed (no errors)
- [ ] Homepage loads
- [ ] Login page loads (not 404!)
- [ ] Can login
- [ ] Dashboard works

## 🐛 If Error

### Build Failed
→ Check build logs for TypeScript errors

### 500 Error
→ Check environment variables are set

### 404 on Routes
→ Check `vercel.json` exists (it does!)

### Can't Login
→ Check Supabase credentials in env vars

## 📚 Full Documentation

- `VERCEL_SETUP_FROM_SCRATCH.md` - Detailed guide
- `VERCEL_DEPLOYMENT_GUIDE.md` - Architecture & troubleshooting
- `VERCEL_CHECKLIST.md` - Complete checklist

---

**Time**: 5 minutes
**Difficulty**: Easy
**Status**: ✅ Ready
