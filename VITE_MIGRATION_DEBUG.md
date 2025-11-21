# Debug Migrasi TSC ke Vite & Integrasi Supabase

## Status Migrasi
✅ Vite configuration
✅ Environment variables (VITE_ prefix)
✅ Entry point (index.html + main.tsx)
✅ Supabase client setup
✅ No TypeScript compilation errors

## Potensi Masalah Ditemukan

### 1. Port Conflict
**Gejala**: Dev server berjalan di port 5174 bukan 5173
**Penyebab**: Port 5173 masih digunakan proses lain
**Solusi**: 
```bash
# Stop semua proses Node.js
taskkill /F /IM node.exe

# Atau restart dev server
npm run dev
```

### 2. Lazy Loading Error Tersembunyi
**Gejala**: Blank screen tanpa error message
**Penyebab**: Error di salah satu lazy-loaded component tidak terlihat
**Solusi**: Cek browser console untuk error

### 3. AuthContext Initialization
**Gejala**: Loading state tidak selesai
**Penyebab**: 
- Supabase connection timeout
- Invalid token di localStorage
- Race condition dalam fetchUserProfile

**Solusi**:
```javascript
// Clear localStorage dan reload
localStorage.clear();
window.location.reload();
```

### 4. Environment Variables Tidak Ter-load
**Gejala**: Supabase URL/Key undefined
**Penyebab**: .env file tidak terbaca oleh Vite
**Solusi**: Pastikan file bernama `.env.development.local` (bukan `.env.local`)

## Langkah Debug

### Step 1: Cek Browser Console
Buka http://localhost:5174 dan buka DevTools (F12), lihat:
1. Console tab - Cari error messages
2. Network tab - Cek request ke Supabase
3. Application tab - Cek localStorage

### Step 2: Cek Environment Variables
Di browser console, jalankan:
```javascript
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('MODE:', import.meta.env.MODE);
console.log('DEV:', import.meta.env.DEV);
```

### Step 3: Test Supabase Connection
Di browser console, jalankan:
```javascript
// Test Supabase connection
fetch('https://gpittnsfzgkdbqnccncn.supabase.co/rest/v1/', {
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwaXR0bnNmemdrZGJxbmNjbmNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxMDE3MzIsImV4cCI6MjA3ODY3NzczMn0.4jrpZ_7Wd_ELFjCH105iBqyFPmZmKxI06U0EyqTT5xo'
  }
}).then(r => r.json()).then(console.log);
```

### Step 4: Clear Cache & Reload
```javascript
// Di browser console
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

## Quick Fix Options

### Option A: Disable Auth Temporarily
Edit `src/main.tsx`, ganti MemberArea dengan TestApp:
```typescript
const TestApp = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test App</h1>
      <p>Vite is working!</p>
      <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL}</p>
    </div>
  );
};

// Render TestApp instead
ReactDOM.createRoot(root).render(<TestApp />);
```

### Option B: Add More Debug Logging
Edit `src/features/member-area/contexts/AuthContext.tsx`:
```typescript
useEffect(() => {
  console.log('AuthContext: Initializing...');
  const initializeAuth = async () => {
    console.log('AuthContext: Checking token...');
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('AuthContext: Token exists:', !!token);
    // ... rest of code
  };
  initializeAuth();
}, []);
```

### Option C: Simplify Routes
Edit `src/features/member-area/routes.tsx`, remove lazy loading temporarily:
```typescript
// Instead of lazy loading
import Dashboard from './pages/Dashboard';
import TransactionHistory from './pages/TransactionHistory';
// ... etc
```

## Kemungkinan Root Cause

Berdasarkan analisis, kemungkinan besar masalahnya adalah:

1. **70% - AuthContext initialization hang** karena:
   - Supabase connection timeout
   - Invalid cached token
   - Race condition dalam fetchUserProfile

2. **20% - Lazy loading error** di salah satu component yang tidak terlihat

3. **10% - Environment variables** tidak ter-load dengan benar

## Rekomendasi Immediate Action

1. **Buka browser di http://localhost:5174**
2. **Buka DevTools (F12) → Console tab**
3. **Screenshot error messages yang muncul**
4. **Jalankan command di console**:
   ```javascript
   console.log('ENV:', {
     url: import.meta.env.VITE_SUPABASE_URL,
     hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
     mode: import.meta.env.MODE
   });
   ```
5. **Clear localStorage dan reload**:
   ```javascript
   localStorage.clear();
   window.location.reload();
   ```

## Next Steps

Setelah mendapat info dari browser console, kita bisa:
1. Fix specific error yang muncul
2. Adjust AuthContext initialization
3. Add better error boundaries
4. Improve loading states
