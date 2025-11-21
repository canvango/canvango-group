# 🚀 Quick Fix: Vite Migration & Supabase Integration

## Masalah: Blank Screen Setelah Migrasi

### Kemungkinan Penyebab (Berdasarkan Analisis)

1. **AuthContext Initialization Hang** (70% kemungkinan)
   - Supabase connection timeout
   - Invalid cached token di localStorage
   - Race condition dalam fetchUserProfile

2. **Lazy Loading Error** (20% kemungkinan)
   - Error di salah satu component tidak terlihat
   - Import path salah setelah migrasi

3. **Environment Variables** (10% kemungkinan)
   - .env file tidak terbaca
   - VITE_ prefix missing

## 🔧 Quick Fix Steps

### Fix 1: Clear Cache & Test (COBA INI DULU!)

1. Buka browser di: http://localhost:5174
2. Buka DevTools (F12)
3. Di Console tab, jalankan:
```javascript
// Clear semua cache
localStorage.clear();
sessionStorage.clear();

// Reload
window.location.reload();
```

### Fix 2: Use Debug Mode

1. Edit `index.html`, ganti baris:
```html
<script type="module" src="/src/main.tsx"></script>
```

Dengan:
```html
<script type="module" src="/src/main.debug.tsx"></script>
```

2. Save dan reload browser
3. Lihat debug information yang muncul

### Fix 3: Temporary Disable Auth

Edit `src/main.tsx`, tambahkan sebelum MemberArea import:

```typescript
// Temporary: Skip auth for testing
const SimpleApp = () => (
  <div style={{ padding: '20px' }}>
    <h1>App is Working!</h1>
    <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL}</p>
    <p>Mode: {import.meta.env.MODE}</p>
  </div>
);

// Comment out MemberArea and use SimpleApp
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <SimpleApp />
  </React.StrictMode>
);
```

### Fix 4: Check Port Conflict

Port 5173 sedang digunakan, server berjalan di 5174. Untuk fix:

```bash
# Stop semua Node.js processes
taskkill /F /IM node.exe

# Restart dev server
npm run dev
```

### Fix 5: Verify Environment Variables

1. Pastikan file `.env.development.local` ada di root project
2. Isi harus seperti ini:
```env
VITE_SUPABASE_URL=https://gpittnsfzgkdbqnccncn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaXR0bnNmemdrZGJxbmNjbmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDE3MzIsImV4cCI6MjA3ODY3NzczMn0.4jrpZ_7Wd_ELFjCH105iBqyFPmZmKxI06U0EyqTT5xo
```

3. Restart dev server setelah edit .env

## 🔍 Diagnostic Commands

Jalankan di browser console (F12):

```javascript
// 1. Check environment
console.log('Environment:', {
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
});

// 2. Check localStorage
console.log('LocalStorage items:', Object.keys(localStorage));

// 3. Test Supabase
fetch('https://gpittnsfzgkdbqnccncn.supabase.co/rest/v1/', {
  headers: {
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
  }
}).then(r => console.log('Supabase status:', r.status));

// 4. Check for errors
console.log('Check Network tab for failed requests');
console.log('Check Console tab for error messages');
```

## 📋 Checklist Troubleshooting

- [ ] Dev server running (check terminal)
- [ ] Browser opened at correct URL (http://localhost:5174)
- [ ] DevTools opened (F12)
- [ ] Console tab checked for errors
- [ ] Network tab checked for failed requests
- [ ] LocalStorage cleared
- [ ] Environment variables verified
- [ ] .env.development.local file exists
- [ ] File has VITE_ prefix on all variables

## 🎯 Expected Behavior

Setelah fix, kamu harus lihat:

1. **Di Console**:
   ```
   Main.tsx loaded
   Supabase URL: https://gpittnsfzgkdbqnccncn.supabase.co
   Supabase Key exists: true
   Root element found, rendering app...
   ```

2. **Di Browser**:
   - Loading spinner muncul sebentar
   - Kemudian redirect ke login page atau dashboard (tergantung auth state)

3. **Di Network Tab**:
   - Request ke Supabase berhasil (status 200)
   - No 404 errors untuk static assets

## 🆘 Jika Masih Blank

Kirim screenshot dari:
1. Browser console (F12 → Console tab)
2. Network tab (filter: All, show failed requests)
3. Terminal output (dev server logs)

Dengan info ini kita bisa identify exact problem!

## 🔄 Rollback Plan

Jika perlu rollback ke tsc:

1. Edit `package.json`:
```json
"scripts": {
  "dev": "tsc --watch"
}
```

2. Restart:
```bash
npm run dev
```

Tapi ini bukan solusi jangka panjang karena tsc tidak serve files ke browser.
