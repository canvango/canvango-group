# Guest Price Restriction Implementation

## Overview

Implemented guest access restrictions for product pages (/akun-bm and /akun-personal) to hide prices and redirect to login when attempting to purchase.

## Changes Made

### 1. ProductCard Component
**File:** `src/features/member-area/components/products/ProductCard.tsx`

**Changes:**
- Added `useAuth()` hook to detect guest users
- Added `useNavigate()` for login redirection
- Hide price for guests, show "Login untuk melihat harga" message
- Redirect to `/login` when guest clicks "Beli" button

**Implementation:**
```tsx
// Price display
{isGuest ? (
  <p className="text-xs text-gray-600 italic">
    Login untuk melihat harga
  </p>
) : (
  <p className="text-lg md:text-xl font-bold text-primary-600">
    {formatPrice(product.price)}
  </p>
)}

// Buy button
<Button
  onClick={() => {
    if (isGuest) {
      navigate('/login');
    } else {
      onBuy(product.id);
    }
  }}
>
  Beli
</Button>
```

### 2. ProductDetailModal Component
**File:** `src/features/member-area/components/products/ProductDetailModal.tsx`

**Changes:**
- Added `useAuth()` hook to detect guest users
- Added `useNavigate()` for login redirection
- Hide price in detail modal for guests
- Redirect to `/login` when guest clicks "Beli Sekarang" button

**Implementation:**
```tsx
// Price in detail section
{isGuest ? (
  <span className="text-xs text-gray-600 italic">
    Login untuk melihat harga
  </span>
) : (
  <span className="text-primary-600 font-bold text-xs">
    {formatPrice(product.price)}
  </span>
)}

// Buy button in modal
<Button
  onClick={() => {
    if (isGuest) {
      navigate('/login');
    } else if (!isOutOfStock) {
      onBuyNow(product.id);
    }
  }}
>
  Beli Sekarang
</Button>
```

## User Experience

### For Guest Users (Not Logged In)

**Product Card:**
- ✅ Can see product title, description, and stock
- ✅ Price is hidden, shows "Login untuk melihat harga"
- ✅ Message positioned above "Beli" button, aligned left with stock on right
- ✅ Clicking "Beli" redirects to `/login`
- ✅ Can still click "Detail" to view product details

**Product Detail Modal:**
- ✅ Can see all product information except price
- ✅ Price field shows "Login untuk melihat harga"
- ✅ Clicking "Beli Sekarang" redirects to `/login`
- ✅ Can close modal and browse other products

### For Authenticated Users

**No Changes:**
- ✅ Can see all prices normally
- ✅ Can purchase products as before
- ✅ All existing functionality preserved

## Technical Details

### Authentication Check
Uses `isGuest` from AuthContext:
```tsx
const { isGuest } = useAuth();
```

### Navigation
Uses React Router's `useNavigate`:
```tsx
const navigate = useNavigate();
navigate('/login');
```

### Typography Standards
Message follows project standards:
- Font size: `text-xs` (12px)
- Color: `text-blue-600` (blue for emphasis)
- Style: `font-bold` for strong emphasis

## Testing Checklist

- [ ] Guest user sees "Login untuk melihat harga" instead of price
- [ ] Guest user redirected to /login when clicking "Beli" on card
- [ ] Guest user redirected to /login when clicking "Beli Sekarang" in modal
- [ ] Guest user can still view product details
- [ ] Authenticated user sees prices normally
- [ ] Authenticated user can purchase normally
- [ ] Message positioning correct (left side, above button, aligned with stock)
- [ ] Works on both /akun-bm and /akun-personal pages
- [ ] Responsive on mobile and desktop

## Files Modified

1. `src/features/member-area/components/products/ProductCard.tsx`
2. `src/features/member-area/components/products/ProductDetailModal.tsx`

## No Breaking Changes

- ✅ All existing functionality preserved for authenticated users
- ✅ No changes to database or API
- ✅ No changes to routing or navigation structure
- ✅ Compatible with existing purchase flow
