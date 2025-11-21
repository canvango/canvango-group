# Requirements Document

## Introduction

Canvango Group adalah aplikasi web yang menyediakan layanan digital marketing dan verifikasi akun bisnis. Sistem ini memiliki tiga tipe pengguna: Guest (pengunjung yang belum login), Member (pengguna yang sudah terdaftar dan login), dan Admin (pengelola sistem). Aplikasi ini menampilkan dashboard, informasi layanan, riwayat transaksi, fitur top-up untuk member, serta panel administrasi lengkap untuk admin.

## Glossary

- **System**: Aplikasi web Canvango Group
- **Guest**: Pengguna yang mengakses aplikasi tanpa melakukan login
- **Member**: Pengguna yang telah terdaftar dan melakukan login ke aplikasi
- **Admin**: Pengguna dengan hak akses penuh untuk mengelola sistem
- **Dashboard**: Halaman utama yang menampilkan informasi umum dan update terbaru
- **Sidebar**: Menu navigasi vertikal di sisi kiri aplikasi
- **Authentication**: Proses verifikasi identitas pengguna melalui login
- **Authorization**: Proses penentuan hak akses pengguna terhadap fitur tertentu
- **Transaction History**: Daftar transaksi yang telah dilakukan oleh Member
- **Top Up**: Fitur untuk menambah saldo atau kredit Member

## Requirements

### Requirement 1: Autentikasi Pengguna

**User Story:** Sebagai pengunjung, saya ingin dapat mendaftar dan login ke sistem, sehingga saya dapat mengakses fitur-fitur member.

#### Acceptance Criteria

1. THE System SHALL menyediakan halaman registrasi dengan form pendaftaran pengguna baru
2. THE System SHALL menyediakan halaman login dengan form autentikasi pengguna
3. WHEN pengguna mengakses aplikasi tanpa login, THE System SHALL menampilkan status pengguna sebagai Guest
4. WHEN pengguna berhasil login, THE System SHALL menampilkan nama pengguna di header
5. WHEN pengguna berhasil login, THE System SHALL menyimpan session pengguna untuk akses berkelanjutan

### Requirement 2: Otorisasi Akses Menu

**User Story:** Sebagai sistem, saya ingin mengatur akses menu berdasarkan status pengguna, sehingga Guest dan Member memiliki akses yang sesuai dengan hak mereka.

#### Acceptance Criteria

1. THE System SHALL menampilkan menu Dashboard untuk Guest dan Member
2. THE System SHALL menampilkan menu Akun BM untuk Guest dan Member
3. THE System SHALL menampilkan menu Akun Personal untuk Guest dan Member
4. THE System SHALL menampilkan menu Jasa Verified BM untuk Guest dan Member
5. THE System SHALL menampilkan menu API untuk Guest dan Member
6. THE System SHALL menyembunyikan menu Riwayat Transaksi dari Guest
7. THE System SHALL menyembunyikan menu Top Up dari Guest
8. THE System SHALL menyembunyikan menu Claim Garansi dari Guest
9. THE System SHALL menyembunyikan menu Tutorial dari Guest
10. WHEN pengguna berstatus Member, THE System SHALL menampilkan semua menu di sidebar

### Requirement 3: Proteksi Halaman Restricted

**User Story:** Sebagai sistem, saya ingin melindungi halaman yang hanya untuk Member, sehingga Guest tidak dapat mengakses konten yang tidak sesuai dengan hak akses mereka.

#### Acceptance Criteria

1. WHEN Guest mencoba mengakses halaman Riwayat Transaksi, THE System SHALL redirect pengguna ke halaman login
2. WHEN Guest mencoba mengakses halaman Top Up, THE System SHALL redirect pengguna ke halaman login
3. WHEN Guest mencoba mengakses halaman Claim Garansi, THE System SHALL redirect pengguna ke halaman login
4. WHEN Guest mencoba mengakses halaman Tutorial, THE System SHALL redirect pengguna ke halaman login
5. WHEN Member mengakses halaman restricted, THE System SHALL menampilkan konten halaman tersebut

### Requirement 4: Tampilan Header

