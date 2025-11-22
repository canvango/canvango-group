# Requirements Document - CORS Fix Comprehensive

## Introduction

Aplikasi Canvango mengalami error CORS di deployment Vercel pada beberapa halaman, terutama halaman claim garansi dan halaman lainnya. Setelah analisis mendalam terhadap logs Supabase dan kode aplikasi, ditemukan bahwa:

**Temuan Analisis:**
1. **Supabase API berfungsi sempurna** - Semua request ke Supabase (200, 206, 204) berhasil tanpa error CORS
2. **Mayoritas service sudah menggunakan direct Supabase** - products.service.ts, auth.service.ts, dan lainnya langsung ke Supabase
3. **Backend Express jarang digunakan** - Hanya beberapa endpoint yang masih menggunakan backend Express
4. **Arsitektur tidak konsisten** - Ada duplikasi antara backend Express dan direct Supabase access

**Root Cause:**
Masalah CORS terjadi karena beberapa service (seperti warranty.service.ts, transaction.service.ts) masih mencoba mengakses backend Express API melalui `/api` endpoint, padahal:
- Backend Express tidak diperlukan untuk operasi CRUD sederhana
- Vercel serverless function menambah kompleksitas dan latency
- Direct Supabase access lebih cepat, lebih sederhana, dan tidak ada CORS issue

**Solusi:**
Menghilangkan dependency ke backend Express dan menggunakan 100% direct Supabase access untuk semua operasi. Backend Express akan dihapus dari arsitektur aplikasi.

## Glossary

- **CORS (Cross-Origin Resource Sharing)**: Mekanisme keamanan browser yang membatasi request HTTP dari origin yang berbeda
- **Preflight Request**: Request OPTIONS yang dikirim browser sebelum request sebenarnya untuk memeriksa izin CORS
- **Vercel Serverless Function**: Function yang berjalan on-demand di Vercel tanpa server yang selalu aktif
- **Supabase**: Backend-as-a-Service yang menyediakan database PostgreSQL dan API
- **Frontend**: Aplikasi React yang berjalan di browser user
- **Backend Express**: Server Node.js dengan Express yang handle API requests
- **Origin**: Kombinasi protocol, domain, dan port dari sebuah URL

## Requirements

### Requirement 1: Migrasi Semua Service ke Direct Supabase Access

**User Story:** Sebagai developer, saya ingin semua service menggunakan direct Supabase access, sehingga aplikasi tidak memerlukan backend Express dan tidak ada masalah CORS.

#### Acceptance Criteria

1. WHEN developer mengaudit kode, THE System SHALL mengidentifikasi semua service yang masih menggunakan backend Express API
2. WHEN developer melakukan migrasi, THE Service SHALL menggunakan Supabase client langsung untuk semua operasi database
3. WHEN service melakukan operasi CRUD, THE Service SHALL menggunakan Supabase query builder tanpa melalui backend Express
4. WHERE service memerlukan business logic kompleks, THE Service SHALL mengimplementasikan logic di frontend atau menggunakan Supabase Edge Functions
5. WHERE service memerlukan server-side validation, THE Service SHALL menggunakan Supabase RLS (Row Level Security) policies

### Requirement 2: Hapus Backend Express dari Arsitektur

**User Story:** Sebagai developer, saya ingin menghapus backend Express dari arsitektur aplikasi, sehingga aplikasi lebih sederhana dan tidak ada masalah CORS.

#### Acceptance Criteria

1. WHEN aplikasi di-deploy, THE System SHALL tidak menggunakan backend Express server
2. WHEN aplikasi berjalan, THE System SHALL hanya menggunakan static files dan direct Supabase access
3. WHEN user mengakses halaman apapun, THE System SHALL tidak melakukan request ke `/api` endpoint
4. WHERE backend Express code masih ada, THE System SHALL menandai sebagai deprecated atau menghapusnya
5. WHERE Vercel configuration masih mereferensi backend Express, THE Configuration SHALL diupdate untuk hanya serve static files

### Requirement 3: Optimalkan Vercel Configuration untuk Static Site

**User Story:** Sebagai developer, saya ingin konfigurasi Vercel dioptimalkan untuk static site dengan direct Supabase access, sehingga aplikasi dapat berjalan dengan performa optimal tanpa serverless functions.

#### Acceptance Criteria

