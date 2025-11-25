# Requirements Document

## Introduction

Sistem autentikasi saat ini menggunakan JWT token custom yang menyimpan role user. Ketika admin mengubah role user di database (misalnya dari member ke admin), user tidak bisa login karena JWT token lama masih menyimpan role lama, menyebabkan konflik autentikasi. Solusinya adalah migrasi ke sistem autentikasi native Supabase yang lebih sederhana dan reliable, di mana role selalu diambil langsung dari database saat runtime, bukan disimpan di JWT token.

## Glossary

- **Supabase Auth**: Sistem autentikasi bawaan Supabase yang mengelola user sessions dan JWT tokens
- **JWT Token**: JSON Web Token yang digunakan untuk autentikasi, berisi user ID dan metadata
- **RLS (Row Level Security)**: Sistem keamanan database Supabase yang membatasi akses data berdasarkan user
- **Auth Context**: React Context yang mengelola state autentikasi di frontend
- **Session**: Sesi login user yang disimpan oleh Supabase Auth
- **Role**: Peran user dalam sistem (member, admin, guest)
- **Custom JWT Claims**: Data tambahan yang disimpan dalam JWT token (akan dihapus)

## Requirements

### Requirement 1

**User Story:** Sebagai admin, saya ingin mengubah role user di database dan user tersebut langsung mendapatkan akses sesuai role baru tanpa harus logout-login manual, sehingga manajemen user lebih efisien.

#### Acceptance Criteria

1. WHEN admin mengubah role user di tabel users, THE System SHALL mengambil role terbaru dari database pada request berikutnya tanpa memerlukan logout manual
2. WHEN user melakukan request ke backend, THE System SHALL membaca role dari tabel users berdasarkan auth.uid() bukan dari JWT token
3. WHEN role user berubah, THE System SHALL memperbarui state frontend secara otomatis dalam waktu maksimal 5 detik
4. WHERE user sedang login, THE System SHALL tetap dapat mengakses aplikasi tanpa error setelah role berubah

### Requirement 2

**User Story:** Sebagai developer, saya ingin menghapus custom JWT hook dan logic yang kompleks, sehingga sistem autentikasi lebih mudah di-maintain dan tidak rentan error.

#### Acceptance Criteria

1. THE System SHALL menggunakan Supabase Auth native tanpa custom JWT claims untuk role
2. THE System SHALL menghapus semua function dan trigger yang memodifikasi JWT token
3. THE System SHALL menggunakan supabase.auth.signInWithPassword untuk login tanpa custom logic
4. THE System SHALL menyimpan hanya access_token dan refresh_token dari Supabase, tidak menyimpan role di localStorage
5. WHERE RLS policy memerlukan role check, THE System SHALL menggunakan JOIN ke tabel users untuk mendapatkan role real-time

### Requirement 3

**User Story:** Sebagai user, saya ingin proses login tetap cepat dan sederhana dengan username/email dan password, sehingga pengalaman login tidak berubah.

#### Acceptance Criteria

1. THE System SHALL menerima username atau email sebagai identifier login
2. WHEN user memasukkan username, THE System SHALL mengkonversi username ke email sebelum memanggil Supabase Auth
3. THE System SHALL menampilkan loading state maksimal 3 detik untuk proses login normal
4. IF login gagal, THEN THE System SHALL menampilkan error message yang jelas dan spesifik
5. THE System SHALL menyimpan session di Supabase Auth dengan expiry time default (1 jam)

### Requirement 4

**User Story:** Sebagai developer, saya ingin RLS policies tetap aman dan efisien setelah migrasi, sehingga data user tetap terlindungi dengan baik.

#### Acceptance Criteria

1. THE System SHALL memperbarui semua RLS policies untuk menggunakan JOIN ke tabel users alih-alih membaca JWT claims
2. WHERE policy memerlukan role check, THE System SHALL menggunakan pattern `(SELECT role FROM users WHERE id = auth.uid())`
3. THE System SHALL memastikan tidak ada policy yang masih menggunakan `auth.jwt() ->> 'user_role'`
4. THE System SHALL menambahkan index pada kolom users.id untuk optimasi query RLS
5. THE System SHALL memvalidasi bahwa performa query tidak menurun lebih dari 10% setelah migrasi

### Requirement 5

**User Story:** Sebagai user, saya ingin frontend secara otomatis mendeteksi perubahan role dan memperbarui UI tanpa refresh manual, sehingga pengalaman pengguna lebih seamless.

#### Acceptance Criteria

1. THE System SHALL mengimplementasikan polling atau realtime subscription untuk mendeteksi perubahan role
2. WHEN role user berubah di database, THE System SHALL memperbarui AuthContext state dalam waktu maksimal 5 detik
3. THE System SHALL redirect user ke halaman yang sesuai dengan role baru secara otomatis
4. THE System SHALL menampilkan notifikasi kepada user bahwa role mereka telah berubah
5. WHERE user berada di halaman yang tidak sesuai dengan role baru, THE System SHALL redirect ke halaman default role tersebut

### Requirement 6

**User Story:** Sebagai developer, saya ingin proses migrasi dapat dilakukan tanpa downtime dan dengan rollback plan yang jelas, sehingga risiko production issue minimal.

#### Acceptance Criteria

1. THE System SHALL menyediakan migration script yang dapat dijalankan secara incremental
2. THE System SHALL memiliki rollback script untuk setiap migration step
3. THE System SHALL memvalidasi data integrity sebelum dan sesudah migrasi
4. THE System SHALL menyediakan dokumentasi lengkap untuk proses migrasi
5. WHERE migrasi gagal, THE System SHALL dapat di-rollback ke state sebelumnya tanpa data loss

### Requirement 7

**User Story:** Sebagai admin, saya ingin tetap dapat mengelola user dan role melalui admin dashboard tanpa perubahan UI yang signifikan, sehingga workflow tidak terganggu.

#### Acceptance Criteria

1. THE System SHALL mempertahankan semua fitur admin dashboard yang ada (user management, role change)
2. WHEN admin mengubah role user, THE System SHALL menampilkan konfirmasi bahwa perubahan berhasil
3. THE System SHALL menampilkan status real-time apakah user sedang online setelah role berubah
4. THE System SHALL menyediakan audit log untuk semua perubahan role
5. WHERE admin mengubah role multiple users sekaligus, THE System SHALL memproses perubahan secara batch dengan feedback progress
