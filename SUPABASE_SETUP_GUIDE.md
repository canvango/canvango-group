# 🚀 Panduan Setup Supabase - Step by Step

## 📋 Status Saat Ini

**File `.env` masih menggunakan placeholder:**
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co  ❌ Placeholder
VITE_SUPABASE_ANON_KEY=your-anon-key-here              ❌ Placeholder
```

**Aplikasi berjalan dalam Mock Mode** karena credentials tidak valid.

---

## ✅ Langkah-Langkah Setup Supabase

### Step 1: Buat Supabase Project (5 menit)

1. **Buka Browser**
   ```
   https://supabase.com
   ```

2. **Login/Sign Up**
   - Jika belum punya akun, klik "Start your project"
   - Login dengan GitHub (recommended) atau Email

3. **Create New Project**
   - Klik "New Project"
   - Pilih Organization (atau buat baru)

4. **Isi Project Details:**
   ```
   Name: canvango-group
   Database Password: [Generate strong password - SIMPAN INI!]
   Region: Southeast Asia (Singapore) - terdekat dengan Indonesia
   Pricing Plan: Free (cukup untuk development)
   ```

5. **Klik "Create new project"**
   - Tunggu ~2 menit sampai project ready
   - Status akan berubah dari "Setting up project" → "Active"

---

### Step 2: Dapatkan Credentials (2 menit)

1. **Buka Project Settings**
   - Klik icon ⚙️ (Settings) di sidebar kiri bawah
   - Atau klik nama project → Settings

2. **Buka API Settings**
   - Klik "API" di menu Settings
   - Scroll ke bagian "Project API keys"

3. **Copy Credentials:**

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   Contoh: `https://abcdefghijklmnop.supabase.co`

   **anon/public key:**
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```
   (String panjang yang dimulai dengan `eyJ`)

   ⚠️ **JANGAN COPY service_role key** - Itu untuk backend only!

---

### Step 3: Update File .env (1 menit)

1. **Buka File**
   ```
   canvango-app/frontend/.env
   ```

2. **Replace dengan credentials asli:**
   ```env
   # API Configuration
   VITE_API_URL=

   # Supabase Configuration
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Save file**

---

### Step 4: Buat Database Tables (5 menit)

1. **Buka SQL Editor**
   - Di Supabase Dashboard
   - Klik "SQL Editor" di sidebar kiri
   - Atau: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

2. **Create New Query**
   - Klik "+ New query"

3. **Copy SQL Migration**
   - Buka file: `supabase_migrations/01_create_users_table.sql`
   - Copy semua isinya

4. **Paste & Run**
   - Paste SQL ke editor
   - Klik "Run" atau tekan Ctrl+Enter
   - Tunggu sampai selesai

5. **Verify Tables Created**
   - Klik "Table Editor" di sidebar
   - Anda harus melihat tables:
     - ✅ users
     - ✅ products
     - ✅ transactions
     - ✅ warranty_claims
     - ✅ verified_bm_orders
     - ✅ api_keys

---

### Step 5: Enable Email Authentication (2 menit)

1. **Buka Authentication Settings**
   - Klik "Authentication" di sidebar
   - Klik "Providers"

2. **Enable Email Provider**
   - Cari "Email"
   - Toggle ON jika belum aktif

3. **Configure Settings:**
   ```
   ✅ Enable email provider
   ✅ Confirm email: ON (recommended)
   ✅ Secure email change: ON
   ✅ Secure password change: ON
   ```

4. **Save Changes**

---

### Step 6: Configure Email Templates (Optional - 3 menit)

1. **Buka Email Templates**
   - Authentication → Email Templates

2. **Customize Templates:**
   - Confirmation email
   - Password reset email
   - Magic link email

3. **Update dengan branding Canvango:**
   ```html
   <h2>Welcome to Canvango Group!</h2>
   <p>Click the link below to confirm your email:</p>
   {{ .ConfirmationURL }}
   ```

---

### Step 7: Test Connection (2 menit)

1. **Restart Dev Server**
   ```bash
   # Stop server (Ctrl+C)
   # Start again
   npm run dev
   ```

2. **Open Browser**
   ```
   http://localhost:5174
   ```

3. **Check Console**
   - Buka Developer Tools (F12)
   - Lihat Console
   - Seharusnya TIDAK ada warning:
     ❌ "Supabase credentials not found"
   
   Jika masih ada warning, credentials belum benar.

4. **Test Register**
   - Klik "Register"
   - Isi form:
     ```
     Username: testuser
     Email: test@example.com
     Full Name: Test User
     Password: password123
     ```
   - Klik Register

5. **Check Supabase Dashboard**
   - Buka Authentication → Users
   - Anda harus melihat user baru terdaftar
   - Status: "Waiting for verification" (jika email confirmation ON)

6. **Check Email**
   - Buka email test@example.com
   - Cari email dari Supabase
   - Klik link confirmation

