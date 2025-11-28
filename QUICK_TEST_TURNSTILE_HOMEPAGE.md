# Quick Test Guide - Turnstile Homepage Protection

## Prerequisites

Pastikan `VITE_TURNSTILE_SITE_KEY` sudah di-set di `.env`:

```env
VITE_TURNSTILE_SITE_KEY=your_cloudflare_turnstile_site_key
```

## Test Scenarios

### ✅ Test 1: First Visit
1. Clear browser cache & cookies
2. Visit https://www.canvango.com/
3. **Expected:** Full page Turnstile verification muncul
4. Complete Turnstile challenge
5. **Expected:** Konten aplikasi muncul setelah verifikasi sukses

### ✅ Test 2: Session Persistence (< 5 minutes)
1. Setelah Test 1 berhasil
2. Refresh page (F5)
3. **Expected:** Konten langsung muncul, TIDAK ada Turnstile
4. Navigate ke halaman lain (e.g., /dashboard)
5. **Expected:** Konten langsung muncul, TIDAK ada Turnstile

### ✅ Test 3: Session Expiry (> 5 minutes)
1. Setelah Test 1 berhasil
2. Wait 5+ minutes
3. Refresh page
4. **Expected:** Turnstile muncul lagi (session expired)

### ✅ Test 4: New Tab/Session
1. Setelah Test 1 berhasil
2. Close browser tab
3. Open new tab, visit https://www.canvango.com/
4. **Expected:** Turnstile muncul (sessionStorage cleared)

### ✅ Test 5: Mobile Responsive
1. Open browser DevTools
2. Toggle device toolbar (mobile view)
3. Visit https://www.canvango.com/
4. **Expected:** Turnstile page responsive, logo & text readable

### ✅ Test 6: Disabled Protection
1. Remove atau comment `VITE_TURNSTILE_SITE_KEY` dari `.env`
2. Restart dev server
3. Visit https://www.canvango.com/
4. **Expected:** Konten langsung muncul, TIDAK ada Turnstile

## Visual Checklist

### Layout
- [ ] Card centered di tengah layar
- [ ] White background dengan shadow
- [ ] Rounded corners (`rounded-3xl`)
- [ ] Responsive padding

### Logo Section
- [ ] Canvango Group logo visible
- [ ] Logo text "CANVANGO GROUP" dengan warna `#5271ff`
- [ ] White rounded background dengan shadow

### Content
- [ ] Title "canvango.com" - `text-2xl md:text-3xl`
- [ ] Description text readable - `text-sm text-gray-700`
- [ ] Turnstile widget centered
- [ ] Loading spinner muncul saat verifying

### Footer
- [ ] "Performance & security by Cloudflare" text
- [ ] Cloudflare link clickable
- [ ] Border top separator visible

## Browser Console Checks

### No Errors
```
✅ No console errors
✅ No network errors
✅ Turnstile widget loaded successfully
```

### Session Storage
Open DevTools → Application → Session Storage → Check:
```
turnstile_verified: "true"
turnstile_verified_time: "1732809600000"
```

## Quick Commands

### Start Dev Server
```bash
npm run dev
```

### Clear Session Storage (via Console)
```javascript
sessionStorage.clear();
location.reload();
```

### Check Turnstile Status (via Console)
```javascript
console.log('Verified:', sessionStorage.getItem('turnstile_verified'));
console.log('Time:', new Date(parseInt(sessionStorage.getItem('turnstile_verified_time'))));
```

## Common Issues & Solutions

### Issue: Turnstile tidak muncul
**Solution:** Check `VITE_TURNSTILE_SITE_KEY` di `.env` dan restart dev server

### Issue: Verifikasi gagal terus
**Solution:** 
1. Check network connection
2. Verify Cloudflare Turnstile domain whitelist
3. Check browser console for errors

### Issue: Session tidak persist
**Solution:**
1. Check browser sessionStorage enabled
2. Verify no browser extensions blocking storage
3. Clear cache & try again

### Issue: Infinite loading
**Solution:**
1. Clear sessionStorage: `sessionStorage.clear()`
2. Refresh page
3. Check `useTurnstile` hook implementation

## Success Criteria

✅ All 6 test scenarios pass
✅ No console errors
✅ Responsive on mobile & desktop
✅ Session storage works correctly
✅ 5-minute expiry works
✅ Protection can be disabled via env variable

## Next Steps After Testing

1. Test di production environment
2. Monitor Cloudflare Turnstile analytics
3. Gather user feedback on UX
4. Adjust expiry time if needed (currently 5 minutes)

---

**Quick Test Duration:** ~10 minutes
**Status:** Ready for testing
