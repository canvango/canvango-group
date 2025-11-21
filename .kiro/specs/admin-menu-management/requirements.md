# Requirements Document

## Introduction

Fitur Admin Menu Management adalah sistem pengelolaan khusus untuk administrator dalam aplikasi Canvango Group. Fitur ini menyediakan menu-menu administrasi yang diletakkan di sidebar di bawah menu Tutorial, memungkinkan admin untuk mengelola seluruh aspek sistem termasuk user, transaksi, klaim, tutorial, dan pengaturan sistem.

## Glossary

- **Admin**: Pengguna dengan role administrator yang memiliki akses penuh ke sistem
- **Member**: Pengguna terdaftar dengan role member yang memiliki akses terbatas
- **Guest**: Pengunjung yang belum login atau terdaftar
- **Sidebar**: Menu navigasi vertikal di sisi kiri aplikasi
- **Dashboard Admin**: Halaman utama admin yang menampilkan statistik dan overview sistem
- **User Management**: Sistem pengelolaan data pengguna (CRUD, role assignment, balance update)
- **Transaction Management**: Sistem pengelolaan transaksi (view, update status, refund)
- **Claim Management**: Sistem pengelolaan klaim garansi (approve/reject, process refunds)
- **Tutorial Management**: Sistem pengelolaan konten tutorial (CRUD, view stats)
- **System Settings**: Pengaturan konfigurasi sistem
- **Audit Log**: Catatan aktivitas admin untuk tracking dan security
- **RLS**: Row Level Security untuk keamanan data di database
- **Supabase**: Backend-as-a-Service yang digunakan untuk database dan authentication
- **Product**: Item atau layanan yang dijual dalam sistem (BM Account, Personal Account, Verified BM, API)
- **Product Type**: Kategori produk yang tersedia dalam sistem
- **Stock Status**: Status ketersediaan produk (available, out_of_stock)

## Requirements

### Requirement 1

**User Story:** Sebagai admin, saya ingin melihat menu admin yang terpisah di sidebar, sehingga saya dapat dengan mudah mengakses fitur-fitur administrasi

#### Acceptance Criteria

1. WHEN admin login ke sistem, THE Sidebar SHALL menampilkan section "ADMIN" di bawah menu Tutorial
2. WHILE user memiliki role admin, THE Sidebar SHALL menampilkan semua menu admin yang tersedia
3. WHILE user memiliki role member atau guest, THE Sidebar SHALL menyembunyikan section "ADMIN"
4. THE Sidebar SHALL menampilkan judul section "ADMIN" dengan styling yang membedakannya dari section lain
5. THE Sidebar SHALL menampilkan icon yang sesuai untuk setiap menu admin

### Requirement 2

**User Story:** Sebagai admin, saya ingin mengakses Dashboard Admin, sehingga saya dapat melihat overview dan statistik sistem secara keseluruhan

#### Acceptance Criteria

1. WHEN admin mengklik menu "Dashboard Admin", THE System SHALL menampilkan halaman dashboard dengan statistik sistem
2. THE Dashboard Admin SHALL menampilkan total users dengan breakdown per role (guest, member, admin)
3. THE Dashboard Admin SHALL menampilkan total transaksi dengan breakdown per status (pending, completed, failed, refunded)
4. THE Dashboard Admin SHALL menampilkan total klaim dengan breakdown per status (pending, approved, rejected)
5. THE Dashboard Admin SHALL menampilkan total tutorial dengan view count
6. THE Dashboard Admin SHALL menampilkan recent activities atau audit log terbaru
7. THE Dashboard Admin SHALL menampilkan chart atau grafik untuk visualisasi data
8. IF admin tidak memiliki permission, THEN THE System SHALL redirect ke halaman unauthorized

### Requirement 3

**User Story:** Sebagai admin, saya ingin mengelola data pengguna, sehingga saya dapat melakukan CRUD operations, mengubah role, dan mengupdate balance user

#### Acceptance Criteria

1. WHEN admin mengklik menu "Kelola Pengguna", THE System SHALL menampilkan halaman User Management dengan tabel semua users
2. THE User Management SHALL menampilkan kolom: ID, Username, Email, Role, Balance, Status, Created At, Actions
3. THE User Management SHALL menyediakan fitur search berdasarkan username atau email
4. THE User Management SHALL menyediakan fitur filter berdasarkan role (guest, member, admin)
5. THE User Management SHALL menyediakan pagination untuk menampilkan data dalam jumlah besar
6. WHEN admin mengklik tombol "Edit" pada user, THE System SHALL menampilkan modal edit dengan form untuk mengubah username, email, role, dan balance
7. WHEN admin mengklik tombol "Delete" pada user, THE System SHALL menampilkan konfirmasi sebelum menghapus user
8. WHEN admin berhasil mengupdate atau menghapus user, THE System SHALL mencatat aktivitas tersebut di audit log
9. THE User Management SHALL menampilkan toast notification untuk setiap aksi yang berhasil atau gagal

