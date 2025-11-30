# 🚀 Start GCP Setup - Quick Reference

## 🎯 Goal
Setup Google Cloud Platform Free Tier untuk Tripay proxy - **lebih mudah dari Oracle!**

---

## ⚡ Quick Info

| Item | Detail |
|------|--------|
| **Estimasi Waktu** | 30-40 menit |
| **Biaya** | Rp 0/bulan (Gratis selamanya) |
| **Difficulty** | Easy |
| **Instance** | e2-micro (1 GB RAM) |
| **Region** | Singapore |
| **Static IP** | ✅ Gratis |

---

## 📋 Prerequisites

- [ ] Email aktif (Gmail recommended)
- [ ] Kartu kredit/debit (untuk verifikasi)
- [ ] Koneksi internet stabil

---

## 🚀 Quick Start

### Phase 1: Daftar GCP (10 menit)
1. Go to: https://cloud.google.com/free
2. Klik "Get started for free"
3. Login dengan Gmail
4. Isi form registrasi
5. Verifikasi kartu kredit
6. Dapat $300 credit + Always Free tier

### Phase 2: Create VM (5 menit)
1. Compute Engine → VM instances
2. Create Instance
3. Name: `tripay-proxy`
4. Region: **Singapore**
5. Machine: **e2-micro** (Always Free)
6. OS: **Ubuntu 22.04 LTS**
7. ✅ Allow HTTP & HTTPS traffic
8. Create
9. **Reserve Static IP** (Important!)

### Phase 3: Firewall (3 menit)
1. VPC network → Firewall
2. Create rule untuk port 3000
3. Allow from 0.0.0.0/0

### Phase 4: Deploy Proxy (15 menit)
1. SSH via browser (klik tombol SSH)
2. Copy-paste commands dari guide
3. Install Node.js, PM2
4. Deploy proxy code
5. Configure .env
6. Start with PM2

### Phase 5: Update App (5 menit)
1. Update database proxy_url
2. Update frontend PROXY_URL
3. Git push

### Phase 6: Whitelist IP (2 menit)
1. Login Tripay dashboard
2. Add GCP IP to whitelist

### Phase 7: Testing (5 menit)
1. Test health check
2. Test payment channels
3. Test create payment

### Phase 8: Monitoring (5 menit)
1. Setup log rotation
2. Check PM2 status

---

## 📚 Full Guide

**Buka file ini untuk step-by-step lengkap:**
```
GCP_SETUP_GUIDE.md
```

---

## 🆚 GCP vs Oracle

| Feature | GCP | Oracle |
|---------|-----|--------|
| **Setup Difficulty** | ⭐⭐ Easy | ⭐⭐⭐ Medium |
| **RAM** | 1 GB | 6-24 GB |
| **Setup Time** | 30 menit | 60 menit |
| **UI** | User-friendly | Complex |
| **SSH** | Browser SSH ✅ | Manual SSH |
| **Static IP** | Easy reserve | Included |
| **Network** | Sangat stabil | Stabil |
| **Documentation** | Excellent | Good |
| **Always Free** | ✅ Yes | ✅ Yes |

**Winner:** GCP untuk kemudahan, Oracle untuk specs

---

## 💡 Why GCP?

### ✅ Advantages
1. **Setup lebih mudah** - UI lebih friendly
2. **Browser SSH** - No need SSH client
3. **Network stabil** - Google infrastructure
4. **Static IP gratis** - Easy to reserve
5. **1 GB RAM cukup** - Untuk Node.js proxy
6. **Region Singapore** - Latency rendah
7. **Always Free** - Gratis selamanya

### ⚠️ Limitations
- RAM lebih kecil dari Oracle (1 GB vs 6-24 GB)
- Tapi cukup untuk proxy sederhana

---

## 🎯 What Will Change

### ❌ TIDAK Berubah
- Vercel (Frontend) - Tetap sama
- Supabase (Database) - Tetap sama
- Supabase (Auth) - Tetap sama
- Domain - Tetap sama
- User Experience - Tetap sama

### ✅ Yang Berubah
**Hanya 1 hal:** Proxy Tripay API

