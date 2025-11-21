# Routing Analysis: Legacy vs Root

## Executive Summary

This document analyzes the routing structure differences between Legacy Frontend and Root Project to guide the integration process.

## Legacy Frontend Routing Structure

### Top-Level Structure
- Uses `BrowserRouter` at App.tsx level
- Has separate auth routes (login, register, forgot-password, reset-password)
- Uses `MemberAreaLayout` as a parent route for all member pages
- Implements `GuestRoute` for auth pages (redirects if logged in)
- Implements `ProtectedRoute` for member pages (redirects if not logged in)

### Auth Routes (Public/Guest Only)
```
/login                  → Login page (GuestRoute)
/register               → Register page (GuestRoute)
/forgot-password        → ForgotPassword page (GuestRoute)
/reset-password         → ResetPassword page (no guard)
/unauthorized           → Unauthorized page (no guard)
```

### Member Area Routes (Under MemberAreaLayout)
```
/                       → Redirect to /dashboard
/dashboard              → Dashboard (no auth guard - accessible to guests)
/riwayat-transaksi      → TransactionHistory (ProtectedRoute)
/top-up                 → TopUp (ProtectedRoute)
/akun-bm                → AkunBM (no auth guard - accessible to guests)
/akun-personal          → AkunPersonal (no auth guard - accessible to guests)
/jasa-verified-bm       → JasaVerifiedBM (ProtectedRoute)
/claim-garansi          → ClaimGaransi (ProtectedRoute)
/api                    → API (no auth guard - accessible to guests)
/tutorial               → Tutorial (no auth guard - accessible to guests)
```

### Admin Routes (Under MemberAreaLayout, Admin Only)
```
/admin/dashboard        → AdminDashboard (ProtectedRoute with requiredRole="admin")
/admin/users            → UserManagement (ProtectedRoute with requiredRole="admin")
/admin/transactions     → TransactionManagement (ProtectedRoute with requiredRole="admin")
/admin/claims           → ClaimManagement (ProtectedRoute with requiredRole="admin")
/admin/tutorials        → TutorialManagement (ProtectedRoute with requiredRole="admin")
/admin/products         → ProductManagement (ProtectedRoute with requiredRole="admin")
/admin/settings         → SystemSettings (ProtectedRoute with requiredRole="admin")
/admin/audit-logs       → AuditLog (ProtectedRoute with requiredRole="admin")
```

### Catch-All Route
```
/*                      → Redirect to /dashboard
```

## Root Project Routing Structure

### Top-Level Structure
- Uses `BrowserRouter` at main.tsx level
- No auth routes defined (login, register, etc.)
- MemberArea component contains all routing
- All routes are under implicit member area context

### Current Routes (All under MemberArea)
```
/                       → Redirect to /dashboard
/dashboard              → Dashboard (ProtectedRoute)
/riwayat-transaksi      → TransactionHistory (ProtectedRoute)
/top-up                 → TopUp (ProtectedRoute)
/akun-bm                → BMAccounts (ProtectedRoute)
/akun-personal          → PersonalAccounts (ProtectedRoute)
/jasa-verified-bm       → VerifiedBMService (ProtectedRoute)
/claim-garansi          → ClaimWarranty (ProtectedRoute)
/api                    → APIDocumentation (ProtectedRoute)
/tutorial               → TutorialCenter (ProtectedRoute)
/unauthorized           → Unauthorized (no guard)
/admin/users            → UserManagement (ProtectedRoute with requiredRole="admin")
/*                      → Redirect to /dashboard
```

### Missing Routes in Root
```
/login                  → NOT DEFINED
/register               → NOT DEFINED
/forgot-password        → NOT DEFINED
/reset-password         → NOT DEFINED
/admin/dashboard        → COMMENTED OUT (TODO)
/admin/transactions     → COMMENTED OUT (TODO)
/admin/claims           → COMMENTED OUT (TODO)
/admin/tutorials        → COMMENTED OUT (TODO)
/admin/products         → COMMENTED OUT (TODO)
/admin/settings         → COMMENTED OUT (TODO)
/admin/audit-logs       → COMMENTED OUT (TODO)
```

## Key Differences

### 1. Auth Routes
- **Legacy**: Has complete auth flow (login, register, forgot-password, reset-password)
- **Root**: No auth routes defined at all
- **Impact**: Users cannot log in or register in Root project

### 2. Guest Access
- **Legacy**: Some pages accessible without login (dashboard, akun-bm, akun-personal, api, tutorial)
- **Root**: All pages require authentication (ProtectedRoute on everything)
- **Impact**: Different access control philosophy

