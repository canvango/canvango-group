# Quick Reference - Screenshot Klaim Garansi

## 📸 Fitur Overview

Member bisa upload hingga 3 screenshot sebagai bukti saat mengajukan klaim garansi. Admin bisa melihat screenshot tersebut di halaman claim management.

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| **Max Files** | 3 screenshot per klaim |
| **Max Size** | 5MB per file |
| **Formats** | JPG, PNG, GIF, WebP |
| **Storage** | Supabase Storage (private bucket) |
| **Optional** | Screenshot tidak wajib |

## 📁 File Locations

### Frontend
```
src/features/member-area/
├── components/warranty/
│   └── ClaimSubmissionSection.tsx    # Upload UI
├── pages/admin/
│   └── ClaimManagement.tsx           # Admin view
└── services/
    └── adminClaimService.ts          # Type definitions
```

### Backend
```
server/src/controllers/
└── warranty.controller.ts            # Handle screenshotUrls
```

### Database
```
Table: warranty_claims
Column: evidence_urls (text[])
```

### Storage
```
Bucket: warranty-screenshots
Path: {user_id}/{timestamp}-{random}.{ext}
```

## 🔧 Code Snippets

### Upload Screenshot (Frontend)
```typescript
const uploadScreenshots = async (): Promise<string[]> => {
  const urls: string[] = [];
  
  for (const file of screenshots) {
    const fileName = `${user.id}/${Date.now()}-${random}.${ext}`;
    
    const { error } = await supabase.storage
      .from('warranty-screenshots')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data } = supabase.storage
      .from('warranty-screenshots')
      .getPublicUrl(fileName);
    
    urls.push(data.publicUrl);
  }
  
  return urls;
};
```

### Submit with Screenshots
```typescript
const handleFormSubmit = async (data) => {
  const screenshotUrls = await uploadScreenshots();
  
  onSubmit({
    ...data,
    screenshotUrls
  });
};
```

### Backend Save
```typescript
const { accountId, reason, description, screenshotUrls } = req.body;

await supabase
  .from('warranty_claims')
  .insert({
    user_id: userId,
    purchase_id: accountId,
    claim_type: 'replacement',
    reason: `${reason}: ${description}`,
    evidence_urls: screenshotUrls || [],
    status: 'pending'
  });
```

### Admin Display
```tsx
{/* Table Column */}
{claim.evidence_urls && claim.evidence_urls.length > 0 ? (
  <span className="text-xs font-medium text-blue-600">
    📸 {claim.evidence_urls.length}
  </span>
) : (
  <span className="text-xs text-gray-400">-</span>
)}

{/* Detail Modal */}
{selectedClaim.evidence_urls?.length > 0 && (
  <div className="grid grid-cols-3 gap-3">
    {selectedClaim.evidence_urls.map((url, index) => (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img src={url} alt={`Screenshot ${index + 1}`} />
      </a>
    ))}
  </div>
)}
```

## 🗄️ Database Schema

```sql
-- warranty_claims table
CREATE TABLE warranty_claims (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  purchase_id UUID NOT NULL,
  claim_type VARCHAR NOT NULL,
  reason TEXT NOT NULL,
  evidence_urls TEXT[],  -- ✅ Screenshot URLs
  status VARCHAR NOT NULL,
  admin_notes TEXT,
  resolution_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
```

## 🔒 RLS Policies

```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload their own warranty screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'warranty-screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can view their own screenshots
CREATE POLICY "Users can view their own warranty screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'warranty-screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can view all screenshots
CREATE POLICY "Admins can view all warranty screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'warranty-screenshots' AND
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.auth_id = auth.uid()
    AND users.role = 'admin'
  )
);
```

## 🎨 UI Components

### Upload Box (Empty State)
```tsx
<div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
  <Upload className="w-6 h-6 text-gray-400" />
  <button onClick={() => fileInputRef.current?.click()}>
    Pilih file gambar
  </button>
  <p className="text-xs text-gray-500">
    JPG, PNG, GIF maks. 5MB
  </p>
</div>
```

