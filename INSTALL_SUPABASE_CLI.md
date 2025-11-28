# 📦 Install Supabase CLI - Windows

## 🎯 Pilihan Instalasi

### **Opsi 1: Via Scoop (Recommended)** ⭐

Scoop adalah package manager untuk Windows (seperti apt di Linux).

#### Step 1: Install Scoop
Buka **PowerShell** (sebagai Administrator), jalankan:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

#### Step 2: Install Supabase CLI
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### Step 3: Verify
```powershell
supabase --version
```

---

### **Opsi 2: Via Chocolatey**

Jika kamu sudah punya Chocolatey:

```powershell
choco install supabase
```

---

### **Opsi 3: Download Binary (Manual)**

1. Download dari: https://github.com/supabase/cli/releases
2. Download file: `supabase_windows_amd64.zip`
3. Extract ke folder (misal: `C:\supabase`)
4. Tambahkan ke PATH:
   - Buka **System Properties** → **Environment Variables**
   - Edit **Path** → Add `C:\supabase`
5. Restart terminal
6. Test: `supabase --version`

---

### **Opsi 4: Via NPX (Temporary, No Install)**

Jika tidak mau install, bisa pakai npx (temporary):

```bash
npx supabase@latest --version
npx supabase@latest login
npx supabase@latest link --project-ref gpittnsfzgkdbqnccncn
npx supabase@latest functions deploy tripay-callback
npx supabase@latest secrets set TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz
```

**Note:** Setiap command harus pakai `npx supabase@latest`

---

## 🚀 Setelah Install

### 1. Login ke Supabase
```bash
supabase login
```

Browser akan terbuka, login dengan akun Supabase kamu.

### 2. Link Project
```bash
supabase link --project-ref gpittnsfzgkdbqnccncn
```

### 3. Deploy Edge Function
```bash
supabase functions deploy tripay-callback
```

### 4. Set Secret
```bash
supabase secrets set TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz
```

### 5. Verify
```bash
supabase functions list
```

---

## ✅ Quick Commands

```bash
# Check version
supabase --version

# Login
supabase login

# Link project
supabase link --project-ref gpittnsfzgkdbqnccncn

# Deploy function
supabase functions deploy tripay-callback

# Set secret
supabase secrets set TRIPAY_PRIVATE_KEY=BqOm1-ItF0o-LNlRZ-YhPK8-PZjNz

# View logs
supabase functions logs tripay-callback --tail

# List functions
supabase functions list
```

---

## 🐛 Troubleshooting

### "supabase: command not found"
- Restart terminal setelah install
- Check PATH environment variable
- Try `npx supabase@latest` instead

### "Permission denied"
- Run PowerShell as Administrator
- Check antivirus tidak block

### "Failed to link project"
- Make sure sudah login: `supabase login`
- Check project ref benar: `gpittnsfzgkdbqnccncn`

---

## 📞 Support

- Supabase CLI Docs: https://supabase.com/docs/guides/cli
- GitHub Issues: https://github.com/supabase/cli/issues
- Scoop: https://scoop.sh/

---

**Recommended:** Opsi 1 (Scoop) atau Opsi 4 (NPX) untuk paling mudah!
