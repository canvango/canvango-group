# Cloudflare Turnstile - Quick Start Guide

## 🚀 5 Menit Setup

### Step 1: Dapatkan Keys (2 menit)

1. Buka https://dash.cloudflare.com/
2. Klik **Turnstile** → **Add Site**
3. Isi:
   - Site name: `Canvango Member Area`
   - Domain: `localhost` (untuk dev) atau domain production
   - Mode: **Managed**
4. Copy:
   - **Site Key** (public)
   - **Secret Key** (private)

### Step 2: Setup Local (1 menit)

Edit `.env`:

```env
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
```

Restart dev server:

```bash
npm run dev
```

### Step 3: Setup Vercel (2 menit)

1. Buka Vercel Dashboard
2. Project → **Settings** → **Environment Variables**
3. Add:
   ```
   VITE_TURNSTILE_SITE_KEY = your-site-key
   TURNSTILE_SECRET_KEY = your-secret-key
   ```
4. Deploy:
   ```bash
   git push
   ```

## ✅ Testing

### Local

1. Buka http://localhost:5173/login
2. Lihat Turnstile widget di bawah password field
3. Widget akan auto-verify
4. Button "Masuk" akan enabled setelah verify

### Production

1. Buka production URL
2. Test login/register/forgot-password
3. Cek Vercel logs jika ada error

## 🎯 What's Protected

- ✅ Login form
- ✅ Register form
- ✅ Forgot password form

## 🔧 Disable Turnstile

Hapus atau kosongkan di `.env`:

```env
VITE_TURNSTILE_SITE_KEY=
```

Form akan berfungsi normal tanpa Turnstile.

## 📊 Monitor

**Cloudflare Dashboard:**
- Turnstile → Analytics
- Lihat verification stats

**Vercel Logs:**
```bash
vercel logs --filter="verify-turnstile"
```

## 🐛 Common Issues

### Widget tidak muncul
- Cek `VITE_TURNSTILE_SITE_KEY` di `.env`
- Restart dev server

### Verification failed
- Cek `TURNSTILE_SECRET_KEY` di Vercel
- Cek Vercel function logs

### Domain error
- Update domain di Cloudflare Turnstile settings
- Tambahkan production domain

## 📚 Full Documentation

Lihat [CLOUDFLARE_TURNSTILE_IMPLEMENTATION.md](./CLOUDFLARE_TURNSTILE_IMPLEMENTATION.md) untuk detail lengkap.

---

**Need Help?** Check Vercel logs atau Cloudflare dashboard untuk debugging.
