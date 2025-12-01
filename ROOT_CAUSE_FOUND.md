# ✅ ROOT CAUSE FOUND - Top-Up Error 500

## The Real Problem

**Environment variable mismatch between frontend and backend!**

### What Happened

**In Vercel Environment Variables:**
- ✅ `SUPABASE_URL` is set
- ✅ `SUPABASE_ANON_KEY` is set
- ❌ `VITE_SUPABASE_URL` is NOT set (only for frontend)
- ❌ `VITE_SUPABASE_ANON_KEY` is NOT set (only for frontend)

**In API Route Code (`api/tripay-proxy.ts`):**
```typescript
// ❌ WRONG - Looking for VITE_ prefixed vars
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,      // undefined in server-side!
  process.env.VITE_SUPABASE_ANON_KEY!  // undefined in server-side!
);
```

**Result:**
- Supabase client fails to initialize
- `supabase.auth.getUser()` throws error
- API returns 500 error

## The Fix

**Changed to:**
```typescript
// ✅ CORRECT - Use SUPABASE_ for server-side, fallback to VITE_ for compatibility
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY!
);
```

**Why this works:**
1. Server-side (Vercel API): Uses `SUPABASE_URL` and `SUPABASE_ANON_KEY` ✅
2. Client-side (Frontend): Uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` ✅
3. Fallback ensures compatibility if either is set

## Environment Variable Naming Convention

### Frontend (Vite)
Variables must be prefixed with `VITE_` to be exposed to client-side:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_TURNSTILE_SITE_KEY`
- `VITE_TRIPAY_MODE`

### Backend (Vercel API Routes)
Variables should NOT have `VITE_` prefix:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TURNSTILE_SECRET_KEY`
- `GCP_PROXY_URL`

### Why Different?

**Vite (Frontend):**
- Only exposes variables with `VITE_` prefix to browser
- Security: Prevents accidental exposure of secrets
- Build-time: Variables are embedded in compiled code

**Vercel (Backend):**
- All environment variables available to API routes
- Runtime: Variables loaded from Vercel environment
- No prefix needed (and `VITE_` prefix won't work)

## Timeline of Issue

1. **Initial Setup:** Code worked in development (local .env has both)
2. **Vercel Deployment:** Only `SUPABASE_URL` set (not `VITE_SUPABASE_URL`)
3. **API Route:** Looking for `VITE_SUPABASE_URL` → undefined
4. **Supabase Client:** Failed to initialize
5. **Auth Check:** `supabase.auth.getUser()` throws error
6. **Result:** 500 error

## Deployment Status

**Changes Pushed:** ✅
- Fixed environment variable names in `api/tripay-proxy.ts`
- Updated health check endpoint
- Added fallback for compatibility

**Vercel Deployment:** ⏳ In progress
- Wait 2-3 minutes for deployment
- Check: https://vercel.com/canvango/canvango-group

**Expected Result:** ✅ Top-up will work after deployment

## Verification Steps

### 1. Wait for Deployment
Check: https://vercel.com/canvango/canvango-group
Status should show: ✅ Ready

### 2. Test Health Endpoint
```bash
curl https://www.canvango.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "config": {
    "gcpProxyUrl": "http://34.182.126.200:3000",
    "hasGcpProxyUrl": true,
    "supabaseUrl": "SET (SUPABASE_URL)",
    "supabaseAnonKey": "SET (SUPABASE_ANON_KEY)",
    "turnstileSecretKey": "SET"
  }
}
```

### 3. Test Top-Up Flow
1. Go to: https://canvango.com
2. Login
3. Click: Top Up
4. Select: Rp 10,000
5. Choose: QRIS
6. Click: "Bayar Sekarang"
7. Should redirect to Tripay payment page ✅

## Lessons Learned

### 1. Environment Variable Naming
- Frontend: Use `VITE_` prefix
- Backend: Don't use `VITE_` prefix
- Document which vars are for which environment

### 2. Error Handling
- Better error messages help identify issues faster
- Health check endpoints are valuable for debugging
- Log configuration on startup

### 3. Testing
- Test in production-like environment
- Verify environment variables are set correctly
- Check both frontend and backend separately

## Related Files

**Modified:**
- `api/tripay-proxy.ts` - Fixed Supabase client initialization
- `api/health.ts` - Added environment variable check

**Documentation:**
- `ROOT_CAUSE_FOUND.md` - This file
- `FIX_TOPUP_ERROR_500.md` - Original fix attempt
- `CHECK_ENV_VAR.md` - Environment variable checklist

## Next Steps

1. ✅ Wait for deployment (2-3 minutes)
2. ✅ Test health endpoint
3. ✅ Test top-up flow
4. ✅ Monitor for any other errors
5. ✅ Update documentation if needed

## Success Criteria

- [x] Root cause identified
- [x] Fix implemented
- [x] Changes pushed to GitHub
- [ ] Deployment completed
- [ ] Health check passes
- [ ] Top-up flow works
- [ ] No errors in Vercel logs

---

**Status:** Fix deployed, waiting for verification ⏳
