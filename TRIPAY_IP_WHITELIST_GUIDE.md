# 📋 Tripay IP Whitelist Guide - Cloudflare Worker

## ⚠️ Penting: Gunakan IP Ranges Cloudflare

Karena kamu menggunakan **Cloudflare Worker** sebagai proxy, semua request ke Tripay API akan datang dari **IP Cloudflare**, bukan dari VPS atau hosting kamu.

---

## 🌐 Cloudflare IP Ranges (IPv4)

Copy semua IP ranges ini ke Tripay dashboard:

```
173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22
```

**Total:** 15 IP ranges

---

## 📝 Cara Mengisi di Tripay Dashboard

### Format 1: Pisahkan dengan Enter (Recommended)
```
173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22
```

### Format 2: Pisahkan dengan Koma
```
173.245.48.0/20,103.21.244.0/22,103.22.200.0/22,103.31.4.0/22,141.101.64.0/18,108.162.192.0/18,190.93.240.0/20,188.114.96.0/20,197.234.240.0/22,198.41.128.0/17,162.158.0.0/15,104.16.0.0/13,104.24.0.0/14,172.64.0.0/13,131.0.72.0/22
```

---

## 📧 Request Whitelist ke Tripay Support

### Email Template

**To:** support@tripay.co.id  
**Subject:** Request IP Whitelist untuk Production API

**Isi Email:**
```
Halo Tim Tripay,

Saya ingin request IP whitelist untuk menggunakan production API.

Detail Merchant:
- Merchant Code: [ISI_MERCHANT_CODE_KAMU]
- Website: https://canvango-group.vercel.app
- Callback URL: https://canvango.com/api/tripay-callback

Saya menggunakan Cloudflare Worker sebagai proxy untuk keamanan dan performa.
Mohon whitelist IP ranges Cloudflare berikut:

173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22

Referensi IP ranges: https://www.cloudflare.com/ips/

Terima kasih atas bantuannya.

Salam,
[NAMA_KAMU]
```

---

## 🔍 Verifikasi IP

### Tool 1: Check Worker IP (Browser)
Buka file: `check-worker-ip.html`

### Tool 2: Cloudflare API
```bash
# Get Cloudflare IPv4 ranges
curl https://www.cloudflare.com/ips-v4

# Get Cloudflare IPv6 ranges
curl https://www.cloudflare.com/ips-v6
```

### Tool 3: Test dari Worker
Tambahkan endpoint test di worker untuk melihat IP yang digunakan:

```typescript
// Test endpoint di cloudflare-worker/src/index.ts
if (url.pathname === '/test-ip') {
  const testResponse = await fetch('https://api.ipify.org?format=json');
  const ipData = await testResponse.json();
  
  return new Response(JSON.stringify({
    worker_ip: ipData.ip,
    cf_ray: request.headers.get('cf-ray'),
    cf_connecting_ip: request.headers.get('cf-connecting-ip')
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

---

## ❓ FAQ

### Q: Kenapa tidak pakai IP VPS/Hosting?
**A:** Karena kamu menggunakan Cloudflare Worker, bukan VPS. Worker berjalan di edge network Cloudflare, jadi IP-nya adalah IP Cloudflare.

### Q: Apakah IP Cloudflare bisa berubah?
**A:** IP ranges Cloudflare jarang berubah, tapi bisa bertambah. Cloudflare akan announce jika ada perubahan. Cek: https://www.cloudflare.com/ips/

### Q: Apakah harus whitelist semua IP ranges?
**A:** Ya, karena Cloudflare bisa menggunakan IP mana saja dari ranges tersebut untuk request kamu.

### Q: Bagaimana jika Tripay tidak mau whitelist banyak IP?
**A:** Jelaskan bahwa kamu menggunakan Cloudflare Worker untuk keamanan. Ini adalah practice yang umum dan direkomendasikan. Alternatif lain adalah menggunakan VPS dengan static IP.

### Q: Berapa lama proses approval whitelist?
**A:** Biasanya 1-3 hari kerja. Hubungi support Tripay untuk follow-up.

---

## 🚨 Troubleshooting

### Error: "IP not whitelisted"

**Penyebab:**
- IP belum di-whitelist oleh Tripay
- Whitelist belum aktif
- IP ranges tidak lengkap

**Solusi:**
1. Pastikan sudah request whitelist ke Tripay
2. Tunggu approval dari Tripay (1-3 hari kerja)
3. Verifikasi IP ranges yang di-whitelist sudah lengkap
4. Test dengan sandbox dulu (tidak perlu whitelist)

### Error: "Request blocked by firewall"

**Penyebab:**
- Tripay firewall memblokir request
- IP tidak ada di whitelist

**Solusi:**
1. Hubungi support Tripay
2. Berikan detail error dan timestamp
3. Verifikasi IP ranges sudah di-whitelist

---

## 📊 Monitoring

### Check Request IP di Tripay Dashboard
1. Login ke Tripay dashboard
2. Buka menu "API Logs" atau "Request Logs"
3. Lihat IP address yang digunakan untuk request
4. Verifikasi IP tersebut ada di Cloudflare ranges

### Check Worker Logs
```bash
cd cloudflare-worker
npx wrangler tail
```

---

## 🔐 Security Notes

### Keuntungan Cloudflare Worker:
- ✅ API keys tidak exposed ke client
- ✅ Server-side signature generation
- ✅ CORS handling
- ✅ DDoS protection dari Cloudflare
- ✅ Global CDN untuk performa

### Keamanan Tambahan:
- ✅ ALLOWED_ORIGINS di worker untuk restrict domain
- ✅ Rate limiting bisa ditambahkan
- ✅ Request validation di worker
- ✅ Signature verification untuk callback

---

## 📚 References

**Cloudflare IP Ranges:**
- IPv4: https://www.cloudflare.com/ips-v4
- IPv6: https://www.cloudflare.com/ips-v6
- Docs: https://www.cloudflare.com/ips/

**Tripay Documentation:**
- API Docs: https://tripay.co.id/developer
- Support: support@tripay.co.id

**Worker Configuration:**
- Worker URL: https://tripay-proxy.canvango.workers.dev
- Dashboard: https://dash.cloudflare.com

---

## ✅ Checklist

**Sebelum Request Whitelist:**
- [ ] Worker sudah deployed
- [ ] Worker URL sudah dikonfigurasi di database
- [ ] Test sandbox berhasil
- [ ] Callback URL sudah benar

**Request Whitelist:**
- [ ] Email ke support@tripay.co.id
- [ ] Include merchant code
- [ ] Include semua IP ranges Cloudflare
- [ ] Include callback URL

**Setelah Approval:**
- [ ] Test production API
- [ ] Verify payment creation
- [ ] Test callback handling
- [ ] Monitor logs

---

**Last Updated:** November 29, 2025  
**Cloudflare IP Ranges Version:** Current (check https://www.cloudflare.com/ips/ for updates)
