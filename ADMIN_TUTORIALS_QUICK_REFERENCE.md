# Admin Tutorials - Quick Reference Card

## 🚀 Quick Actions

### Filter Tutorials
```
1. Search: Ketik di search box
2. Category: Pilih dari dropdown
3. Status: All / Published / Draft
```

### Publish Tutorial
```
1. Cari tutorial dengan status "Draft"
2. Klik button "Publish" (hijau)
3. ✓ Toast: "Tutorial dipublish!"
```

### Unpublish Tutorial
```
1. Cari tutorial dengan status "Published"
2. Klik button "Unpublish" (kuning)
3. ✓ Toast: "Tutorial di-unpublish!"
```

### Create Tutorial
```
1. Klik "+ Buat Tutorial"
2. Isi form (minimal: title, content, category)
3. Centang "Publish sekarang" jika ingin langsung publish
4. Klik "Buat Tutorial"
5. ✓ Toast: "Tutorial berhasil dibuat!"
```

### Edit Tutorial
```
1. Klik "Edit" pada tutorial
2. Ubah data yang diperlukan
3. Klik "Simpan Perubahan"
4. ✓ Toast: "Tutorial berhasil diupdate!"
```

### Delete Tutorial
```
1. Klik "Hapus" pada tutorial
2. Modal konfirmasi muncul
3. Klik "Hapus" untuk konfirmasi
4. ✓ Toast: "Tutorial berhasil dihapus!"
```

## 📊 Status Indicators

| Badge | Meaning | Action Available |
|-------|---------|------------------|
| ✓ Published | Tutorial live & visible | Unpublish |
| ○ Draft | Tutorial not visible | Publish |

## 🎨 Button Colors

| Button | Color | Action |
|--------|-------|--------|
| Publish | 🟢 Green | Make tutorial visible |
| Unpublish | 🟡 Yellow | Hide tutorial |
| Edit | 🔵 Blue | Modify tutorial |
| Hapus | 🔴 Red | Delete tutorial |

## 🔍 Filter Combinations

### Show only published tutorials
```
Status: Published
Category: (any)
```

### Show only drafts
```
Status: Draft
Category: (any)
```

### Show specific category
```
Status: All
Category: (select category)
```

### Search in published only
```
Search: (keyword)
Status: Published
```

## 📝 Form Fields

### Required Fields (*)
- Title
- Content
- Category

### Optional Fields
- Slug (auto-generated from title)
- Description
- Difficulty (Beginner/Intermediate/Advanced)
- Duration (minutes)
- Video URL
- Thumbnail URL
- Tags

### Publish Options
- [ ] Publish sekarang → Tutorial langsung visible
- [x] Publish sekarang → Tutorial disimpan sebagai draft

## 🔔 Notification Messages

### Success Messages
```
✓ Tutorial berhasil dibuat!
  Tutorial sudah dipublish / Tutorial disimpan sebagai draft

✓ Tutorial berhasil diupdate!
  Perubahan telah disimpan

✓ Tutorial berhasil dihapus!
  "Tutorial Name" telah dihapus

✓ Tutorial dipublish!
  Tutorial sekarang dapat dilihat oleh member

✓ Tutorial di-unpublish!
  Tutorial disimpan sebagai draft
```

### Error Messages
```
✗ Gagal membuat tutorial
  [Error detail dari server]

✗ Gagal mengupdate tutorial
  [Error detail dari server]

✗ Gagal menghapus tutorial
  [Error detail dari server]

✗ Gagal mengubah status publish
  [Error detail dari server]
```

## 🎯 Best Practices

### Creating Tutorials
1. ✅ Write clear, descriptive titles
2. ✅ Add detailed descriptions
3. ✅ Use appropriate categories
4. ✅ Add relevant tags
5. ✅ Save as draft first, review, then publish

### Managing Tutorials
1. ✅ Use status filter to focus on drafts
2. ✅ Unpublish outdated tutorials
3. ✅ Update content regularly
4. ✅ Monitor view counts
5. ✅ Delete unused tutorials

### Publishing Workflow
```
Create → Save as Draft → Review → Publish → Monitor → Update/Unpublish
```

## 🐛 Troubleshooting

### Tutorial not showing in member area
```
Check:
1. Is tutorial published? (✓ Published badge)
2. Is category correct?
3. Check RLS policies
```

### Cannot create tutorial
```
Check:
1. All required fields filled?
2. Slug unique?
3. User has admin role?
```

### Cannot delete tutorial
```
Check:
1. Tutorial not referenced elsewhere?
2. User has admin role?
3. Check console for errors
```

## 📱 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search |
| `Esc` | Close modal |
| `Enter` | Submit form (in modal) |

## 📊 Statistics Cards

### Total Tutorial
Total semua tutorial (published + draft)

### Published
Tutorial yang visible untuk member

### Draft
Tutorial yang belum dipublish

### Kategori
Jumlah kategori unik

## 🔗 Related Pages

- `/admin/tutorials` - Tutorial management
- `/tutorials` - Member view (published only)
- `/admin/dashboard` - Admin dashboard

## 💡 Tips & Tricks

### Bulk Management
1. Use status filter to show all drafts
2. Review and publish in batch
3. Use category filter for focused management

### Content Organization
1. Use consistent category names
2. Add descriptive tags
3. Set appropriate difficulty levels
4. Include video URLs when available

### Quality Control
1. Always save as draft first
2. Review content before publishing
3. Test links and videos
4. Check formatting
5. Verify category and tags

## 📞 Need Help?

### Common Questions

**Q: How to unpublish a tutorial?**
A: Click "Unpublish" button (yellow) in the Actions column

**Q: Can I edit published tutorials?**
A: Yes, click "Edit" and make changes. Tutorial stays published.

**Q: How to see only drafts?**
A: Use Status filter → Select "Draft"

**Q: What happens when I delete a tutorial?**
A: Tutorial is permanently deleted. Cannot be recovered.

**Q: Can members see draft tutorials?**
A: No, only published tutorials are visible to members.

---

**Last Updated:** 2025-11-27
**Version:** 1.0
**Status:** Production Ready
