# Testing Guide - Performance Optimization

## 🧪 Manual Testing Checklist

### 1. **Initial Load Performance**

#### Test Steps:
1. **Clear browser cache** (Ctrl+Shift+Delete)
2. Open DevTools → Network tab
3. Navigate to `http://localhost:5173`
4. Observe loading sequence

#### Expected Results:
✅ **Before Optimization**:
- White screen: 1-2 seconds
- Auth check: 500-2000ms
- First content: 2-4 seconds
- Console: Many debug logs

✅ **After Optimization**:
- White screen: 0.3-0.6 seconds
- Auth check: Non-blocking (background)
- First content: 0.8-1.5 seconds
- Console: Clean (only errors if any)

#### What to Check:
- [ ] Page renders immediately with cached user data
- [ ] No blocking auth check
- [ ] Minimal console logs
- [ ] Dashboard loads smoothly

---

### 2. **Auth Flow Testing**

#### Test A: Login Flow
1. Logout if logged in
2. Go to `/login`
3. Enter credentials
4. Click login

**Expected**:
- [ ] Login successful
- [ ] Redirects to dashboard
- [ ] User data cached in localStorage
- [ ] No console spam

#### Test B: Cached Login
1. Close browser
2. Reopen and navigate to app
3. Observe loading

**Expected**:
- [ ] Immediate render with cached user
- [ ] Background refresh happens silently
- [ ] No blocking spinner

#### Test C: Logout Flow
1. Click logout
2. Observe behavior

**Expected**:
- [ ] Clears all cached data
- [ ] Redirects to login
- [ ] No errors in console

---

### 3. **Dashboard Performance**

#### Test Steps:
1. Navigate to `/dashboard`
2. Observe loading sequence
3. Check Network tab

**Expected**:
- [ ] Dashboard renders immediately
- [ ] Recent transactions load after 100ms delay
- [ ] No blocking queries
- [ ] Smooth user experience

---

### 4. **Product Browsing**

#### Test Steps:
1. Navigate to `/akun-bm`
2. Browse products
3. Check console

**Expected**:
- [ ] Products load normally
- [ ] Stock counts accurate
- [ ] No debug console.log spam
- [ ] Only error logs if issues occur

---

### 5. **Purchase Flow**

#### Test Steps:
1. Select a product
2. Click "Beli Sekarang"
3. Complete purchase
4. Check transaction

**Expected**:
- [ ] Purchase modal opens
- [ ] Balance check works
- [ ] Purchase completes successfully
- [ ] Transaction recorded
- [ ] Minimal console output

---

## 📊 Performance Metrics to Measure

### Using Chrome DevTools:

#### 1. **Lighthouse Audit**
```
DevTools → Lighthouse → Analyze page load
```

**Target Scores**:
- Performance: > 80
- First Contentful Paint: < 1.5s
- Time to Interactive: < 2.5s
- Speed Index: < 2.0s

#### 2. **Network Analysis**
```
DevTools → Network → Reload page
```

**Check**:
- [ ] DNS lookup time (should be instant with prefetch)
- [ ] Initial connection time
- [ ] Number of requests
- [ ] Total transfer size
- [ ] DOMContentLoaded time
- [ ] Load time

#### 3. **Performance Timeline**
```
DevTools → Performance → Record → Reload
```

**Look for**:
- [ ] No long tasks (> 50ms)
- [ ] Smooth frame rate
- [ ] Quick script evaluation
- [ ] Fast DOM rendering

---

## 🔍 Specific Things to Verify

### AuthContext Optimization
```javascript
// Open DevTools Console
// Navigate to app
// Should see:
// 1. Immediate render (no 5s wait)
// 2. Background auth refresh
// 3. No blocking behavior
```

### Console Cleanup
```javascript
// Open DevTools Console
// Navigate through app
// Should NOT see:
// ❌ "🔍 fetchProducts - Query executed"
// ❌ "📦 Fetching stock for products"
// ❌ "✅ Stock map from product_accounts"
// ❌ "🛒 purchaseProduct called"

// Should ONLY see:
// ✅ Actual errors (if any)
// ✅ Important warnings
```

### React Query Optimization
```javascript
// Open React Query DevTools (if installed)
// Check query behavior:
// - Should use cached data on mount
// - Should not retry failed queries
// - Should not refetch on window focus
```

---

## 🐛 Known Issues to Watch For

### Potential Issues:
1. **Cached data stale**: If user data doesn't update
   - **Fix**: Background refresh should update it
   - **Fallback**: Manual refresh

2. **Auth fails silently**: If background auth fails
   - **Check**: Error handling in AuthContext
   - **Expected**: Falls back to cached data

3. **Queries fail without retry**: If network unstable
   - **Expected**: Faster failure feedback
   - **User action**: Manual refresh

---

## 📈 Before/After Comparison

### Measure These:

| Metric | How to Measure | Target Improvement |
|--------|----------------|-------------------|
| **Initial Load** | Stopwatch from URL enter to content visible | -60% |
| **Auth Check** | Time until user data appears | -90% |
| **Console Logs** | Count logs during normal flow | -95% |
| **First Paint** | Lighthouse FCP | -70% |
| **Interactive** | Lighthouse TTI | -60% |

---

## ✅ Success Criteria

### Phase 1 is successful if:
- [x] Build completes without errors ✅
- [ ] App loads faster (subjective feel)
- [ ] No functionality broken
- [ ] Console is cleaner
- [ ] Auth doesn't block UI
- [ ] All features work as before

---

## 🚨 Rollback Plan

If issues occur:

### Quick Rollback:
```bash
# Revert all changes
git checkout HEAD~1

# Or revert specific files
git checkout HEAD~1 src/features/member-area/contexts/AuthContext.tsx
git checkout HEAD~1 src/features/member-area/services/products.service.ts
```

### Files to Revert:
1. `src/features/member-area/contexts/AuthContext.tsx`
2. `src/features/member-area/services/products.service.ts`
3. `src/main.tsx`
4. `src/features/member-area/MemberArea.tsx`
5. `src/features/member-area/pages/Dashboard.tsx`
6. `index.html`
7. `src/index.css`

---

## 📝 Testing Notes Template

```markdown
## Test Date: [DATE]
## Tester: [NAME]

### Initial Load
- Time to first content: _____ seconds
- Console logs count: _____
- Issues: _____

### Auth Flow
- Login works: [ ] Yes [ ] No
- Cached login works: [ ] Yes [ ] No
- Logout works: [ ] Yes [ ] No
- Issues: _____

### Dashboard
- Loads quickly: [ ] Yes [ ] No
- Transactions load: [ ] Yes [ ] No
- Issues: _____

### Products
- Browse works: [ ] Yes [ ] No
- Stock accurate: [ ] Yes [ ] No
- Issues: _____

### Purchase
- Modal opens: [ ] Yes [ ] No
- Purchase completes: [ ] Yes [ ] No
- Issues: _____

### Overall
- Feels faster: [ ] Yes [ ] No [ ] Same
- Any broken features: _____
- Recommendation: [ ] Keep [ ] Rollback [ ] Needs fixes
```

---

**Ready to Test!** 🚀

Start with clearing cache and measuring initial load time.
