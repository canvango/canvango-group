# Fix: Logout Harus Diklik 2 Kali

## Masalah

User harus klik tombol logout 2 kali baru benar-benar keluar dari member area.

## Penyebab

1. **Race Condition** - Handler logout di `MemberAreaLayout` memanggil `navigate('/login')` secara synchronous tanpa menunggu proses logout selesai
2. **Auth State Listener Conflict** - Listener `onAuthStateChange` di `AuthContext` juga membersihkan state saat menerima event `SIGNED_OUT`, menyebabkan double cleanup
3. **Navigation Timing** - Navigasi terjadi sebelum state benar-benar ter-clear, menyebabkan user masih dalam state authenticated

## Solusi

### 1. MemberAreaLayout.tsx

**Sebelum:**
```tsx
const handleLogout = () => {
  logout();
  navigate('/login');
};
```

**Sesudah:**
```tsx
const handleLogout = async () => {
  try {
    await logout(); // Tunggu logout selesai
    navigate('/login', { replace: true }); // Replace history
  } catch (error) {
    console.error('Logout failed:', error);
    navigate('/login', { replace: true });
  }
};
```

**Perubahan:**
- ✅ Menggunakan `async/await` untuk menunggu logout selesai
- ✅ Menggunakan `replace: true` untuk mengganti history (tidak bisa back ke member area)
- ✅ Error handling untuk memastikan navigasi tetap terjadi meskipun logout gagal

### 2. AuthContext.tsx - Logout Function

**Perubahan:**
- ✅ Menambahkan logging untuk debugging
- ✅ Memastikan `await authService.logout()` selesai sebelum cleanup
- ✅ Cleanup tetap berjalan meskipun Supabase logout gagal

### 3. AuthContext.tsx - Auth State Listener

**Sebelum:**
```tsx
if (event === 'SIGNED_OUT') {
  // Clear all auth data on sign out
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  clearCSRFToken();
  clearAllFilterPreferences();
  setUser(null);
}
```

**Sesudah:**
```tsx
if (event === 'SIGNED_OUT') {
  // Auth state listener: Just ensure state is cleared
  // The logout() function already handles cleanup
  console.log('ℹ️ SIGNED_OUT event received, ensuring clean state');
  setUser(null);
}
```

**Perubahan:**
- ✅ Listener hanya mengatur `setUser(null)` untuk konsistensi
- ✅ Cleanup utama dilakukan oleh fungsi `logout()` untuk menghindari duplikasi
- ✅ Menghindari race condition antara manual logout dan auth state listener

## Hasil

- ✅ Logout sekarang bekerja dengan 1 kali klik
- ✅ State ter-clear dengan benar sebelum navigasi
- ✅ Tidak ada race condition antara logout function dan auth listener
- ✅ User tidak bisa kembali ke member area dengan tombol back browser
- ✅ Error handling yang lebih baik

## Testing

Untuk test logout:

1. Login ke member area
2. Klik tombol logout di dropdown profile (header)
3. Seharusnya langsung redirect ke `/login` dengan 1 kali klik
4. Coba tekan tombol back browser - seharusnya tidak bisa kembali ke member area
5. Check console log untuk memastikan proses logout berjalan dengan benar:
   - `🔄 Starting logout process...`
   - `✅ Supabase logout successful`
   - `✅ User logged out, all data cleared`
   - `🔄 Auth state changed: SIGNED_OUT`
   - `ℹ️ SIGNED_OUT event received, ensuring clean state`

## File yang Diubah

1. `src/features/member-area/components/MemberAreaLayout.tsx`
2. `src/features/member-area/contexts/AuthContext.tsx`
