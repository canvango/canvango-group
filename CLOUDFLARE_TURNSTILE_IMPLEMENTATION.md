# Cloudflare Turnstile Implementation Guide

## 📋 Overview

Cloudflare Turnstile telah diintegrasikan ke dalam aplikasi untuk melindungi form autentikasi dari bot dan spam. Implementasi ini menggunakan Vercel Edge Functions untuk verifikasi server-side.

## 🏗️ Architecture

```
User Submit Form
    ↓
Cloudflare Turnstile Widget (Frontend)
    ↓
Generate Token
    ↓
Vercel Edge Function (/api/verify-turnstile)
    ↓
Verify with Cloudflare API
    ↓
Return Success/Fail
    ↓
Continue to Supabase Auth (if success)
```

## 📁 File Structure

```
project/
├── api/
│   └── verify-turnstile.ts          # Vercel Edge Function
├── src/
│   ├── shared/
│   │   ├── components/
│   │   │   └── TurnstileWidget.tsx  # Turnstile React Component
│   │   └── hooks/
│   │       └── useTurnstile.ts      # Turnstile Hook
│   └── features/
│       └── member-area/
│           └── components/
│               └── auth/
│                   ├── LoginForm.tsx
│                   ├── RegisterForm.tsx
│                   └── ForgotPasswordForm.tsx
└── .env
```

## 🚀 Setup Instructions

### 1. Dapatkan Cloudflare Turnstile Keys

