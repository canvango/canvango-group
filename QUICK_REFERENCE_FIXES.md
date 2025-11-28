# Quick Reference - Production Fixes

## 🚨 Console Errors Fixed

| Error | Fix Location | Status |
|-------|--------------|--------|
| 405 Tripay | `src/services/tripay.service.ts` | ✅ |
| 406 Welcome Popups | Database RLS policy | ✅ |
| leftAddon warning | `src/shared/components/Input.tsx` | ✅ |
| WebSocket reconnects | `src/features/member-area/contexts/AuthContext.tsx` | ✅ |

---

## 🔧 Quick Fixes Applied

### 1. Tripay URL Validation
```typescript
// src/services/tripay.service.ts (line ~195)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '');
if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL is not configured');
}
```

### 2. Welcome Popups RLS
```sql
-- Migration: fix_welcome_popups_rls_policy
CREATE POLICY "allow_public_read_active_popups"
ON welcome_popups FOR SELECT TO public
USING (is_active = true);
```

### 3. Input Props Fix
```typescript
// src/shared/components/Input.tsx (line ~74)
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ leftAddon, rightAddon, ...props }, ref) => {
    // Now properly destructured
  }
);
```

### 4. WebSocket Optimization
```typescript
// src/features/member-area/contexts/AuthContext.tsx (line ~130)
useEffect(() => {
  // ... subscription code
}, [user?.id, notification]); // Minimal dependencies
```

---

## 📋 Testing Commands

### Check Environment
```bash
# Verify env vars
cat .env | grep VITE_SUPABASE_URL
cat .env | grep VITE_TRIPAY

# Check Vercel env
vercel env ls
```

### Database Check
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'welcome_popups';

-- Test public access
SELECT * FROM welcome_popups WHERE is_active = true;
```

### Edge Functions
```bash
# List functions
supabase functions list

# Check logs
supabase functions logs tripay-create-payment
```

---

## 🎯 Quick Test URLs

| Test | URL | Expected |
|------|-----|----------|
| Welcome Popup | `/` | No 406 error |
| Tripay Payment | `/top-up` | No 405 error |
| Input Addons | `/top-up` | "Rp" prefix visible |
| WebSocket | `/dashboard` | Stable connection |

---

## 🐛 Troubleshooting

### Tripay 405 Still Appears
```bash
# 1. Check env var
echo $VITE_SUPABASE_URL

# 2. Rebuild
npm run build

# 3. Redeploy
vercel --prod
```

### Welcome Popup 406 Still Appears
```sql
-- 1. Check policy exists
SELECT * FROM pg_policies 
WHERE tablename = 'welcome_popups' 
AND policyname = 'allow_public_read_active_popups';

-- 2. If missing, recreate
CREATE POLICY "allow_public_read_active_popups"
ON welcome_popups FOR SELECT TO public
USING (is_active = true);
```

### WebSocket Still Reconnecting
```typescript
// Check AuthContext.tsx line ~130
// Dependencies should be: [user?.id, notification]
// NOT: [user?.id, user?.role, user?.balance, notification]
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `VERCEL_PRODUCTION_FIXES.md` | Detailed technical fixes |
| `QUICK_TEST_PRODUCTION_FIXES.md` | Step-by-step testing |
| `UI_UX_IMPROVEMENTS_VISUAL.md` | Visual comparisons |
| `SESSION_SUMMARY_2025-11-28_PRODUCTION_FIXES.md` | Complete overview |
| `FINAL_VERIFICATION_CHECKLIST.md` | Pre-deployment checklist |
| `QUICK_REFERENCE_FIXES.md` | This file |

---

## 🔑 Key Files Modified

```
src/
├── services/
│   └── tripay.service.ts          ← URL validation
├── shared/
│   └── components/
│       └── Input.tsx              ← leftAddon/rightAddon
└── features/
    └── member-area/
        └── contexts/
            └── AuthContext.tsx    ← WebSocket optimization

supabase/
└── migrations/
    └── fix_welcome_popups_rls_policy.sql
```

---

## ⚡ Quick Commands

```bash
# Build and test locally
npm run build
npm run preview

# Deploy to Vercel
vercel --prod

# Check diagnostics
npm run type-check

# View logs
vercel logs
```

---

## 📊 Success Indicators

### Console Should Show:
```
✅ Supabase client initialized successfully
✅ Realtime subscription active
✅ Creating Tripay payment: {...}
✅ Edge Function response: {...}
```

### Console Should NOT Show:
```
❌ 405 Method Not Allowed
❌ 406 Not Acceptable
❌ leftAddon prop warning
❌ WebSocket closed before connection
```

---

## 🎨 Input Addon Usage

```tsx
// Currency
<Input leftAddon="Rp" placeholder="50000" />

// Percentage
<Input rightAddon="%" placeholder="10" />

// Combined
<Input leftAddon="Rp" rightAddon="/bulan" placeholder="100000" />
```

---

## 🔐 Environment Variables

```env
# Required for Tripay fix
VITE_SUPABASE_URL=https://gpittnsfzgkdbqnccncn.supabase.co

# Required for Tripay
VITE_TRIPAY_API_KEY=DEV-V745...
VITE_TRIPAY_PRIVATE_KEY=BAo71-...
VITE_TRIPAY_MERCHANT_CODE=T47116
VITE_TRIPAY_MODE=sandbox
```

---

## 📞 Support

**If issues persist:**
1. Check `QUICK_TEST_PRODUCTION_FIXES.md`
2. Review `FINAL_VERIFICATION_CHECKLIST.md`
3. See `VERCEL_PRODUCTION_FIXES.md` for details

---

**Last Updated:** 2025-11-28  
**Version:** 1.0  
**Status:** ✅ All fixes applied
