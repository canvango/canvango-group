# Cloudflare Turnstile - Quick Commands

## 🚀 Development

### Start Dev Server
```bash
npm run dev
```
Visit: http://localhost:5173/login

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 🔧 Configuration

### Check Environment Variables
```bash
# Windows (PowerShell)
cat .env | Select-String TURNSTILE

# Linux/Mac
cat .env | grep TURNSTILE
```

### Update Keys
```bash
# Edit .env file
notepad .env  # Windows
nano .env     # Linux/Mac
```

---

## 📦 Deployment

### Deploy to Vercel
```bash
# Commit changes
git add .
git commit -m "Update Turnstile configuration"

# Push to deploy
git push origin main
```

### Check Deployment Status
```bash
vercel ls
```

---

## 📊 Monitoring

### View Vercel Logs
```bash
# All logs
vercel logs

# Turnstile logs only
vercel logs --filter="verify-turnstile"

# Real-time logs
vercel logs --follow

# Last 100 lines
vercel logs --limit=100
```

### Check Build Status
```bash
vercel inspect
```

---

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

### Test API Endpoint
```bash
# Test verify endpoint (PowerShell)
Invoke-RestMethod -Uri "http://localhost:5173/api/verify-turnstile" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"token":"test-token"}'

# Test verify endpoint (curl)
curl -X POST http://localhost:5173/api/verify-turnstile \
  -H "Content-Type: application/json" \
  -d '{"token":"test-token"}'
```

---

## 🔍 Debugging

### Check TypeScript Errors
```bash
npx tsc --noEmit
```

### Check Linting
```bash
npm run lint
```

### Clear Cache
```bash
# Clear Vite cache
rm -rf node_modules/.vite

# Clear build
rm -rf dist

# Reinstall dependencies
npm install
```

---

## 🌐 Cloudflare

### Open Cloudflare Dashboard
```bash
# Windows
start https://dash.cloudflare.com/

# Mac
open https://dash.cloudflare.com/

# Linux
xdg-open https://dash.cloudflare.com/
```

### View Turnstile Analytics
Direct link: https://dash.cloudflare.com/?to=/:account/turnstile

---

## 🔐 Security

### Rotate Keys
1. Generate new keys in Cloudflare Dashboard
2. Update `.env`:
   ```bash
   VITE_TURNSTILE_SITE_KEY=new-site-key
   TURNSTILE_SECRET_KEY=new-secret-key
   ```
3. Update Vercel environment variables
4. Redeploy:
   ```bash
   git push
   ```

### Disable Turnstile Temporarily
```bash
# Edit .env
VITE_TURNSTILE_SITE_KEY=

# Restart dev server
npm run dev
```

---

## 📱 Quick Tests

### Test Login Form
```bash
# Open login page
start http://localhost:5173/login  # Windows
open http://localhost:5173/login   # Mac
```

### Test Register Form
```bash
start http://localhost:5173/register  # Windows
open http://localhost:5173/register   # Mac
```

### Test Forgot Password
```bash
start http://localhost:5173/forgot-password  # Windows
open http://localhost:5173/forgot-password   # Mac
```

---

## 🔄 Git Commands

### Check Status
```bash
git status
```

### View Changes
```bash
git diff
```

### Commit All Changes
```bash
git add .
git commit -m "Your message"
git push
```

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

---

## 📦 Package Management

### Update Dependencies
```bash
npm update
```

### Check Outdated Packages
```bash
npm outdated
```

### Install Specific Version
```bash
npm install @marsidev/react-turnstile@latest
```

---

## 🎯 Quick Fixes

### Widget Not Showing
```bash
# 1. Check keys
cat .env | Select-String TURNSTILE

# 2. Restart server
npm run dev
```

### Build Errors
```bash
# 1. Clear cache
rm -rf node_modules/.vite dist

# 2. Reinstall
npm install

# 3. Rebuild
npm run build
```

### Deployment Issues
```bash
# 1. Check Vercel status
vercel ls

# 2. View logs
vercel logs

# 3. Redeploy
vercel --prod
```

---

## 📚 Documentation Commands

### View Documentation
```bash
# Windows
start TURNSTILE_README.md
start CLOUDFLARE_TURNSTILE_IMPLEMENTATION.md

# Mac
open TURNSTILE_README.md
open CLOUDFLARE_TURNSTILE_IMPLEMENTATION.md

# Linux
xdg-open TURNSTILE_README.md
```

### Search Documentation
```bash
# Windows (PowerShell)
Select-String -Path "TURNSTILE_*.md" -Pattern "keyword"

# Linux/Mac
grep -r "keyword" TURNSTILE_*.md
```

---

## 🎊 One-Liners

### Full Reset & Restart
```bash
rm -rf node_modules/.vite dist && npm install && npm run dev
```

### Quick Deploy
```bash
git add . && git commit -m "Update" && git push
```

### Check Everything
```bash
npm run lint && npm run build && npm test
```

### View All Turnstile Files
```bash
ls TURNSTILE_*.md
```

---

## 💡 Pro Tips

### Alias Commands (Add to your shell profile)
```bash
# ~/.bashrc or ~/.zshrc
alias dev="npm run dev"
alias build="npm run build"
alias deploy="git add . && git commit -m 'Deploy' && git push"
alias logs="vercel logs --follow"
```

### Watch Mode
```bash
# Auto-rebuild on changes
npm run dev
```

### Performance Check
```bash
# Analyze bundle size
npm run build -- --analyze
```

---

**Save this file for quick reference! 📌**