### 3. Admin Routes
- **Legacy**: All 8 admin routes fully implemented
- **Root**: Only 1 admin route (users) implemented, 7 are commented out
- **Impact**: Admin functionality severely limited in Root

### 4. Route Structure
- **Legacy**: Uses nested route structure with MemberAreaLayout as parent
- **Root**: Flat route structure within MemberArea component
- **Impact**: Different layout rendering approach

### 5. Navigation Paths
- **Legacy**: Routes are at root level (e.g., `/dashboard`)
- **Root**: Routes are also at root level but Sidebar uses `/member-area/` prefix for admin routes
- **Impact**: Inconsistent path references in navigation

## Migration Strategy

### Phase 1: Add Auth Routes (Task 11.2)
1. Create auth route wrapper at main.tsx level
2. Add login, register, forgot-password, reset-password routes
3. Implement GuestRoute component if not exists
4. Update routing to handle both auth and member routes

### Phase 2: Add Missing Admin Routes (Task 11.2)
1. Uncomment and verify admin page imports exist
2. Add all 7 missing admin routes
3. Ensure ProtectedRoute with requiredRole="admin" is applied
4. Test admin access control

### Phase 3: Update Navigation (Task 11.3)
1. Fix Sidebar admin route paths (remove `/member-area/` prefix)
2. Verify all menu items point to correct routes
3. Add any missing navigation items
4. Test navigation flow

### Phase 4: Align Access Control (Task 11.2)
1. Decide on guest access policy (follow Legacy or Root)
2. Update ProtectedRoute usage accordingly
3. Test guest vs authenticated access

## Route Mapping Table

| Route Path | Legacy Component | Root Component | Status | Action Needed |
|------------|------------------|----------------|--------|---------------|
| `/login` | Login | - | Missing | Add route |
| `/register` | Register | - | Missing | Add route |
| `/forgot-password` | ForgotPassword | - | Missing | Add route |
| `/reset-password` | ResetPassword | - | Missing | Add route |
| `/unauthorized` | Unauthorized | Unauthorized | ✓ Exists | None |
| `/dashboard` | Dashboard | Dashboard | ✓ Exists | Review auth guard |
| `/riwayat-transaksi` | TransactionHistory | TransactionHistory | ✓ Exists | None |
| `/top-up` | TopUp | TopUp | ✓ Exists | None |
| `/akun-bm` | AkunBM | BMAccounts | ✓ Exists | Review auth guard |
| `/akun-personal` | AkunPersonal | PersonalAccounts | ✓ Exists | Review auth guard |
| `/jasa-verified-bm` | JasaVerifiedBM | VerifiedBMService | ✓ Exists | None |
| `/claim-garansi` | ClaimGaransi | ClaimWarranty | ✓ Exists | None |
| `/api` | API | APIDocumentation | ✓ Exists | Review auth guard |
| `/tutorial` | Tutorial | TutorialCenter | ✓ Exists | Review auth guard |
| `/admin/dashboard` | AdminDashboard | - | Missing | Add route |
| `/admin/users` | UserManagement | UserManagement | ✓ Exists | None |
| `/admin/transactions` | TransactionManagement | - | Missing | Add route |
| `/admin/claims` | ClaimManagement | - | Missing | Add route |
| `/admin/tutorials` | TutorialManagement | - | Missing | Add route |
| `/admin/products` | ProductManagement | - | Missing | Add route |
| `/admin/settings` | SystemSettings | - | Missing | Add route |
| `/admin/audit-logs` | AuditLog | - | Missing | Add route |

## Recommendations

1. **Add Auth Routes First**: Without login/register routes, the application is unusable
2. **Implement All Admin Routes**: Complete the admin functionality by adding all 7 missing routes
3. **Standardize Access Control**: Decide whether to allow guest access to certain pages
4. **Fix Navigation Paths**: Ensure Sidebar paths match actual route definitions
5. **Test Thoroughly**: Verify all routes work with proper authentication and authorization

## Requirements Mapping

- **Requirement 5.1**: Extract all route definitions from Legacy App.tsx ✓ COMPLETE
- **Requirement 5.2**: Add missing routes to Root routing (Next: Task 11.2)
- **Requirement 5.3**: Update navigation components (Next: Task 11.3)
- **Requirement 5.4**: Apply authentication guards consistently (Next: Task 11.2)
- **Requirement 5.5**: Resolve route conflicts with clear naming (No conflicts found)
