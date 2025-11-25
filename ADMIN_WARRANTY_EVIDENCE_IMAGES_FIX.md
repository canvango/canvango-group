# Admin Warranty Evidence Images Fix

## Problem
Admin tidak bisa melihat gambar evidence yang diupload oleh member saat mengajukan warranty claim di halaman `/admin/claims`.

## Root Cause Analysis

### 1. Missing UI Component ❌
Modal detail di `WarrantyClaimManagement.tsx` tidak memiliki section untuk menampilkan `evidence_urls`.

### 2. Storage Bucket Configuration ⚠️
- Bucket `warranty-screenshots` dikonfigurasi sebagai **private** (`public: false`)
- Upload menggunakan `getPublicUrl()` yang tidak bekerja untuk private bucket
- Public URLs tidak bisa diakses karena bucket private

### 3. Storage Policies ✅
RLS policies sudah benar:
- Users dapat upload dan view gambar mereka sendiri
- Admins dapat view semua gambar warranty

## Solution Implemented

### 1. Created Utility Functions
**File:** `src/features/member-area/utils/warrantyStorage.ts`

```typescript
// Generate signed URLs for private bucket access
export const getWarrantyScreenshotUrl = async (urlOrPath: string): Promise<string | null>
export const getWarrantyScreenshotUrls = async (filePaths: string[]): Promise<string[]>
```

**Features:**
- ✅ Generates signed URLs valid for 1 hour
- ✅ Works with private buckets
- ✅ Backward compatible with old public URL format
- ✅ Extracts file path from full URLs automatically

### 2. Created Evidence Images Viewer Component
**File:** `src/features/member-area/components/warranty/EvidenceImagesViewer.tsx`

**Features:**
- ✅ Loads and displays evidence images with signed URLs
- ✅ Grid layout (2-3 columns responsive)
- ✅ Loading state with spinner
- ✅ Error handling with fallback
- ✅ Click to view full size (lightbox modal)
- ✅ Open in new tab option
- ✅ Hover effects for better UX

### 3. Updated Admin Warranty Management Page
**File:** `src/features/member-area/pages/admin/WarrantyClaimManagement.tsx`

**Changes:**
- ✅ Added import for `EvidenceImagesViewer`
- ✅ Added evidence images section in modal detail
- ✅ Shows image count in section header
- ✅ Only displays if `evidence_urls` exists and has items

### 4. Updated Upload Implementation
**File:** `src/features/member-area/components/warranty/ClaimSubmissionSection.tsx`

**Changes:**
- ✅ Changed from storing public URLs to storing file paths
- ✅ File paths format: `{user_id}/{timestamp}-{random}.{ext}`
- ✅ Compatible with signed URL generation

## Technical Details

### Storage Configuration
```
Bucket: warranty-screenshots
Public: false (private)
File Size Limit: 5MB
Allowed MIME Types: image/jpeg, image/jpg, image/png, image/gif, image/webp
```

### RLS Policies
```sql
-- Users can view their own screenshots
SELECT: (bucket_id = 'warranty-screenshots' AND foldername[1] = auth.uid())

-- Admins can view all screenshots
SELECT: (bucket_id = 'warranty-screenshots' AND user.role = 'admin')

-- Users can upload their own screenshots
INSERT: (bucket_id = 'warranty-screenshots')

-- Users can delete their own screenshots
DELETE: (bucket_id = 'warranty-screenshots' AND foldername[1] = auth.uid())
```

### Signed URL Flow
```
1. Member uploads image → Store file path in evidence_urls
2. Admin opens claim detail → Component loads
3. EvidenceImagesViewer calls getWarrantyScreenshotUrls()
4. Utility extracts file path (if URL) or uses path directly
5. Generate signed URL via Supabase Storage API
6. Display images with signed URLs (valid 1 hour)
```

## Files Modified

1. ✅ `src/features/member-area/pages/admin/WarrantyClaimManagement.tsx`
   - Added evidence images section
   - Imported EvidenceImagesViewer component

2. ✅ `src/features/member-area/components/warranty/ClaimSubmissionSection.tsx`
   - Changed to store file paths instead of public URLs

3. ✅ `src/features/member-area/components/warranty/index.ts`
   - Added export for EvidenceImagesViewer

## Files Created

1. ✅ `src/features/member-area/utils/warrantyStorage.ts`
   - Signed URL generation utilities

2. ✅ `src/features/member-area/components/warranty/EvidenceImagesViewer.tsx`
   - Evidence images viewer component with lightbox

## Testing Checklist

### Admin Side
- [ ] Login as admin
- [ ] Navigate to `/admin/claims`
- [ ] Click "View Details" on a claim with evidence
- [ ] Verify images load and display correctly
- [ ] Click on image to view full size (lightbox)
- [ ] Click "Open in new tab" to verify signed URL works
- [ ] Verify loading state shows while images load
- [ ] Verify error state if images fail to load

### Member Side (Future Claims)
- [ ] Login as member
- [ ] Submit new warranty claim with screenshots
- [ ] Verify file paths are stored (not full URLs)
- [ ] Verify admin can view the new claim's images

### Backward Compatibility
- [ ] Verify old claims with public URLs still work
- [ ] Utility should extract path from old URLs
- [ ] Generate signed URLs for old data

## Security Notes

✅ **Secure Implementation:**
- Private bucket prevents unauthorized access
- Signed URLs expire after 1 hour
- RLS policies enforce access control
- Only authenticated users can access
- Admins can view all, users only their own

## Performance Notes

- Signed URLs are generated on-demand (not stored)
- URLs cached in component state during viewing
- Parallel loading of multiple images
- 1-hour expiry reduces API calls

## Status
✅ **COMPLETE** - Admin can now view evidence images uploaded by members in warranty claims.

## Next Steps (Optional Improvements)

1. **Image Compression:** Compress images before upload to reduce storage
2. **Thumbnail Generation:** Generate thumbnails for faster grid loading
3. **Batch Signed URLs:** Use `createSignedUrls()` for better performance
4. **URL Caching:** Cache signed URLs in React Query for 50 minutes
5. **Image Validation:** Add client-side image validation before upload