1. WHEN Vercel melakukan build, THE System SHALL hanya build static frontend files
2. WHEN Vercel melakukan deploy, THE System SHALL tidak deploy serverless functions
3. WHEN user mengakses aplikasi, THE Vercel SHALL serve static files langsung
4. WHERE user mengakses non-existent routes, THE Vercel SHALL fallback ke index.html untuk SPA routing
5. WHERE Vercel configuration memiliki API rewrites, THE Configuration SHALL dihapus karena tidak diperlukan

### Requirement 4: Implementasi Supabase RLS untuk Security

**User Story:** Sebagai developer, saya ingin menggunakan Supabase Row Level Security (RLS) untuk mengamankan data, sehingga tidak perlu backend Express untuk authorization.

#### Acceptance Criteria

1. WHEN user melakukan query, THE Supabase RLS SHALL memverifikasi authorization berdasarkan user session
2. WHEN user mencoba akses data orang lain, THE Supabase RLS SHALL menolak request
3. WHEN admin melakukan query, THE Supabase RLS SHALL memberikan akses penuh sesuai role
4. WHERE table memerlukan protection, THE Table SHALL memiliki RLS policies yang aktif
5. WHERE operation memerlukan validation, THE Validation SHALL dilakukan di frontend atau Supabase triggers

### Requirement 5: Implementasi Error Handling dan Logging

**User Story:** Sebagai developer, saya ingin melihat log detail tentang Supabase operations, sehingga saya dapat dengan mudah debug masalah di production.

#### Acceptance Criteria

1. WHEN service melakukan query ke Supabase, THE System SHALL log query details di development mode
2. WHEN Supabase mengembalikan error, THE System SHALL log error dengan context yang jelas
3. WHEN user mengalami error, THE System SHALL menampilkan error message yang user-friendly
4. WHERE query gagal, THE System SHALL log query parameters untuk debugging
5. WHERE error terjadi, THE System SHALL menggunakan error boundary untuk graceful degradation

### Requirement 6: Simplifikasi Environment Variables

**User Story:** Sebagai developer, saya ingin environment variables yang lebih sederhana tanpa konfigurasi backend Express, sehingga setup lebih mudah.

#### Acceptance Criteria

1. WHEN aplikasi berjalan, THE System SHALL hanya memerlukan Supabase URL dan Anon Key
2. WHEN developer setup project, THE Developer SHALL tidak perlu konfigurasi backend Express variables
3. WHERE environment variables untuk backend Express masih ada, THE Variables SHALL dihapus atau ditandai deprecated
4. WHERE Vercel environment variables dikonfigurasi, THE Configuration SHALL hanya include Supabase credentials
5. WHERE `.env` file ada, THE File SHALL hanya berisi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY

### Requirement 7: Cleanup Backend Express Code

**User Story:** Sebagai developer, saya ingin menghapus semua code backend Express yang tidak diperlukan, sehingga codebase lebih bersih dan maintainable.

#### Acceptance Criteria

1. WHEN cleanup dilakukan, THE System SHALL menghapus folder `server/` yang berisi backend Express code
2. WHEN cleanup dilakukan, THE System SHALL menghapus `api/index.js` yang merupakan Vercel serverless function entry point
3. WHEN cleanup dilakukan, THE System SHALL menghapus `server.js` yang merupakan production server
4. WHERE package.json memiliki scripts untuk backend, THE Scripts SHALL dihapus atau diupdate
5. WHERE dependencies untuk backend Express masih ada, THE Dependencies SHALL dihapus dari package.json

### Requirement 8: Testing dan Verification

**User Story:** Sebagai developer, saya ingin memverifikasi bahwa aplikasi berfungsi dengan baik tanpa backend Express, sehingga saya dapat yakin tidak ada regresi.

#### Acceptance Criteria

1. WHEN developer menjalankan test, THE System SHALL test semua halaman untuk memastikan tidak ada error
2. WHEN developer menjalankan test, THE System SHALL test semua CRUD operations menggunakan direct Supabase
3. WHEN developer menjalankan test, THE System SHALL memverifikasi tidak ada request ke `/api` endpoint
4. WHERE test menemukan error, THE System SHALL melaporkan detail error dengan context yang jelas
5. WHERE semua test berhasil, THE System SHALL memberikan konfirmasi bahwa aplikasi berfungsi 100% dengan Supabase
