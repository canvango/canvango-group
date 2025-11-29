# Email ke Tripay Support - Request IP Whitelist untuk Serverless Architecture

---

## 📧 VERSI 1: Request Whitelist IP Range (Formal)

**Subject:** Request Whitelist IP Range untuk Serverless Architecture - Merchant T47159

**Kepada Tim Support Tripay,**

Saya adalah merchant dengan kode **T47159** (canvango.com) yang menggunakan Tripay Payment Gateway untuk sistem top-up saldo di aplikasi kami.

Aplikasi kami menggunakan **serverless architecture** dengan stack berikut:
- **Frontend:** Vercel (Static Hosting)
- **Backend:** Supabase Edge Functions (Serverless)
- **Infrastructure:** Cloudflare CDN

Kami mengalami kendala dengan fitur **IP Whitelist** karena serverless architecture menggunakan **IP dinamis** yang dapat berubah sewaktu-waktu. Saat ini kami mendapat error:

```
Unauthorized IP (2406:da18:dcc:9c01:baff:28cf:fe61:5343). 
Please add this IP to your merchant Whitelist IP (T47159)
```

**Request kami:**

Mohon bantuan untuk salah satu solusi berikut:

1. **Whitelist IP Range Supabase/Cloudflare:**
   - `104.18.0.0/16` (Cloudflare)
   - `172.64.0.0/16` (Cloudflare)
   - `2406:da18::/32` (IPv6 range)

2. **Atau disable IP Whitelist untuk merchant kami** (T47159), karena:
   - Kami sudah menggunakan security lain (API Key, Private Key, Signature validation)
   - Serverless architecture adalah best practice modern yang banyak digunakan
   - IP Whitelist tidak kompatibel dengan serverless yang IP-nya dinamis

**Informasi Merchant:**
- Merchant Code: T47159
- Domain: canvango.com
- Email: [email Anda]
- Phone: [nomor Anda]

Kami sangat mengharapkan bantuan dari tim Tripay untuk menyelesaikan kendala ini agar integrasi payment gateway dapat berjalan dengan lancar.

Terima kasih atas perhatian dan bantuannya.

Hormat kami,  
[Nama Anda]  
Canvango Group

---

## 📧 VERSI 2: Request Disable IP Whitelist (Lebih Singkat)

**Subject:** Request Disable IP Whitelist - Merchant T47159 (Serverless Architecture)

**Halo Tim Tripay,**

Saya merchant T47159 (canvango.com) yang menggunakan serverless architecture (Vercel + Supabase).

Kami mengalami kendala dengan IP Whitelist karena serverless menggunakan IP dinamis yang berubah-ubah. Error yang muncul:

```
Unauthorized IP (2406:da18:dcc:9c01:baff:28cf:fe61:5343)
```

**Mohon bantuan untuk disable IP Whitelist** untuk merchant kami, karena:
- Serverless architecture tidak memiliki static IP
- Kami sudah menggunakan API Key, Private Key, dan Signature untuk security
- Banyak merchant modern menggunakan serverless (AWS Lambda, Vercel, Supabase, dll)

Atau jika tidak bisa disable, mohon whitelist IP range Cloudflare:
```
104.18.0.0/16,172.64.0.0/16,2406:da18::/32
```

**Info Merchant:**
- Code: T47159
- Domain: canvango.com
- Email: [email Anda]

Terima kasih!

Best regards,  
[Nama Anda]

---

## 📧 VERSI 3: Request Whitelist Spesifik (Paling Singkat)

**Subject:** Whitelist IP Request - T47159

**Hi Tripay Support,**

Merchant Code: **T47159**  
Domain: **canvango.com**

Mohon whitelist IP berikut untuk merchant kami:

```
2406:da18:dcc:9c01:baff:28cf:fe61:5343
104.18.38.10
172.64.149.246
```

Kami menggunakan Supabase Edge Functions yang IP-nya dari range Cloudflare.

Jika memungkinkan, mohon whitelist IP range:
```
104.18.0.0/16,172.64.0.0/16,2406:da18::/32
```

Atau disable IP Whitelist untuk merchant kami karena menggunakan serverless architecture.

Thanks!  
[Nama Anda]

---

## 📞 KONTAK TRIPAY SUPPORT:

- **Email:** support@tripay.co.id
- **WhatsApp:** 0812-8080-8086
- **Live Chat:** https://tripay.co.id (pojok kanan bawah)
- **Ticket System:** Login ke dashboard → Support → Create Ticket

---

## 💡 TIPS SAAT MENGHUBUNGI SUPPORT:

1. ✅ Sebutkan Merchant Code (T47159) di awal
2. ✅ Jelaskan Anda menggunakan serverless architecture
3. ✅ Tunjukkan error message yang muncul
4. ✅ Berikan alternatif solusi (whitelist range atau disable)
5. ✅ Bersikap sopan dan profesional
6. ✅ Follow up jika tidak ada respon dalam 1-2 hari kerja

---

## 🎯 EXPECTED RESPONSE:

Kemungkinan jawaban dari Tripay:

**Scenario 1:** Mereka whitelist IP range yang Anda minta ✅

**Scenario 2:** Mereka disable IP Whitelist untuk merchant Anda ✅

**Scenario 3:** Mereka minta Anda menggunakan VPS dengan static IP ⚠️
- Jika ini terjadi, gunakan solusi VPS ($4/bulan) yang sudah saya siapkan

**Scenario 4:** Mereka bilang tidak bisa ❌
- Solusi: Deploy proxy di VPS/Railway dengan static IP

---

Pilih versi email yang sesuai dengan style komunikasi Anda, lalu kirim ke support@tripay.co.id atau via WhatsApp/Live Chat!
