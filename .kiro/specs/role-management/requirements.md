# Requirements Document

## Introduction

Sistem Role Management adalah fitur untuk mengelola peran pengguna (member dan admin) dalam aplikasi. Sistem ini memungkinkan administrator untuk mengubah role pengguna langsung dari Supabase Dashboard atau melalui interface admin, dengan default role 'member' untuk setiap pengguna baru yang mendaftar.

## Glossary

- **Role Management System**: Sistem yang mengelola peran dan hak akses pengguna dalam aplikasi
- **User**: Pengguna aplikasi yang terdaftar melalui Supabase Auth
- **Member**: Peran default untuk pengguna biasa dengan akses terbatas
- **Admin**: Peran untuk administrator dengan akses penuh ke fitur management
- **User Profile Table**: Tabel database yang menyimpan informasi profil pengguna termasuk role
- **RLS Policy**: Row Level Security policy yang mengatur akses data berdasarkan role
- **Supabase Dashboard**: Interface web Supabase untuk mengelola database dan data
- **Admin Interface**: Halaman web dalam aplikasi untuk admin mengelola user roles

## Requirements

### Requirement 1

**User Story:** Sebagai sistem, saya ingin setiap pengguna baru memiliki role default 'member', sehingga pengguna baru memiliki akses dasar yang aman

#### Acceptance Criteria

1. WHEN User mendaftar melalui Supabase Auth, THE Role Management System SHALL membuat record di User Profile Table dengan role 'member'
2. THE Role Management System SHALL menyimpan role sebagai enum dengan nilai 'member' atau 'admin'
3. IF User Profile Table tidak memiliki record untuk User yang baru mendaftar, THEN THE Role Management System SHALL membuat record baru dengan role 'member' secara otomatis
4. THE Role Management System SHALL memastikan setiap User memiliki tepat satu role pada satu waktu

### Requirement 2

**User Story:** Sebagai admin, saya ingin mengubah role pengguna dari member menjadi admin atau sebaliknya melalui Supabase Dashboard, sehingga saya dapat mengelola hak akses dengan cepat

#### Acceptance Criteria

1. WHEN Admin membuka User Profile Table di Supabase Dashboard, THE Role Management System SHALL menampilkan kolom role yang dapat diedit
2. WHEN Admin mengubah nilai role di Supabase Dashboard, THE Role Management System SHALL memperbarui role User secara real-time
3. THE Role Management System SHALL memvalidasi bahwa nilai role hanya dapat berisi 'member' atau 'admin'
4. WHEN role User diubah, THE Role Management System SHALL mencatat timestamp perubahan di kolom updated_at

### Requirement 3

**User Story:** Sebagai admin, saya ingin mengubah role pengguna melalui interface admin di aplikasi, sehingga saya dapat mengelola user tanpa perlu akses ke Supabase Dashboard

#### Acceptance Criteria

1. WHEN Admin mengakses Admin Interface, THE Role Management System SHALL menampilkan daftar semua User dengan role mereka
2. WHEN Admin memilih User dan mengubah role, THE Role Management System SHALL memperbarui role di User Profile Table
3. THE Role Management System SHALL menampilkan konfirmasi sebelum mengubah role User
4. IF perubahan role berhasil, THEN THE Role Management System SHALL menampilkan notifikasi sukses kepada Admin
5. IF perubahan role gagal, THEN THE Role Management System SHALL menampilkan pesan error yang jelas kepada Admin

### Requirement 4

**User Story:** Sebagai sistem, saya ingin melindungi data role dengan RLS policies, sehingga hanya admin yang dapat mengubah role pengguna

#### Acceptance Criteria

1. THE Role Management System SHALL menerapkan RLS Policy yang memblokir User dengan role 'member' dari mengubah data role
2. THE Role Management System SHALL menerapkan RLS Policy yang mengizinkan User dengan role 'admin' untuk membaca dan mengubah semua data role
3. THE Role Management System SHALL menerapkan RLS Policy yang mengizinkan User membaca role mereka sendiri
4. WHEN User dengan role 'member' mencoba mengubah role, THE Role Management System SHALL menolak operasi dengan error authorization

### Requirement 5

**User Story:** Sebagai developer, saya ingin sistem mencatat perubahan role, sehingga ada audit trail untuk keperluan keamanan dan debugging

#### Acceptance Criteria

1. WHEN role User diubah, THE Role Management System SHALL mencatat user_id, role lama, role baru, dan timestamp di tabel audit log
2. THE Role Management System SHALL mencatat siapa yang melakukan perubahan role (admin_id)
3. WHEN Admin mengakses audit log, THE Role Management System SHALL menampilkan riwayat perubahan role dalam urutan kronologis
4. THE Role Management System SHALL menyimpan audit log minimal selama 90 hari

### Requirement 6

**User Story:** Sebagai sistem, saya ingin memastikan selalu ada minimal satu admin aktif, sehingga aplikasi tidak kehilangan akses administratif

#### Acceptance Criteria

1. IF hanya ada satu User dengan role 'admin', THEN THE Role Management System SHALL memblokir perubahan role admin tersebut menjadi 'member'
2. WHEN Admin mencoba mengubah role admin terakhir, THE Role Management System SHALL menampilkan pesan error yang menjelaskan bahwa minimal satu admin harus ada
3. THE Role Management System SHALL mengizinkan perubahan role dari 'admin' ke 'member' hanya jika ada minimal dua User dengan role 'admin'