1. Buka [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Pilih **Turnstile** dari menu
3. Klik **Add Site**
4. Isi informasi:
   - **Site name**: Nama aplikasi Anda
   - **Domain**: Domain aplikasi (atau `localhost` untuk development)
   - **Widget Mode**: Managed (Recommended)
5. Simpan dan dapatkan:
   - **Site Key** (Public) - untuk frontend
   - **Secret Key** (Private) - untuk backend

### 2. Konfigurasi Environment Variables

#### Local Development (.env)

```env
# Cloudflare Turnstile Configuration
VITE_TURNSTILE_SITE_KEY=your-site-key-here
TURNSTILE_SECRET_KEY=your-secret-key-here
```

#### Vercel Deployment

1. Buka Vercel Dashboard
2. Pilih project Anda
3. Go to **Settings** → **Environment Variables**
4. Tambahkan:
   - `VITE_TURNSTILE_SITE_KEY` = your-site-key
   - `TURNSTILE_SECRET_KEY` = your-secret-key
5. Pilih environment: **Production**, **Preview**, **Development**
6. Klik **Save**

### 3. Deploy ke Vercel

```bash
# Commit changes
git add .
git commit -m "Add Cloudflare Turnstile integration"
git push

# Vercel akan auto-deploy
```

## 🔧 How It Works

### Frontend (TurnstileWidget Component)

```tsx
import { TurnstileWidget } from '@/shared/components';
import { useTurnstile } from '@/shared/hooks';

const MyForm = () => {
  const { token, setToken, verifyToken, reset } = useTurnstile();
  
  const handleSubmit = async () => {
    // Verify token
    const isVerified = await verifyToken();
    
    if (isVerified) {
      // Continue with form submission
    } else {
      // Show error
      reset(); // Reset widget
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      <TurnstileWidget
        onSuccess={setToken}
        onError={reset}
        onExpire={reset}
      />
      
      <button type="submit" disabled={!token}>
        Submit
      </button>
    </form>
  );
};
```

### Backend (Vercel Edge Function)

```typescript
// api/verify-turnstile.ts
export default async function handler(req: Request) {
  const { token } = await req.json();
  
  // Verify with Cloudflare
  const response = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    {
      method: 'POST',
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token
      })
    }
  );
  
  const data = await response.json();
  return Response.json({ success: data.success });
}
```

## 🎯 Features

### ✅ Implemented

- [x] Login form protection
- [x] Register form protection
- [x] Forgot password form protection
- [x] Automatic token verification
- [x] Error handling & retry
- [x] Token expiration handling
- [x] Graceful degradation (works without Turnstile if not configured)

### 🔄 Behavior

1. **Widget Rendering**
   - Widget hanya muncul jika `VITE_TURNSTILE_SITE_KEY` dikonfigurasi
   - Jika tidak dikonfigurasi, form tetap berfungsi normal

2. **Token Verification**
   - Token diverifikasi di server sebelum submit form
   - Jika verifikasi gagal, form tidak akan disubmit
   - User diminta untuk refresh dan coba lagi

3. **Error Handling**
   - Widget error → Reset widget otomatis
   - Token expired → Reset widget otomatis
   - Verification failed → Show error message + reset

4. **Button State**
   - Disabled jika Turnstile enabled tapi token belum ada
   - Loading state saat verifikasi
   - Enabled setelah token berhasil didapat

## 🧪 Testing

### Local Testing

1. **Tanpa Turnstile** (Default)
   ```bash
   # Jangan set VITE_TURNSTILE_SITE_KEY
   npm run dev
   ```
   Form akan berfungsi normal tanpa Turnstile widget.

2. **Dengan Turnstile**
   ```bash
   # Set environment variables di .env
   VITE_TURNSTILE_SITE_KEY=your-site-key
   TURNSTILE_SECRET_KEY=your-secret-key
   
   npm run dev
   ```
   Widget akan muncul di form login/register/forgot-password.

### Production Testing

1. Deploy ke Vercel
2. Set environment variables di Vercel Dashboard
3. Test di production URL
4. Cek Vercel logs untuk debugging

## 📊 Monitoring

### Cloudflare Dashboard

- Lihat statistik verifikasi
- Monitor bot detection rate
- Analisis traffic patterns

### Vercel Logs

```bash
# View function logs
vercel logs

# Filter by function
vercel logs --filter="verify-turnstile"
```

## 🔒 Security Best Practices

1. **Never expose Secret Key**
   - Secret key hanya di server (Vercel environment variables)
   - Jangan commit ke Git
   - Jangan log di console

2. **Always verify server-side**
   - Frontend token bisa di-bypass
   - Verifikasi wajib di server

3. **Rate limiting**
   - Turnstile sudah include rate limiting
   - Tambahkan rate limiting tambahan jika perlu

4. **Token expiration**
   - Token Turnstile expire setelah beberapa menit
   - Handle expiration dengan reset widget

## 🐛 Troubleshooting

### Widget tidak muncul

**Penyebab:**
- `VITE_TURNSTILE_SITE_KEY` tidak dikonfigurasi
- Site key salah

**Solusi:**
1. Cek `.env` file
2. Pastikan key benar
3. Restart dev server

### Verification failed

**Penyebab:**
- `TURNSTILE_SECRET_KEY` tidak dikonfigurasi di Vercel
- Secret key salah
- Network error

**Solusi:**
1. Cek Vercel environment variables
2. Cek Vercel function logs
3. Test dengan curl:
   ```bash
   curl -X POST https://your-app.vercel.app/api/verify-turnstile \
     -H "Content-Type: application/json" \
     -d '{"token":"test-token"}'
   ```

### Widget error di production

**Penyebab:**
- Domain tidak match dengan Turnstile site configuration
- CORS issue

**Solusi:**
1. Cek Cloudflare Turnstile dashboard
2. Pastikan domain production terdaftar
3. Update domain di Turnstile settings

## 📚 Resources

- [Cloudflare Turnstile Docs](https://developers.cloudflare.com/turnstile/)
- [Vercel Edge Functions](https://vercel.com/docs/functions/edge-functions)
- [@marsidev/react-turnstile](https://github.com/marsidev/react-turnstile)

## 🎉 Benefits

### vs Google reCAPTCHA

| Feature | Turnstile | reCAPTCHA |
|---------|-----------|-----------|
| Privacy | ✅ No tracking | ❌ Tracks users |
| UX | ✅ Invisible | ⚠️ Puzzle required |
| Free tier | ✅ 1M/month | ✅ 1M/month |
| GDPR | ✅ Compliant | ⚠️ Concerns |
| Speed | ✅ Fast | ⚠️ Slower |

### Security

- Machine learning bot detection
- Fingerprinting technology
- Automatic updates
- Rate limiting built-in

## 🔄 Future Improvements

- [ ] Add analytics tracking
- [ ] Custom error messages per form
- [ ] A/B testing with/without Turnstile
- [ ] Add to other sensitive forms (topup, purchase)
- [ ] Implement challenge mode for suspicious traffic

---

**Status:** ✅ Implemented & Ready for Production

**Last Updated:** November 27, 2025