**User Story:** Sebagai pengguna, saya ingin melihat header yang sesuai dengan status login saya, sehingga saya dapat dengan mudah melakukan login atau melihat identitas saya.

#### Acceptance Criteria

1. WHEN pengguna berstatus Guest, THE System SHALL menampilkan tombol Login di header
2. WHEN pengguna berstatus Guest, THE System SHALL menampilkan tombol Daftar di header
3. WHEN pengguna berstatus Member, THE System SHALL menampilkan nama pengguna di header
4. WHEN pengguna berstatus Member, THE System SHALL menyembunyikan tombol Login dan Daftar dari header

### Requirement 5: Sidebar Navigation

**User Story:** Sebagai pengguna, saya ingin melihat menu navigasi di sidebar, sehingga saya dapat dengan mudah berpindah antar halaman.

#### Acceptance Criteria

1. THE System SHALL menampilkan sidebar di sisi kiri aplikasi untuk semua pengguna
2. THE System SHALL mengelompokkan menu sidebar ke dalam section Menu Utama
3. THE System SHALL mengelompokkan menu sidebar ke dalam section Akun dan Layanan
4. THE System SHALL mengelompokkan menu sidebar ke dalam section Lainnya
5. WHEN pengguna mengklik menu di sidebar, THE System SHALL menavigasi pengguna ke halaman yang sesuai

### Requirement 6: Dashboard

**User Story:** Sebagai pengguna, saya ingin melihat dashboard dengan informasi penting, sehingga saya dapat mengetahui update terbaru dan informasi layanan.

#### Acceptance Criteria

1. THE System SHALL menampilkan welcome message di dashboard
2. THE System SHALL menampilkan section Perhatian dengan informasi peringatan resmi
3. THE System SHALL menampilkan section Customer Support dan Security dengan informasi kontak
4. THE System SHALL menampilkan section Update Terbaru
5. WHEN pengguna berstatus Member, THE System SHALL menampilkan nama Member di welcome message
6. WHEN pengguna berstatus Guest, THE System SHALL menampilkan teks Guest di welcome message

### Requirement 7: Riwayat Transaksi

**User Story:** Sebagai Member, saya ingin melihat riwayat transaksi saya, sehingga saya dapat melacak pembelian dan status transaksi saya.

#### Acceptance Criteria

1. WHEN Member mengakses halaman Riwayat Transaksi, THE System SHALL menampilkan tabel transaksi Member
2. THE System SHALL menampilkan kolom User di tabel transaksi
3. THE System SHALL menampilkan kolom Tanggal di tabel transaksi
4. THE System SHALL menampilkan kolom Produk di tabel transaksi
5. THE System SHALL menampilkan kolom Jumlah di tabel transaksi
6. THE System SHALL menampilkan kolom Total di tabel transaksi
7. THE System SHALL menampilkan kolom Status di tabel transaksi
8. THE System SHALL menampilkan transaksi yang dimiliki oleh Member yang sedang login

### Requirement 8: Top Up

**User Story:** Sebagai Member, saya ingin dapat melakukan top up saldo, sehingga saya dapat membeli layanan yang tersedia.

#### Acceptance Criteria

1. WHEN Member mengakses halaman Top Up, THE System SHALL menampilkan form top up
2. THE System SHALL memungkinkan Member untuk memilih nominal top up
3. THE System SHALL memungkinkan Member untuk memilih metode pembayaran
4. WHEN Member submit form top up, THE System SHALL memproses permintaan top up
5. WHEN top up berhasil, THE System SHALL menampilkan notifikasi sukses kepada Member

### Requirement 9: Claim Garansi

**User Story:** Sebagai Member, saya ingin dapat mengajukan claim garansi, sehingga saya dapat mendapatkan penggantian atau perbaikan layanan yang bermasalah.

#### Acceptance Criteria

1. WHEN Member mengakses halaman Claim Garansi, THE System SHALL menampilkan form claim garansi
2. THE System SHALL memungkinkan Member untuk memilih transaksi yang ingin di-claim
3. THE System SHALL memungkinkan Member untuk menjelaskan masalah yang dialami
4. WHEN Member submit form claim, THE System SHALL memproses permintaan claim garansi
5. WHEN claim berhasil diajukan, THE System SHALL menampilkan notifikasi sukses kepada Member

