# Fix Email Redirect URL - Production Domain

## 🐛 Problem

Email konfirmasi redirect ke `localhost:5173` bukan ke domain production (`canvango.com`)

## ✅ Solusi: Update Site URL di Supabase

### Step 1: Update Site URL

1. Login ke **Supabase Dashboard**: https://supabase.com/dashboard
2. Pilih project Anda
3. Pergi ke: **Authentication → URL Configuration**
4. Update **Site URL** menjadi:

```
https://canvango.com
```

atau

```
https://www.canvango.com
```

(Sesuaikan dengan domain production Anda)

### Step 2: Update Redirect URLs

Di bagian **Redirect URLs**, tambahkan:

```
https://canvango.com/**
https://www.canvango.com/**
http://localhost:5173/** (untuk development)
```

**Format:**
- Production: `https://canvango.com/**`
- Development: `http://localhost:5173/**`
- Wildcard `**` untuk allow semua path

### Step 3: Save Configuration

1. Klik **Save**
2. Tunggu beberapa detik untuk propagasi

---

## 🧪 Testing

### Test 1: Register User Baru

1. Buka **production site**: https://canvango.com
2. Register dengan email baru
3. Check inbox
4. Klik link konfirmasi
5. **Harus redirect ke**: `https://canvango.com/#access_token=...`

### Test 2: Reset Password

1. Klik "Forgot Password"
2. Check inbox
3. Klik link reset
4. **Harus redirect ke**: `https://canvango.com/reset-password`

---

## 🔧 Advanced: Custom Redirect per Environment

Jika mau redirect berbeda untuk dev vs production, update di code:

### File: `src/config/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Detect environment
const redirectUrl = import.meta.env.PROD 
  ? 'https://canvango.com'  // Production
  : 'http://localhost:5173'; // Development

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo: redirectUrl,
    autoRefreshToken: true,
    persistSession: true,
  }
});
```

---

## 📋 Checklist

- [ ] Update Site URL di Supabase → `https://canvango.com`
- [ ] Tambah Redirect URLs (production + localhost)
- [ ] Save configuration
- [ ] Test register user baru di production
- [ ] Verify redirect ke domain production
- [ ] Test reset password juga

---

## ⚠️ Catatan Penting

1. **Site URL** adalah default redirect setelah email confirmation
2. **Redirect URLs** adalah whitelist domain yang diizinkan
3. Gunakan `**` wildcard untuk allow semua path
4. Jangan hapus `localhost` jika masih development

---

## 🎯 Expected Result

**SEBELUM:**
```
localhost:5173/#access_token=...
```

**SESUDAH:**
```
https://canvango.com/#access_token=...
```

---

**Status:** [ ] Pending / [ ] Fixed
**Updated:** 2 Desember 2024
