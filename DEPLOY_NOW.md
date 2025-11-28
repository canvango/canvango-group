# 🚀 DEPLOY TRIPAY - PILIH METHOD

## ⚡ Method 1: NPX (PALING MUDAH) ⭐ RECOMMENDED

**Tidak perlu install apapun!** Langsung jalankan:

```bash
deploy-tripay-npx.bat
```

Atau manual:
```bash
npx supabase@latest login
npx supabase@latest link --project-ref gpittnsfzgkdbqnccncn
npx supabase@latest functions deploy tripay-callback
npx supabase@latest secrets set TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz
```

**Time:** ~5 minutes
**Requirement:** Node.js only

---

## 🌐 Method 2: Supabase Dashboard (MANUAL)

1. Buka https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/functions
2. Click **Create Function**
3. Name: `tripay-callback`
4. Copy-paste code dari `supabase/functions/tripay-callback/index.ts`
5. Click **Deploy**
6. Go to Settings → Add secret:
   - Key: `TRIPAY_PRIVATE_KEY`
   - Value: `BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz`

**Time:** ~3 minutes
**Requirement:** Browser only

---

## 🔧 Method 3: Install CLI First

### Step 1: Install Supabase CLI

**Via Scoop (Recommended):**
```powershell
# Install Scoop first (PowerShell as Admin)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install Supabase CLI
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

**Via Chocolatey:**
```powershell
choco install supabase
```

### Step 2: Deploy
```bash
deploy-tripay.bat
```

**Time:** ~10 minutes (including install)
**Requirement:** Scoop or Chocolatey

---

## 📊 Comparison

| Method | Time | Difficulty | Requirements |
|--------|------|------------|--------------|
| **NPX** ⭐ | 5 min | ⭐ Easy | Node.js |
| **Dashboard** | 3 min | ⭐⭐ Medium | Browser |
| **CLI** | 10 min | ⭐⭐⭐ Hard | Scoop/Choco |

---

## ✅ After Deployment

### 1. Verify Function Deployed
```bash
# Via NPX
npx supabase@latest functions list

# Via Dashboard
https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/functions
```

### 2. Test Function
```bash
curl https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback -X POST -H "Content-Type: application/json" -d "{\"test\": true}"
```

Expected: `{"success":false,"message":"Missing signature"}`

### 3. Configure Tripay Dashboard
1. Login: https://tripay.co.id/member
2. Set Callback URL:
   ```
   https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback
   ```
3. Whitelist IP: Kosongkan
4. Inkonsistensi: Tidak
5. Save

### 4. Test Payment Flow
```bash
npm run dev
# Login → Top-Up → Test payment
```

---

## 🎯 RECOMMENDATION

**Untuk kamu:** Pakai **Method 1 (NPX)** karena:
- ✅ Paling cepat (5 menit)
- ✅ Tidak perlu install apapun
- ✅ Langsung jalan
- ✅ Cocok untuk testing

**Command:**
```bash
deploy-tripay-npx.bat
```

---

## 📞 Need Help?

**Files:**
- `INSTALL_SUPABASE_CLI.md` - CLI installation guide
- `DEPLOY_TRIPAY_ALTERNATIVE.md` - All deployment methods
- `TRIPAY_QUICK_START.md` - Quick start guide

**Support:**
- Supabase: https://supabase.com/dashboard/support
- Tripay: https://tripay.co.id/member/ticket

---

**Ready?** Run `deploy-tripay-npx.bat` sekarang! 🚀