| Sebelum | Sesudah |
|---------|---------|
| Cloudflare Worker | GCP VM |
| 1.5 juta IP ❌ | 1 static IP ✅ |
| `https://tripay-proxy.canvango.workers.dev` | `http://your-gcp-ip:3000` |

---

## 💰 Cost

| Item | Biaya |
|------|-------|
| GCP e2-micro VM | **Rp 0/bulan** |
| 30 GB disk | **Rp 0/bulan** |
| Static IP | **Rp 0/bulan** |
| Network (1 GB/month) | **Rp 0/bulan** |
| Vercel | **Rp 0/bulan** |
| Supabase | **Rp 0/bulan** |
| **TOTAL** | **Rp 0/bulan** |

---

## 🚨 Important Notes

### Before Starting
1. **Siapkan kartu kredit/debit** (tidak akan dicharge)
2. **Pilih region Singapore** (terdekat)
3. **Pilih e2-micro** (Always Free)
4. **Reserve static IP** (jangan lupa!)

### During Setup
1. **Gunakan Browser SSH** (paling mudah)
2. **Copy-paste commands** (jangan ketik manual)
3. **Catat External IP** (untuk whitelist)
4. **Test setiap phase** (pastikan working)

### After Setup
1. **Test full payment flow**
2. **Monitor logs** (`pm2 logs`)
3. **Check GCP billing** (pastikan $0)
4. **Backup .env file**

---

## ✅ Success Criteria

Setup berhasil jika:
- [ ] VM running di GCP
- [ ] Static IP reserved
- [ ] Proxy server responding
- [ ] Payment channels loading
- [ ] Payment creation working
- [ ] No errors in logs
- [ ] Frontend working normal
- [ ] Database updated
- [ ] IP whitelisted di Tripay
- [ ] Biaya tetap Rp 0

---

## 🔄 Rollback Plan

Jika ada masalah, rollback mudah:

```typescript
// Revert frontend
const PROXY_URL = 'https://tripay-proxy.canvango.workers.dev';
```

```sql
-- Revert database
UPDATE tripay_settings 
SET proxy_url = 'https://tripay-proxy.canvango.workers.dev';
```

```bash
git add . && git commit -m "rollback" && git push
```

**Downtime:** 0 detik (Cloudflare Worker masih jalan)

---

## 📞 Need Help?

**Documentation:**
- Main Guide: `GCP_SETUP_GUIDE.md`
- Tripay Guide: `TRIPAY_IP_WHITELIST_GUIDE.md`
- Quick Reference: `TRIPAY_QUICK_REFERENCE.md`

**External:**
- GCP Console: https://console.cloud.google.com
- GCP Docs: https://cloud.google.com/docs
- Tripay Docs: https://tripay.co.id/developer

---

## 🎓 Pro Tips

1. **Gunakan Browser SSH** - Paling mudah, no setup needed
2. **Reserve Static IP** - Jangan lupa step ini!
3. **Monitor billing** - Check GCP billing dashboard
4. **Keep e2-micro** - Jangan upgrade untuk tetap gratis
5. **Backup credentials** - Save .env file securely
6. **Check logs regularly** - `pm2 logs tripay-proxy`
7. **Test weekly** - Ensure everything still working

---

## ⏱️ Timeline

```
0:00 - 0:10  Phase 1: Daftar GCP
0:10 - 0:15  Phase 2: Create VM + Reserve IP
0:15 - 0:18  Phase 3: Configure Firewall
0:18 - 0:33  Phase 4: Deploy Proxy Server
0:33 - 0:38  Phase 5: Update Frontend & Database
0:38 - 0:40  Phase 6: Whitelist IP
0:40 - 0:45  Phase 7: Testing
0:45 - 0:50  Phase 8: Monitoring Setup
```

**Total:** ~50 menit (lebih cepat dari Oracle!)

---

## ✅ Ready to Start?

**Next Steps:**
1. Buka: https://cloud.google.com/free
2. Klik "Get started for free"
3. Follow guide: `GCP_SETUP_GUIDE.md`

**Atau tanya saya jika ada pertanyaan!** 🚀

---

**Created:** November 29, 2025  
**Version:** 1.0.0
