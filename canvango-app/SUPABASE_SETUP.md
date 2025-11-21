# Supabase Setup Guide

## Overview

Aplikasi Canvango Group menggunakan Supabase Auth untuk fitur Forgot Password dan Reset Password. Fitur ini memungkinkan pengguna untuk mereset password mereka melalui email.

## Prerequisites

1. Akun Supabase (gratis di [supabase.com](https://supabase.com))
2. Project Supabase yang sudah dibuat

## Setup Steps

### 1. Buat Project di Supabase

1. Login ke [Supabase Dashboard](https://app.supabase.com)
2. Klik "New Project"
3. Isi detail project:
   - Name: `canvango-group` (atau nama lain)
   - Database Password: (simpan password ini dengan aman)
   - Region: Pilih region terdekat
4. Tunggu project selesai dibuat (~2 menit)

### 2. Dapatkan API Credentials

1. Di Supabase Dashboard, buka project Anda
2. Klik "Settings" di sidebar kiri
3. Klik "API" di menu settings
4. Copy credentials berikut:
   - **Project URL** (contoh: `https://xxxxx.supabase.co`)
   - **anon/public key** (key yang panjang dimulai dengan `eyJ...`)

### 3. Konfigurasi Environment Variables

#### Frontend (.env di folder `canvango-app/frontend/`)

Buat atau update file `.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**PENTING:** Ganti nilai di atas dengan credentials dari Supabase Dashboard Anda.

### 4. Konfigurasi Email Templates (Opsional)

Secara default, Supabase akan mengirim email reset password dengan template bawaan. Untuk customize:

1. Di Supabase Dashboard, buka "Authentication" > "Email Templates"
2. Pilih "Reset Password"
3. Customize template sesuai kebutuhan
4. Pastikan link redirect mengarah ke: `{{ .SiteURL }}/reset-password`

### 5. Konfigurasi Site URL

1. Di Supabase Dashboard, buka "Authentication" > "URL Configuration"
2. Set **Site URL** ke URL aplikasi Anda:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`
3. Tambahkan **Redirect URLs**:
   - `http://localhost:5173/reset-password` (development)
   - `https://yourdomain.com/reset-password` (production)

## Testing

### Test Forgot Password Flow

1. Jalankan aplikasi frontend: `npm run dev`
2. Buka browser ke `http://localhost:5173/login`
3. Klik "Forgot your password?"
4. Masukkan email yang terdaftar
5. Cek inbox email Anda
6. Klik link reset password di email
7. Masukkan password baru
8. Login dengan password baru

### Troubleshooting

#### Email tidak terkirim

- Pastikan email sudah terdaftar di sistem
- Cek spam folder
- Verifikasi SMTP settings di Supabase (Settings > Auth > SMTP Settings)
- Untuk development, Supabase menggunakan email service bawaan yang mungkin lambat

#### "Invalid or expired reset link"

- Token reset password berlaku 1 jam
- Request reset password baru jika token expired
- Pastikan Site URL dan Redirect URLs sudah dikonfigurasi dengan benar

#### Supabase credentials not found

- Pastikan file `.env` ada di folder `canvango-app/frontend/`
- Pastikan nama variable benar: `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`
- Restart development server setelah update `.env`

## Security Notes

1. **Anon Key adalah PUBLIC**: Anon key aman untuk digunakan di frontend karena Row Level Security (RLS) melindungi data
2. **Jangan commit .env**: Pastikan `.env` ada di `.gitignore`
3. **Gunakan Service Role Key dengan hati-hati**: Service role key memiliki akses penuh, jangan pernah expose di frontend

## Production Deployment

Untuk production, set environment variables di hosting platform Anda:

- **Vercel**: Settings > Environment Variables
- **Netlify**: Site settings > Build & deploy > Environment
- **Railway**: Variables tab

Pastikan juga update Site URL dan Redirect URLs di Supabase Dashboard untuk production domain.

## Alternative: Custom Backend Implementation

Jika Anda ingin menggunakan custom backend implementation (tanpa Supabase):

1. Hapus dependency `@supabase/supabase-js` dari `package.json`
2. Hapus file `canvango-app/frontend/src/utils/supabase.ts`
3. Implementasi backend endpoints:
   - `POST /api/auth/forgot-password` - kirim email reset
   - `POST /api/auth/reset-password` - update password
4. Update `ForgotPassword.tsx` dan `ResetPassword.tsx` untuk call API backend
5. Setup email service (Nodemailer, SendGrid, dll) di backend

Lihat `AUTHENTICATION.md` untuk detail implementasi custom backend.