### Requirement 10: Tutorial

**User Story:** Sebagai Member, saya ingin dapat mengakses tutorial, sehingga saya dapat memahami cara menggunakan layanan yang tersedia.

#### Acceptance Criteria

1. WHEN Member mengakses halaman Tutorial, THE System SHALL menampilkan daftar tutorial
2. THE System SHALL menampilkan judul tutorial
3. THE System SHALL menampilkan deskripsi singkat tutorial
4. WHEN Member mengklik tutorial, THE System SHALL menampilkan konten tutorial lengkap
5. THE System SHALL memungkinkan Member untuk mencari tutorial berdasarkan kata kunci

### Requirement 11: Logout

**User Story:** Sebagai Member, saya ingin dapat logout dari sistem, sehingga saya dapat mengakhiri session saya dengan aman.

#### Acceptance Criteria

1. THE System SHALL menampilkan tombol atau link Logout untuk Member
2. WHEN Member mengklik Logout, THE System SHALL menghapus session pengguna
3. WHEN Member berhasil logout, THE System SHALL redirect pengguna ke halaman publik
4. WHEN Member berhasil logout, THE System SHALL mengubah status pengguna menjadi Guest

### Requirement 12: Admin User Management

**User Story:** Sebagai Admin, saya ingin dapat mengelola pengguna, sehingga saya dapat mengatur akses dan data pengguna dalam sistem.

#### Acceptance Criteria

1. WHEN Admin mengakses halaman User Management, THE System SHALL menampilkan daftar semua pengguna
2. THE System SHALL memungkinkan Admin untuk mencari pengguna berdasarkan nama atau email
3. THE System SHALL memungkinkan Admin untuk memfilter pengguna berdasarkan role
4. THE System SHALL memungkinkan Admin untuk melihat detail pengguna
5. THE System SHALL memungkinkan Admin untuk mengubah role pengguna
6. THE System SHALL memungkinkan Admin untuk mengubah balance pengguna
7. THE System SHALL memungkinkan Admin untuk menonaktifkan akun pengguna
8. THE System SHALL memungkinkan Admin untuk menghapus pengguna dari sistem

### Requirement 13: Admin Transaction Management

**User Story:** Sebagai Admin, saya ingin dapat mengelola transaksi, sehingga saya dapat memantau dan mengatur transaksi dalam sistem.

#### Acceptance Criteria

1. WHEN Admin mengakses halaman Transaction Management, THE System SHALL menampilkan daftar semua transaksi
2. THE System SHALL memungkinkan Admin untuk memfilter transaksi berdasarkan status
3. THE System SHALL memungkinkan Admin untuk memfilter transaksi berdasarkan tanggal
4. THE System SHALL memungkinkan Admin untuk melihat detail transaksi
5. THE System SHALL memungkinkan Admin untuk mengubah status transaksi
6. THE System SHALL memungkinkan Admin untuk melakukan refund transaksi
7. THE System SHALL memungkinkan Admin untuk mengekspor laporan transaksi

### Requirement 14: Admin Claim Management

**User Story:** Sebagai Admin, saya ingin dapat mengelola claim garansi, sehingga saya dapat meninjau dan memproses permintaan claim dari member.

#### Acceptance Criteria

1. WHEN Admin mengakses halaman Claim Management, THE System SHALL menampilkan daftar semua claim
2. THE System SHALL memungkinkan Admin untuk memfilter claim berdasarkan status
3. THE System SHALL memungkinkan Admin untuk melihat detail claim dan transaksi terkait
4. THE System SHALL memungkinkan Admin untuk menyetujui claim
5. THE System SHALL memungkinkan Admin untuk menolak claim
6. THE System SHALL memungkinkan Admin untuk menambahkan catatan response pada claim
7. WHEN Admin menyetujui claim, THE System SHALL memproses refund otomatis ke balance member

### Requirement 15: Admin Tutorial Management

**User Story:** Sebagai Admin, saya ingin dapat mengelola tutorial, sehingga saya dapat menyediakan panduan yang up-to-date untuk member.

