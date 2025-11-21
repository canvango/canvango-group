# Rollback Quick Reference Guide

## 🚨 Emergency Rollback (5 Minutes)

### Restore Legacy Frontend Immediately

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Restore from backup
xcopy /E /I /Y ".kiro\specs\project-consolidation\backup\legacy-frontend" "canvango-app\frontend"

# 3. Navigate and install
cd canvango-app\frontend
npm install

# 4. Configure environment
copy .env.example .env
# Edit .env with your Supabase credentials

# 5. Start server
npm run dev
```

---

## 📋 Rollback Decision Matrix

| Symptom | Rollback Type | Time | Command |
|---------|--------------|------|---------|
| App won't start | Complete | 15 min | See [Complete Rollback](#complete-rollback) |
| Login broken | Auth Service | 10 min | See [Auth Rollback](#auth-rollback) |
| Routes 404 | Routing | 10 min | See [Routing Rollback](#routing-rollback) |
| Build fails | Configuration | 10 min | See [Config Rollback](#config-rollback) |
| npm install fails | Dependencies | 10 min | See [Dependency Rollback](#dependency-rollback) |
| Specific page broken | Component | 5 min | See [Component Rollback](#component-rollback) |

---

## 🔄 Complete Rollback

```bash
# Restore legacy frontend
xcopy /E /I /Y ".kiro\specs\project-consolidation\backup\legacy-frontend" "canvango-app\frontend"

# Setup
cd canvango-app\frontend
npm install
copy .env.example .env
# Edit .env with credentials
npm run dev
```

---

## 🔐 Auth Rollback

```bash
# Restore auth files
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\src\contexts\AuthContext.tsx" "src\features\member-area\contexts\AuthContext.tsx"
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\src\services\auth.ts" "src\features\member-area\services\auth.ts"
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\src\lib\supabase.ts" "src\features\member-area\services\supabase.ts"

# Restart
npm run dev
```

---

## 🗺️ Routing Rollback

```bash
# Restore routing
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\src\App.tsx" "src\features\member-area\App.tsx"
xcopy /E /I /Y ".kiro\specs\project-consolidation\backup\legacy-frontend\src\pages" "src\features\member-area\pages"

# Update main.tsx to use restored App.tsx
# Restart
npm run dev
```

---

## ⚙️ Config Rollback

```bash
# Restore configs
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\vite.config.ts" "vite.config.ts"
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\tsconfig.json" "tsconfig.json"
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\tailwind.config.js" "tailwind.config.js"

# Clear cache and rebuild
rmdir /s /q node_modules\.vite
rmdir /s /q dist
npm run build
```

---

## 📦 Dependency Rollback

```bash
# Restore package files
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\package.json" "package.json"
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\package-lock.json" "package-lock.json"

# Clean install
rmdir /s /q node_modules
npm install
npm run build
```

---

## 🧩 Component Rollback

```bash
# Example: Restore Dashboard component
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\src\pages\Dashboard.tsx" "src\features\member-area\pages\Dashboard.tsx"

# Restart
npm run dev
```

---

## ✅ Verification Checklist

After any rollback:

```bash
# 1. Server starts
npm run dev
# ✅ No errors in console

# 2. Test in browser
# ✅ Login page loads
# ✅ Can authenticate
# ✅ Dashboard displays
# ✅ Navigation works

# 3. Build works
npm run build
# ✅ Build succeeds
# ✅ No TypeScript errors
```

---

## 🆘 Common Issues

### Port Already in Use

```bash
netstat -ano | findstr :5173
taskkill /PID <process_id> /F
```

### Module Not Found

```bash
rmdir /s /q node_modules
npm install
```

### Supabase Connection Failed

```bash
# Check .env.development.local has:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

### TypeScript Errors

```bash
rmdir /s /q node_modules\.cache
npm run build:tsc
```

---

## 📞 Emergency Contacts

**Development Team Lead:** [To be filled]  
**DevOps:** [To be filled]  
**Database Admin:** [To be filled]

---

## 📍 Backup Location

**Primary Backup:**  
`.kiro\specs\project-consolidation\backup\legacy-frontend\`

**Verify Backup:**
```bash
dir ".kiro\specs\project-consolidation\backup\legacy-frontend\package.json"
```

---

## 📚 Full Documentation

For detailed procedures, see:  
`.kiro/specs/project-consolidation/ROLLBACK_PLAN.md`

---

**Last Updated:** November 17, 2025  
**Version:** 1.0
