# Quick Test - Tripay Callback Fix

## 🎯 Goal

Test bahwa endpoint `/api/tripay-callback` mengembalikan HTTP 200 (bukan 307).

## ⚡ Quick Test (5 menit)

### 1. Deploy ke Vercel

```bash
git add .
git commit -m "fix: resolve HTTP 307 redirect on Tripay callback"
git push origin main
```

Wait 1-2 menit untuk deployment selesai.

### 2. Test dengan Curl (Windows)

```bash
test-tripay-callback-curl.bat
```

**Look for:**
```
< HTTP/2 200
< content-type: application/json
```

✅ **SUCCESS** jika status = 200
❌ **FAILED** jika status = 307

### 3. Test dengan Node.js

```bash
# Set private key
set VITE_TRIPAY_PRIVATE_KEY=your-actual-private-key

# Run test
node test-tripay-callback-vercel.js
```

**Expected:**
```
Status: 200 OK
✅ SUCCESS - HTTP 200 received
```

### 4. Test di Tripay Dashboard

1. Login: https://tripay.co.id/member/merchant
2. Go to: **Developer** → **Callback**
3. Callback URL: `https://canvango.com/api/tripay-callback`
4. Click: **Test Callback**

**Expected Result:**

| Field | Value |
|-------|-------|
| Kode HTTP | **200** |
| Status Koneksi | **BERHASIL** ✅ |
| Status Callback | **BERHASIL** ✅ |
| Response | `{"success":true,"message":"Callback processed successfully"}` |

## 🔍 What Changed?

### Before (❌ HTTP 307)
```
POST /api/tripay-callback
→ Vercel redirects due to trailing slash config
→ HTTP 307 Temporary Redirect
→ Body: "Redirecting..."
```

### After (✅ HTTP 200)
```
POST /api/tripay-callback
→ Headers set immediately
→ No redirect
→ HTTP 200 OK
→ Body: {"success":true,"message":"..."}
```

## 📝 Files Changed

1. **vercel.json** - Removed `trailingSlash`, added CORS headers
2. **api/tripay-callback.ts** - Set headers early, handle body formats better

## ⚠️ Common Issues

### Still Getting 307?

```bash
# Clear Vercel cache and redeploy
vercel --prod --force
```

### Getting "Invalid signature"?

Normal! Test callback dari Tripay dashboard akan berhasil karena mereka pakai signature yang benar.

### Getting 405?

Check URL - must be exact: `https://canvango.com/api/tripay-callback` (no trailing slash)

## ✅ Success Criteria

- [ ] Curl test returns HTTP 200
- [ ] Node.js test returns HTTP 200
- [ ] Tripay dashboard test shows "BERHASIL"
- [ ] No "Redirecting..." in response body
- [ ] Response is valid JSON

## 🚀 Next Steps

Once test callback succeeds:

1. ✅ Callback URL sudah benar
2. ✅ Signature verification working
3. ✅ Ready untuk production transactions
4. Monitor Vercel logs untuk real callbacks
5. Check Supabase untuk transaction updates

## 📞 Support

If still having issues:

1. Check Vercel deployment logs
2. Check Vercel function logs (real-time)
3. Verify environment variables are set
4. Test with actual transaction (small amount)
