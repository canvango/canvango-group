# Requirements Document

## Introduction

Fitur ini akan meningkatkan halaman User Management di `/admin/users` dengan memisahkan tampilan user berdasarkan role mereka. Admin akan ditampilkan di tabel terpisah di bagian atas, sementara member dan guest akan ditampilkan di tabel terpisah di bagian bawah. Setiap tabel akan memiliki fungsi pengelolaan role yang independen untuk memudahkan administrator dalam mengelola user berdasarkan tingkat akses mereka.

Fitur ini melengkapi spec `role-management` yang sudah ada dengan menyediakan UI yang lebih terorganisir untuk mengelola role user. Spec ini fokus pada peningkatan UX/UI dari halaman User Management yang sudah ada di `src/features/member-area/pages/UserManagement.tsx`.

## Glossary

- **User Management System**: Sistem yang mengelola data user dan role mereka dalam aplikasi
- **Admin Table**: Tabel yang menampilkan daftar user dengan role 'admin'
- **Member Table**: Tabel yang menampilkan daftar user dengan role 'member' atau 'guest'
- **Role Selector**: Komponen dropdown untuk mengubah role user
- **Supabase Client**: Client untuk berinteraksi dengan database Supabase
- **User Profile Table**: Tabel database `users` di Supabase yang menyimpan informasi user termasuk role
- **RLS Policy**: Row Level Security policy yang sudah diterapkan di spec `role-management`

## Requirements

### Requirement 1

**User Story:** Sebagai administrator, saya ingin melihat daftar admin dan member dalam tabel yang terpisah, sehingga saya dapat dengan mudah membedakan dan mengelola user berdasarkan tingkat akses mereka.

#### Acceptance Criteria

1. WHEN halaman User Management dimuat, THE User Management System SHALL menampilkan dua tabel terpisah: satu untuk admin di bagian atas dan satu untuk member/guest di bagian bawah
2. THE User Management System SHALL mengambil semua data user dari database Supabase dan memfilter mereka berdasarkan role
3. THE Admin Table SHALL menampilkan hanya user dengan role 'admin'
4. THE Member Table SHALL menampilkan user dengan role 'member' atau 'guest'
5. WHEN tidak ada user dalam kategori tertentu, THE User Management System SHALL menampilkan pesan "Tidak ada data" pada tabel yang kosong

### Requirement 2

**User Story:** Sebagai administrator, saya ingin melihat statistik jumlah admin dan member secara terpisah, sehingga saya dapat memantau distribusi role dalam sistem.

#### Acceptance Criteria

1. THE User Management System SHALL menampilkan card statistik yang menunjukkan jumlah total admin
2. THE User Management System SHALL menampilkan card statistik yang menunjukkan jumlah total member (termasuk guest)
3. THE User Management System SHALL menampilkan card statistik yang menunjukkan jumlah total semua user
4. WHEN data user berubah, THE User Management System SHALL memperbarui statistik secara otomatis

### Requirement 3

**User Story:** Sebagai administrator, saya ingin mengubah role user dari tabel admin atau member, sehingga saya dapat mengelola akses user dengan mudah.

#### Acceptance Criteria

1. THE Role Selector SHALL tersedia di setiap baris pada kedua tabel (admin dan member)
2. WHEN administrator memilih role baru dari dropdown, THE User Management System SHALL memperbarui role user di User Profile Table
3. WHEN role user berubah dari 'admin' ke 'member' atau sebaliknya, THE User Management System SHALL memindahkan user ke tabel yang sesuai
4. THE User Management System SHALL menampilkan loading indicator pada dropdown saat proses update sedang berlangsung
5. WHEN update role berhasil, THE User Management System SHALL menampilkan notifikasi sukses
6. IF update role gagal, THEN THE User Management System SHALL menampilkan notifikasi error dan mempertahankan role sebelumnya
7. THE User Management System SHALL mematuhi RLS Policy yang sudah diterapkan (hanya admin yang dapat mengubah role)
8. IF hanya ada satu admin dan administrator mencoba mengubah role admin tersebut, THEN THE User Management System SHALL menampilkan error dan memblokir perubahan

### Requirement 4

**User Story:** Sebagai administrator, saya ingin melihat informasi detail user di setiap tabel, sehingga saya dapat membuat keputusan yang tepat dalam mengelola role mereka.

#### Acceptance Criteria

1. THE Admin Table SHALL menampilkan kolom: avatar/initial, nama lengkap, username, email, balance, role selector, dan tanggal registrasi
2. THE Member Table SHALL menampilkan kolom yang sama dengan Admin Table
3. THE User Management System SHALL menampilkan avatar dengan initial nama user jika foto profil tidak tersedia
4. THE User Management System SHALL memformat balance dalam format Rupiah (Rp)
5. THE User Management System SHALL memformat tanggal registrasi dalam format lokal Indonesia

### Requirement 5

**User Story:** Sebagai administrator, saya ingin dapat me-refresh data user kapan saja, sehingga saya selalu melihat informasi terbaru.

#### Acceptance Criteria

1. THE User Management System SHALL menyediakan tombol "Refresh" di header halaman
2. WHEN tombol refresh diklik, THE User Management System SHALL mengambil ulang semua data user dari database
3. THE User Management System SHALL menampilkan loading state pada tombol refresh saat proses berlangsung
4. WHEN refresh selesai, THE User Management System SHALL memperbarui kedua tabel dengan data terbaru

### Requirement 6

**User Story:** Sebagai sistem, saya ingin menggunakan komponen dan utilities yang sudah ada, sehingga implementasi konsisten dengan member area infrastructure.

#### Acceptance Criteria

1. THE User Management System SHALL menggunakan komponen Card dari shared components library
2. THE User Management System SHALL menggunakan komponen Button dari shared components library
3. THE User Management System SHALL menggunakan komponen SelectDropdown dari shared components library
4. THE User Management System SHALL menggunakan ToastContext untuk menampilkan notifikasi
5. THE User Management System SHALL menggunakan Supabase Client yang sudah dikonfigurasi
6. THE User Management System SHALL mengikuti pattern dan struktur yang sama dengan halaman member area lainnya
7. THE User Management System SHALL menggunakan utility functions untuk formatting (formatCurrency, formatDate) jika diperlukan