#### Acceptance Criteria

1. WHEN Admin mengakses halaman Tutorial Management, THE System SHALL menampilkan daftar semua tutorial
2. THE System SHALL memungkinkan Admin untuk membuat tutorial baru
3. THE System SHALL memungkinkan Admin untuk mengedit tutorial yang ada
4. THE System SHALL memungkinkan Admin untuk menghapus tutorial
5. THE System SHALL memungkinkan Admin untuk mengatur kategori tutorial
6. THE System SHALL menampilkan statistik views untuk setiap tutorial

### Requirement 16: Admin Dashboard dan Statistics

**User Story:** Sebagai Admin, saya ingin melihat dashboard dengan statistik sistem, sehingga saya dapat memantau performa dan aktivitas aplikasi.

#### Acceptance Criteria

1. WHEN Admin mengakses Admin Dashboard, THE System SHALL menampilkan total jumlah pengguna
2. THE System SHALL menampilkan total jumlah transaksi berdasarkan status
3. THE System SHALL menampilkan total revenue
4. THE System SHALL menampilkan jumlah pending claims
5. THE System SHALL menampilkan grafik transaksi per periode waktu
6. THE System SHALL menampilkan grafik pertumbuhan pengguna
7. THE System SHALL menampilkan daftar transaksi terbaru

### Requirement 17: Admin Access Control

**User Story:** Sebagai sistem, saya ingin membatasi akses admin panel hanya untuk pengguna dengan role Admin, sehingga keamanan sistem terjaga.

#### Acceptance Criteria

1. THE System SHALL menyembunyikan menu Admin dari Guest dan Member
2. WHEN Guest atau Member mencoba mengakses halaman admin, THE System SHALL redirect ke halaman unauthorized
3. WHEN Admin login, THE System SHALL menampilkan menu Admin di sidebar
4. THE System SHALL mencatat semua aktivitas Admin dalam audit log
5. THE System SHALL menampilkan informasi IP address dan timestamp pada audit log

### Requirement 18: Admin System Settings

**User Story:** Sebagai Admin, saya ingin dapat mengatur konfigurasi sistem, sehingga saya dapat menyesuaikan pengaturan aplikasi sesuai kebutuhan.

#### Acceptance Criteria

1. WHEN Admin mengakses halaman System Settings, THE System SHALL menampilkan form konfigurasi
2. THE System SHALL memungkinkan Admin untuk mengatur metode pembayaran yang tersedia
3. THE System SHALL memungkinkan Admin untuk mengatur notifikasi sistem
4. THE System SHALL memungkinkan Admin untuk melihat system logs
5. WHEN Admin mengubah settings, THE System SHALL menyimpan perubahan dan menampilkan notifikasi sukses

### Requirement 19: Password Recovery

**User Story:** Sebagai pengguna yang lupa password, saya ingin dapat mereset password saya, sehingga saya dapat kembali mengakses akun saya.

#### Acceptance Criteria

1. THE System SHALL menyediakan halaman Forgot Password yang dapat diakses oleh Guest
2. WHEN pengguna mengakses halaman Forgot Password, THE System SHALL menampilkan form untuk memasukkan email
3. WHEN pengguna submit email di halaman Forgot Password, THE System SHALL mengirim email berisi link reset password
4. THE System SHALL menghasilkan token reset password yang unik dan memiliki masa berlaku 1 jam
5. WHEN pengguna mengklik link reset password di email, THE System SHALL redirect ke halaman Reset Password
6. THE System SHALL memvalidasi token reset password sebelum menampilkan form reset password
7. WHEN token tidak valid atau expired, THE System SHALL menampilkan pesan error dan redirect ke halaman Forgot Password
8. THE System SHALL menampilkan form untuk memasukkan password baru di halaman Reset Password
9. THE System SHALL memvalidasi password baru dengan minimal 8 karakter, mengandung huruf besar, huruf kecil, dan angka
10. WHEN pengguna submit password baru, THE System SHALL mengupdate password dan menampilkan notifikasi sukses
11. WHEN password berhasil direset, THE System SHALL redirect pengguna ke halaman Login
