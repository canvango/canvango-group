# Manual Vercel Deployment Guide

## If GitHub Auto-Deploy Fails

Jika Vercel tidak otomatis deploy dari GitHub, ada beberapa cara:

---

## Option 1: Manual Trigger di Vercel Dashboard (Tercepat)

### Steps:

1. **Go to Vercel Dashboard**
   - URL: https://vercel.com/dashboard
   - Login dengan akun Anda

2. **Select Project**
   - Cari project "canvango-group" atau nama project Anda
   - Klik untuk masuk

3. **Go to Deployments Tab**
   - Klik tab "Deployments"

4. **Redeploy Latest**
   - Cari deployment terbaru
   - Klik tombol "..." (three dots)
   - Pilih "Redeploy"
   - Confirm

5. **Wait for Deployment**
   - Status akan berubah: Building → Deploying → Ready
   - Tunggu sampai ✅ Ready

---

## Option 2: Deploy via Vercel CLI

### Install Vercel CLI (jika belum):

```bash
npm install -g vercel
```

### Login:

```bash
vercel login
```

### Deploy:

```bash
# From project root
vercel --prod
```

### Follow Prompts:

```
? Set up and deploy "~/canvango-group"? [Y/n] y
? Which scope do you want to deploy to? [Your Team]
? Link to existing project? [Y/n] y
? What's the name of your existing project? canvango-group
```

### Wait for Deployment:

```
✅ Production: https://canvango.com [copied to clipboard]
```

---

## Option 3: Check Vercel Integration

Jika auto-deploy tidak bekerja, mungkin integrasi GitHub-Vercel perlu di-reconnect:

### Steps:

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Select Project → Settings**
   - Klik project Anda
   - Go to "Settings" tab

3. **Git Integration**
   - Scroll ke "Git"
   - Check apakah GitHub connected
   - Jika tidak, klik "Connect Git Repository"

4. **Reconnect GitHub**
   - Pilih repository: canvango/canvango-group
   - Branch: main
   - Save

5. **Test Auto-Deploy**
   - Make small change (e.g., add comment)
   - Commit and push
   - Check if Vercel auto-deploys

---

## Option 4: Check Build Logs

Jika deployment gagal, cek error di build logs:

### Steps:

1. **Go to Vercel Dashboard → Deployments**

2. **Click Failed Deployment**
   - Look for red ❌ status

3. **View Build Logs**
   - Klik deployment yang gagal
   - Scroll ke "Build Logs"
   - Cari error message

4. **Common Errors:**

   **Error: Module not found**
   ```
   Solution: Check package.json dependencies
   ```

   **Error: Build timeout**
   ```
   Solution: Increase build timeout in vercel.json
   ```

   **Error: TypeScript errors**
   ```
   Solution: Fix TypeScript errors in code
   ```

---

## Quick Test After Deployment

### 1. Check Deployment URL

```bash
curl -X POST https://canvango.com/api/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test": true}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid signature"
}
```

✅ This means proxy is working! (Signature invalid is OK for test)

### 2. Test with TriPay Callback Tester

1. Go to: https://tripay.co.id/simulator/console/callback
2. Click "Test Callback"
3. Expected: Status BERHASIL (not 307!)

---

## Troubleshooting

### Issue: Vercel CLI not found

```bash
npm install -g vercel
```

### Issue: Permission denied

```bash
# Windows (Run as Administrator)
npm install -g vercel

# Mac/Linux
sudo npm install -g vercel
```

### Issue: Build fails with TypeScript error

Check `api/tripay-callback.ts` for syntax errors:

```bash
npx tsc --noEmit
```

### Issue: Deployment stuck

1. Cancel deployment
2. Try again
3. Or use Vercel CLI

---

## Verification Checklist

After deployment:

- [ ] Vercel dashboard shows ✅ Ready
- [ ] Test curl command returns response (not 307)
- [ ] TriPay Callback Tester shows BERHASIL
- [ ] Create real transaction and verify balance updates

---

## Current Status

**Latest Commit:** `f1cc84d` - Simplified raw body reading  
**Changes:** Fixed async iteration to use event listeners  
**Ready to Deploy:** ✅ Yes

---

## Recommended Action

**Easiest:** Go to Vercel Dashboard and manually trigger redeploy

**Alternative:** Use Vercel CLI: `vercel --prod`

**Time:** 2-3 minutes for deployment

---

**Need Help?**
- Check Vercel build logs for errors
- Verify GitHub integration is connected
- Try manual deployment via CLI
