# Tutorial Card Update - Menyamakan Tampilan dengan Product Card

## Perubahan yang Dilakukan

Card pada halaman Tutorial telah diperbarui agar tampilannya konsisten dengan card produk pada menu Akun BM.

### Perubahan Utama:

1. **Layout Structure**
   - Menggunakan `flex flex-col h-full` untuk layout yang konsisten
   - Card sekarang mengisi tinggi penuh container-nya

2. **Thumbnail dengan Aspect Ratio 50%**
   - Menggunakan `paddingTop: '50%'` untuk aspect ratio yang konsisten
   - Thumbnail sekarang memiliki proporsi yang sama dengan ProductCard
   - Icon BookOpen ditampilkan di tengah dengan background gradient indigo

3. **Badge Kategori**
   - Posisi badge dipindahkan ke `top-3 left-3` (overlay di atas thumbnail)
   - Menggunakan size `sm` untuk konsistensi dengan ProductCard

4. **Content Spacing**
   - Padding diubah dari `p-4` menjadi `px-3 py-3`
   - Spacing antar elemen disesuaikan (mb-1, mb-2)

5. **Typography**
   - Title: `text-base font-bold` dengan `line-clamp-1`
   - Description: `text-xs` dengan `line-clamp-2` dan `leading-relaxed`
   - Read time: `text-xs` dengan icon size `w-3.5 h-3.5`

6. **Shadow & Hover Effects**
   - Base shadow: `shadow-md`
   - Hover shadow: `hover:shadow-lg`
   - Transition: `transition-shadow duration-200`

### File yang Diubah:
- `src/features/member-area/components/tutorials/TutorialCard.tsx`
- `src/features/member-area/components/tutorials/TutorialGrid.tsx`

### Perubahan Grid Layout:

1. **Ukuran Card yang Konsisten**
   - Menggunakan `gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 280px))'`
   - Setiap card memiliki lebar tetap 280px (sama dengan ProductCard)
   - Responsive untuk layar kecil dengan `min(280px, 100%)`

2. **Gap yang Lebih Compact**
   - Gap diubah dari `gap-6` (24px) menjadi `gap: '8px'`
   - Memberikan tampilan yang lebih rapat dan konsisten dengan ProductGrid

3. **Loading Skeleton yang Disesuaikan**
   - Skeleton menggunakan aspect ratio 50% untuk thumbnail
   - Padding dan spacing disesuaikan dengan card yang baru

4. **Empty State yang Lebih Baik**
   - Menggunakan layout centered dengan icon yang lebih besar
   - Konsisten dengan empty state ProductGrid

### Hasil:
Card tutorial sekarang memiliki tampilan dan ukuran yang konsisten dengan card produk, memberikan pengalaman visual yang seragam di seluruh aplikasi.
