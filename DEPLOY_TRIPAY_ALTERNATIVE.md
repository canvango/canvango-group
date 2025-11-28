# 🚀 Deploy Tripay - Alternative Methods

## ⚡ Method 1: Via NPX (No Install Required) ⭐ EASIEST

Tidak perlu install Supabase CLI, langsung pakai NPX:

```bash
# 1. Login
npx supabase@latest login

# 2. Link project
npx supabase@latest link --project-ref gpittnsfzgkdbqnccncn

# 3. Deploy Edge Function
npx supabase@latest functions deploy tripay-callback

# 4. Set secret
npx supabase@latest secrets set TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz

# 5. Verify
npx supabase@latest functions list
```

**Keuntungan:**
- ✅ Tidak perlu install apapun
- ✅ Langsung jalan
- ✅ Selalu pakai versi terbaru

**Kekurangan:**
- ⚠️ Harus pakai `npx supabase@latest` setiap command
- ⚠️ Sedikit lebih lambat (download setiap kali)

---

## 🌐 Method 2: Via Supabase Dashboard (Manual Upload)

Deploy manual via web dashboard:

### Step 1: Zip Edge Function
```bash
# Buat zip file dari folder function
cd supabase/functions/tripay-callback
# Zip semua file (index.ts)
```

### Step 2: Upload via Dashboard
1. Buka https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn
2. Go to **Edge Functions**
3. Click **Create Function**
4. Name: `tripay-callback`
5. Upload `index.ts` file
6. Click **Deploy**

### Step 3: Set Environment Variable
1. Go to **Project Settings** → **Edge Functions**
2. Add secret:
   - Key: `TRIPAY_PRIVATE_KEY`
   - Value: `BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz`
3. Save

---

## 🔧 Method 3: Via GitHub Actions (CI/CD)

Setup automatic deployment via GitHub:

### Step 1: Create GitHub Secrets
1. Go to GitHub repo → Settings → Secrets
2. Add secrets:
   - `SUPABASE_ACCESS_TOKEN` - Get from https://supabase.com/dashboard/account/tokens
   - `SUPABASE_PROJECT_ID` - `gpittnsfzgkdbqnccncn`

### Step 2: Create Workflow File
Create `.github/workflows/deploy-edge-functions.yml`:

```yaml
name: Deploy Edge Functions

on:
  push:
    branches:
      - main
    paths:
      - 'supabase/functions/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      
      - name: Deploy Edge Functions
        run: |
          supabase functions deploy tripay-callback \
            --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
      
      - name: Set Secrets
        run: |
          supabase secrets set TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz \
            --project-ref ${{ secrets.SUPABASE_PROJECT_ID }}
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

### Step 3: Push to GitHub
```bash
git add .
git commit -m "Add Tripay Edge Function"
git push
```

GitHub Actions akan auto-deploy!

---

## 📱 Method 4: Via Supabase CLI (After Install)

Jika sudah install Supabase CLI (via Scoop/Chocolatey):

```bash
# 1. Login
supabase login

# 2. Link project
supabase link --project-ref gpittnsfzgkdbqnccncn

# 3. Deploy
supabase functions deploy tripay-callback

# 4. Set secret
supabase secrets set TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz
```

Install guide: `INSTALL_SUPABASE_CLI.md`

---

## 🎯 Recommended Method

### For Quick Testing: **Method 1 (NPX)** ⭐
- Paling cepat
- Tidak perlu install
- Cocok untuk testing

### For Production: **Method 3 (GitHub Actions)** 🚀
- Auto-deploy on push
- CI/CD ready
- Best practice

### For Manual Control: **Method 4 (CLI)** 🔧
- Full control
- Local development
- Debugging

---

## ✅ Verification

Setelah deploy dengan method apapun, verify:

### 1. Check Function Exists
```bash
# Via NPX
npx supabase@latest functions list

# Via CLI
supabase functions list

# Via Dashboard
https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/functions
```

### 2. Test Function
```bash
curl https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-callback \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

Expected response:
```json
{
  "success": false,
  "message": "Missing signature"
}
```

### 3. Check Logs
```bash
# Via NPX
npx supabase@latest functions logs tripay-callback --tail

# Via CLI
supabase functions logs tripay-callback --tail

# Via Dashboard
https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/logs/edge-functions
```

---

## 🐛 Troubleshooting

### NPX: "command not found"
- Make sure Node.js installed
- Try: `npm --version`
- Reinstall Node.js if needed

### Dashboard: Upload failed
- Check file size < 1MB
- Make sure `index.ts` valid TypeScript
- Check syntax errors

### GitHub Actions: Deploy failed
- Check secrets configured correctly
- Verify access token valid
- Check workflow file syntax

---

## 📞 Need Help?

**Documentation:**
- `INSTALL_SUPABASE_CLI.md` - CLI installation guide
- `TRIPAY_QUICK_START.md` - Quick start guide
- Supabase Docs: https://supabase.com/docs/guides/functions

**Support:**
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: https://github.com/supabase/cli/issues

---

**Recommendation:** Start with **Method 1 (NPX)** untuk paling mudah dan cepat!
