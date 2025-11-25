# Admin Warranty Evidence Images - Quick Reference

## 🎯 Problem Solved
Admin sekarang bisa melihat gambar evidence yang diupload member di warranty claims.

## 📁 Files Changed

### Created
- `src/features/member-area/utils/warrantyStorage.ts` - Signed URL utilities
- `src/features/member-area/components/warranty/EvidenceImagesViewer.tsx` - Image viewer component

### Modified
- `src/features/member-area/pages/admin/WarrantyClaimManagement.tsx` - Added evidence section
- `src/features/member-area/components/warranty/ClaimSubmissionSection.tsx` - Store file paths
- `src/features/member-area/components/warranty/index.ts` - Export new component

## 🔑 Key Changes

### Before ❌
```typescript
// Stored public URLs (doesn't work with private bucket)
urls.push(urlData.publicUrl);
```

### After ✅
```typescript
// Store file paths only
urls.push(fileName); // e.g., "user-id/timestamp-random.jpg"

// Generate signed URLs when viewing
const signedUrls = await getWarrantyScreenshotUrls(evidenceUrls);
```

## 🖼️ UI Features

### Evidence Images Section
```tsx
{selectedClaim.evidence_urls && selectedClaim.evidence_urls.length > 0 && (
  <div>
    <h3>Evidence Screenshots ({selectedClaim.evidence_urls.length})</h3>
    <EvidenceImagesViewer evidenceUrls={selectedClaim.evidence_urls} />
  </div>
)}
```

### Component Features
- ✅ Grid layout (2-3 columns)
- ✅ Loading spinner
- ✅ Error handling
- ✅ Click to enlarge (lightbox)
- ✅ Open in new tab
- ✅ Hover effects

## 🔐 Security

**Storage Bucket:** Private
**Access Control:** RLS Policies
**URL Type:** Signed URLs (1 hour expiry)
**Permissions:**
- Users: View own images
- Admins: View all images

## 🧪 Quick Test

1. Login as admin
2. Go to `/admin/claims`
3. Click "View Details" on any claim
4. Scroll to "Evidence Screenshots" section
5. Images should load and be clickable

## 📊 Data Format

### Database (evidence_urls column)
```json
[
  "c79d1221-ab3c-49f1-b043-4fc0ddb0e09f/1764094559106-gixop.jpg"
]
```

### Signed URL (generated on-demand)
```
https://gpittnsfzgkdbqnccncn.supabase.co/storage/v1/object/sign/warranty-screenshots/c79d1221.../file.jpg?token=xxx
```

## 🔄 Backward Compatibility

Old data with full URLs? ✅ **Handled automatically**

```typescript
// Utility extracts path from old URLs
const filePath = extractFilePath(urlOrPath);
// Then generates signed URL
```

## ⚡ Performance

- Signed URLs generated on-demand
- Parallel image loading
- Component-level caching
- 1-hour URL expiry

## 🐛 Troubleshooting

**Images not loading?**
1. Check browser console for errors
2. Verify RLS policies are active
3. Check user has admin role
4. Verify files exist in storage

**"Failed to load images" error?**
1. Check Supabase connection
2. Verify storage bucket exists
3. Check RLS policies
4. Verify file paths in database

## 📝 Status
✅ **COMPLETE** - Ready for testing