### Requirement 4

**User Story:** Sebagai admin, saya ingin mengelola transaksi, sehingga saya dapat melihat semua transaksi, mengubah status, dan melakukan refund

#### Acceptance Criteria

1. WHEN admin mengklik menu "Kelola Transaksi", THE System SHALL menampilkan halaman Transaction Management dengan tabel semua transaksi
2. THE Transaction Management SHALL menampilkan kolom: ID, User, Product Type, Quantity, Amount, Status, Created At, Actions
3. THE Transaction Management SHALL menyediakan fitur search berdasarkan user atau product type
4. THE Transaction Management SHALL menyediakan fitur filter berdasarkan status (pending, completed, failed, refunded)
5. THE Transaction Management SHALL menyediakan fitur filter berdasarkan tanggal (date range)
6. WHEN admin mengklik tombol "Update Status" pada transaksi, THE System SHALL menampilkan modal untuk mengubah status transaksi
7. WHEN admin mengklik tombol "Refund" pada transaksi, THE System SHALL menampilkan konfirmasi dan memproses refund ke balance user
8. WHEN admin berhasil mengupdate status atau melakukan refund, THE System SHALL mencatat aktivitas tersebut di audit log
9. THE Transaction Management SHALL menampilkan detail transaksi ketika admin mengklik row tabel

### Requirement 5

**User Story:** Sebagai admin, saya ingin mengelola klaim garansi, sehingga saya dapat mereview, approve/reject, dan memproses refund untuk klaim

#### Acceptance Criteria

1. WHEN admin mengklik menu "Kelola Klaim", THE System SHALL menampilkan halaman Claim Management dengan tabel semua klaim
2. THE Claim Management SHALL menampilkan kolom: ID, User, Transaction, Description, Status, Created At, Actions
3. THE Claim Management SHALL menyediakan fitur filter berdasarkan status (pending, approved, rejected)
4. WHEN admin mengklik tombol "Review" pada klaim, THE System SHALL menampilkan modal dengan detail klaim dan form untuk approve/reject
5. WHEN admin approve klaim, THE System SHALL mengubah status klaim menjadi "approved" dan menampilkan opsi untuk process refund
6. WHEN admin reject klaim, THE System SHALL mengubah status klaim menjadi "rejected" dan meminta admin response/reason
7. WHEN admin process refund untuk klaim yang approved, THE System SHALL menambahkan amount ke balance user
8. WHEN admin berhasil approve, reject, atau refund klaim, THE System SHALL mencatat aktivitas tersebut di audit log
9. THE Claim Management SHALL menampilkan toast notification untuk setiap aksi yang berhasil atau gagal

### Requirement 6

**User Story:** Sebagai admin, saya ingin mengelola tutorial, sehingga saya dapat membuat, mengedit, menghapus, dan melihat statistik tutorial

#### Acceptance Criteria

1. WHEN admin mengklik menu "Kelola Tutorial", THE System SHALL menampilkan halaman Tutorial Management dengan tabel semua tutorial
2. THE Tutorial Management SHALL menampilkan kolom: ID, Title, Category, Tags, Views, Created At, Actions
3. THE Tutorial Management SHALL menyediakan tombol "Tambah Tutorial" untuk membuat tutorial baru
4. WHEN admin mengklik tombol "Tambah Tutorial", THE System SHALL menampilkan form dengan field: title, content, category, tags, is_published
5. WHEN admin mengklik tombol "Edit" pada tutorial, THE System SHALL menampilkan form edit dengan data tutorial yang sudah ada
6. WHEN admin mengklik tombol "Delete" pada tutorial, THE System SHALL menampilkan konfirmasi sebelum menghapus tutorial
7. THE Tutorial Management SHALL menyediakan fitur search berdasarkan title atau category
8. THE Tutorial Management SHALL menampilkan view count untuk setiap tutorial
9. WHEN admin berhasil create, update, atau delete tutorial, THE System SHALL mencatat aktivitas tersebut di audit log

### Requirement 7

**User Story:** Sebagai admin, saya ingin mengelola produk, sehingga saya dapat membuat, mengedit, menghapus, dan mengatur harga produk yang ditawarkan

#### Acceptance Criteria