### Upload Box (With Screenshots)
```tsx
<div className="grid grid-cols-3 gap-3">
  {screenshots.map((file, index) => (
    <div className="relative group">
      <img src={URL.createObjectURL(file)} />
      <button onClick={() => removeScreenshot(index)}>
        <X className="w-4 h-4" />
      </button>
    </div>
  ))}
</div>
```

### Admin Preview
```tsx
<div className="grid grid-cols-3 gap-3">
  {claim.evidence_urls.map((url, index) => (
    <a
      href={url}
      target="_blank"
      className="group relative aspect-square rounded-xl overflow-hidden"
    >
      <img src={url} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30">
        <span className="text-white text-xs">Lihat Penuh</span>
      </div>
    </a>
  ))}
</div>
```

## 🚀 API Endpoints

### Submit Claim with Screenshots
```
POST /api/warranty/claims

Body:
{
  "accountId": "uuid",
  "reason": "login_failed",
  "description": "Akun tidak bisa login...",
  "screenshotUrls": [
    "https://...supabase.co/storage/v1/object/public/warranty-screenshots/user-id/file1.jpg",
    "https://...supabase.co/storage/v1/object/public/warranty-screenshots/user-id/file2.png"
  ]
}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "evidence_urls": ["url1", "url2"],
    ...
  }
}
```

### Get Claims (Admin)
```
GET /api/admin/claims?page=1&limit=10

Response:
{
  "success": true,
  "data": {
    "claims": [
      {
        "id": "uuid",
        "evidence_urls": ["url1", "url2"],
        ...
      }
    ]
  }
}
```

## 📊 Storage Structure

```
warranty-screenshots/
├── user-id-1/
│   ├── 1732147200000-abc123.jpg
│   ├── 1732147201000-def456.png
│   └── 1732147202000-ghi789.gif
├── user-id-2/
│   ├── 1732147300000-jkl012.jpg
│   └── 1732147301000-mno345.png
└── ...
```

## 🔍 Debugging

### Check if screenshot uploaded
```sql
SELECT id, evidence_urls 
FROM warranty_claims 
WHERE id = 'claim-id';
```

### Check storage files
```sql
SELECT name, created_at 
FROM storage.objects 
WHERE bucket_id = 'warranty-screenshots'
ORDER BY created_at DESC 
LIMIT 10;
```

### Check RLS policies
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';
```

## ⚡ Performance Tips

1. **Compress images** before upload (future enhancement)
2. **Use lazy loading** for admin preview
3. **Cache URLs** to avoid repeated queries
4. **Batch upload** multiple files simultaneously
5. **Show progress** for large files

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Upload fails | Check file size < 5MB, type allowed |
| Preview not showing | Check URL.createObjectURL() support |
| Admin can't see | Check RLS policy for admin role |
| Full size won't open | Check URL format, popup blocker |
| Slow upload | Check network, file size |

## 📝 Best Practices

1. ✅ Always validate file type & size
2. ✅ Show loading states during upload
3. ✅ Handle errors gracefully
4. ✅ Provide clear feedback to users
5. ✅ Use optimized images when possible
6. ✅ Clean up preview URLs (URL.revokeObjectURL)
7. ✅ Test on different devices
8. ✅ Monitor storage usage

## 🎯 Quick Commands

### Test upload (Frontend Console)
```javascript
const file = document.querySelector('input[type="file"]').files[0];
const { data, error } = await supabase.storage
  .from('warranty-screenshots')
  .upload(`test/${Date.now()}.jpg`, file);
console.log(data, error);
```

### List user files (SQL)
```sql
SELECT * FROM storage.objects 
WHERE bucket_id = 'warranty-screenshots' 
AND name LIKE 'user-id/%';
```

### Delete old files (SQL)
```sql
DELETE FROM storage.objects 
WHERE bucket_id = 'warranty-screenshots' 
AND created_at < NOW() - INTERVAL '90 days';
```

---

**Version**: 1.0.0
**Last Updated**: 2025-11-20
**Status**: Production Ready ✅