7. **Test Login**
   - Kembali ke aplikasi
   - Login dengan:
     ```
     Email: test@example.com
     Password: password123
     ```
   - Harus berhasil login dan redirect ke dashboard

---

## 🔍 Troubleshooting

### Issue 1: "Invalid API key"

**Penyebab:**
- Copy anon key yang salah
- Copy service_role key (jangan!)
- Typo saat paste

**Solusi:**
1. Kembali ke Supabase Dashboard
2. Settings → API
3. Copy ulang "anon public" key
4. Paste ke `.env`
5. Restart dev server

---

### Issue 2: "relation 'users' does not exist"

**Penyebab:**
- SQL migration belum dijalankan
- SQL error saat run migration

**Solusi:**
1. Buka SQL Editor
2. Run migration lagi
3. Check Table Editor
4. Pastikan semua tables ada

---

### Issue 3: "Email not confirmed"

**Penyebab:**
- Email confirmation enabled
- User belum klik link confirmation

**Solusi:**

**Option A: Confirm Manual**
1. Buka Authentication → Users
2. Klik user
3. Klik "Confirm email"

**Option B: Disable Email Confirmation**
1. Authentication → Providers → Email
2. Toggle OFF "Confirm email"
3. Save

---

### Issue 4: Warning masih muncul

**Penyebab:**
- `.env` belum ter-load
- Dev server belum restart
- Typo di variable name

**Solusi:**
1. Check `.env` file:
   ```env
   VITE_SUPABASE_URL=https://...  ✅ Harus ada VITE_ prefix
   VITE_SUPABASE_ANON_KEY=eyJ...  ✅ Harus ada VITE_ prefix
   ```

2. Restart dev server:
   ```bash
   # Stop (Ctrl+C)
   npm run dev
   ```

3. Clear browser cache:
   - Ctrl+Shift+Delete
   - Clear cache
   - Reload page

---

## 📊 Verification Checklist

Setelah setup, verify semua ini:

### ✅ Environment Variables
```bash
# Di browser console, check:
console.log(import.meta.env.VITE_SUPABASE_URL);
# Output: https://xxxxx.supabase.co (bukan placeholder)

console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
# Output: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (bukan placeholder)
```

### ✅ Database Tables
Di Supabase Dashboard → Table Editor:
- [ ] users
- [ ] products
- [ ] transactions
- [ ] warranty_claims
- [ ] verified_bm_orders
- [ ] api_keys

### ✅ Authentication
- [ ] Email provider enabled
- [ ] Can register new user
- [ ] User appears in Authentication → Users
- [ ] Can login with registered user

### ✅ Application
- [ ] No Supabase warning in console
- [ ] Register creates real user in database
- [ ] Login works with real credentials
- [ ] User data persists after refresh
- [ ] Logout works

---

## 🎯 Expected Behavior

### Before Setup (Mock Mode)
```
✅ Login dengan username/password apa saja
✅ User data mock (balance Rp 1.000.000)
❌ Data hilang saat refresh
❌ Tidak ada di database
```

### After Setup (Real Mode)
```
✅ Login hanya dengan credentials yang terdaftar
✅ User data real dari database
✅ Data persist setelah refresh
✅ User tersimpan di Supabase
✅ Password reset works
```

---

## 💡 Tips

### 1. Simpan Credentials dengan Aman
```
Project URL: https://xxxxx.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Database Password: [password yang Anda buat]
```

Simpan di password manager atau file aman.

### 2. Jangan Commit .env ke Git
File `.env` sudah ada di `.gitignore`. Pastikan tidak ter-commit.

### 3. Use .env.example for Team
File `.env.example` adalah template. Team members copy ke `.env` dan isi credentials mereka sendiri.

### 4. Monitor Usage
- Supabase Free tier: 500MB database, 2GB bandwidth
- Check usage di Dashboard → Settings → Usage

### 5. Backup Database
- Settings → Database → Backups
- Free tier: Daily backups (7 days retention)

---

## 🚀 Quick Start Commands

```bash
# 1. Update .env dengan credentials asli
nano canvango-app/frontend/.env

# 2. Restart dev server
cd canvango-app/frontend
npm run dev

# 3. Test di browser
# Open: http://localhost:5174
# Register new user
# Check Supabase Dashboard
```

---

## 📞 Need Help?

### Supabase Documentation
- https://supabase.com/docs
- https://supabase.com/docs/guides/auth

### Supabase Discord
- https://discord.supabase.com

### Check Status
- https://status.supabase.com

---

## ✨ Summary

**Current Status:** ❌ Credentials masih placeholder

**To Fix:**
1. Create Supabase project
2. Get real credentials
3. Update `.env` file
4. Run SQL migration
5. Restart dev server
6. Test register/login

**Time Required:** ~15-20 minutes

**Result:** Aplikasi akan menggunakan real database dan authentication

---

**Ready to setup?** Follow langkah-langkah di atas! 🚀