1. WHEN admin mengklik menu "Kelola Produk", THE System SHALL menampilkan halaman Product Management dengan tabel semua produk
2. THE Product Management SHALL menampilkan kolom: ID, Product Name, Product Type, Category, Price, Stock Status, Created At, Actions
3. THE Product Management SHALL menyediakan tombol "Tambah Produk" untuk membuat produk baru
4. WHEN admin mengklik tombol "Tambah Produk", THE System SHALL menampilkan form dengan field: product_name, product_type, category, description, price, stock_status, is_active
5. WHEN admin mengklik tombol "Edit" pada produk, THE System SHALL menampilkan form edit dengan data produk yang sudah ada
6. WHEN admin mengklik tombol "Delete" pada produk, THE System SHALL menampilkan konfirmasi sebelum menghapus produk
7. THE Product Management SHALL menyediakan fitur search berdasarkan product name atau category
8. THE Product Management SHALL menyediakan fitur filter berdasarkan product type (BM Account, Personal Account, Verified BM, API)
9. THE Product Management SHALL menyediakan fitur filter berdasarkan stock status (available, out_of_stock)
10. WHEN admin berhasil create, update, atau delete produk, THE System SHALL mencatat aktivitas tersebut di audit log
11. THE Product Management SHALL menampilkan toast notification untuk setiap aksi yang berhasil atau gagal

### Requirement 8

**User Story:** Sebagai admin, saya ingin mengakses System Settings, sehingga saya dapat mengkonfigurasi pengaturan aplikasi

#### Acceptance Criteria

1. WHEN admin mengklik menu "Pengaturan Sistem", THE System SHALL menampilkan halaman System Settings dengan form konfigurasi
2. THE System Settings SHALL menampilkan pengaturan untuk: site name, maintenance mode, email notifications, payment methods
3. THE System Settings SHALL menyediakan toggle switch untuk enable/disable fitur tertentu
4. WHEN admin mengubah pengaturan, THE System SHALL menyimpan perubahan ke database
5. WHEN admin berhasil mengupdate settings, THE System SHALL menampilkan toast notification success
6. WHEN admin berhasil mengupdate settings, THE System SHALL mencatat aktivitas tersebut di audit log
7. THE System Settings SHALL menampilkan last updated timestamp untuk setiap setting

### Requirement 9

**User Story:** Sebagai admin, saya ingin melihat Audit Log, sehingga saya dapat tracking semua aktivitas admin untuk security dan compliance

#### Acceptance Criteria

1. WHEN admin mengklik menu "Log Aktivitas", THE System SHALL menampilkan halaman Audit Log dengan tabel semua aktivitas admin
2. THE Audit Log SHALL menampilkan kolom: ID, Admin User, Action, Entity Type, Entity ID, Changes, IP Address, Created At
3. THE Audit Log SHALL menyediakan fitur filter berdasarkan admin user
4. THE Audit Log SHALL menyediakan fitur filter berdasarkan action type (create, update, delete)
5. THE Audit Log SHALL menyediakan fitur filter berdasarkan entity type (user, transaction, claim, tutorial, settings)
6. THE Audit Log SHALL menyediakan fitur filter berdasarkan tanggal (date range)
7. THE Audit Log SHALL menampilkan detail changes dalam format JSON yang readable
8. THE Audit Log SHALL menyediakan pagination untuk menampilkan data dalam jumlah besar
9. THE Audit Log SHALL read-only dan tidak dapat diubah atau dihapus

### Requirement 10

**User Story:** Sebagai admin, saya ingin menu admin dilindungi dengan authorization, sehingga hanya user dengan role admin yang dapat mengakses fitur-fitur administrasi

#### Acceptance Criteria

1. THE System SHALL memvalidasi role user sebelum menampilkan menu admin di sidebar
2. WHEN user dengan role member atau guest mencoba mengakses URL admin, THE System SHALL redirect ke halaman unauthorized
3. THE Backend API SHALL memvalidasi JWT token dan role admin untuk setiap endpoint admin
4. IF token invalid atau expired, THEN THE System SHALL return error 401 Unauthorized
5. IF user tidak memiliki role admin, THEN THE System SHALL return error 403 Forbidden
6. THE System SHALL menggunakan middleware authorization untuk protect semua admin routes
7. THE System SHALL log semua unauthorized access attempts untuk security monitoring

### Requirement 11

**User Story:** Sebagai admin, saya ingin menu admin memiliki UI/UX yang konsisten dengan design sistem, sehingga pengalaman pengguna tetap seamless

#### Acceptance Criteria

1. THE Admin Menu SHALL menggunakan Tailwind CSS classes yang konsisten dengan design sistem
2. THE Admin Menu SHALL menggunakan Heroicons untuk icon yang sesuai dengan setiap menu
3. THE Admin Menu SHALL menampilkan active state ketika menu sedang dipilih
4. THE Admin Menu SHALL responsive dan dapat diakses di mobile device
5. THE Admin Menu SHALL menggunakan color scheme yang membedakan section admin dari section lain
6. THE Admin Pages SHALL menggunakan layout yang konsisten dengan halaman lain di aplikasi
7. THE Admin Pages SHALL menampilkan loading state ketika fetching data
8. THE Admin Pages SHALL menampilkan error state ketika terjadi error
9. THE Admin Pages SHALL menampilkan empty state ketika tidak ada data
