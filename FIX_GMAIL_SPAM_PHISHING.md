# Fix Gmail Spam/Phishing Warning - URGENT

## 🚨 Problem

Gmail mendeteksi email sebagai "Link yang tidak biasa" dan phishing karena:
1. ❌ Domain `canvango.com` belum verified di Brevo
2. ❌ DNS records (SPF, DKIM, DMARC) belum ditambahkan
3. ❌ Sender reputation rendah (domain baru)

---

## ✅ Solusi WAJIB: Verifikasi Domain di Brevo

### Step 1: Verifikasi Domain di Brevo

1. Login ke **Brevo Dashboard**: https://app.brevo.com
2. Pergi ke: **Senders & IP → Domains**
3. Klik **Add a domain**
4. Masukkan: `canvango.com`
5. Brevo akan memberikan **3 DNS records**

---

### Step 2: Tambahkan DNS Records

Brevo akan memberikan records seperti ini (contoh):

#### A. DKIM Record (CNAME)
```
Type: CNAME
Name: mail._domainkey.canvango.com
Value: mail._domainkey.brevo.com
TTL: 3600
```

#### B. SPF Record (TXT)

**Jika belum ada SPF record:**
```
Type: TXT
Name: canvango.com (atau @)
Value: v=spf1 include:spf.brevo.com ~all
TTL: 3600
```

**Jika sudah ada SPF record (untuk Vercel):**
```
# SEBELUM
v=spf1 include:_spf.vercel.com ~all

# SESUDAH (gabungkan)
v=spf1 include:_spf.vercel.com include:spf.brevo.com ~all
```

#### C. DMARC Record (TXT)
```
Type: TXT
Name: _dmarc.canvango.com
Value: v=DMARC1; p=none; rua=mailto:dmarc@canvango.com
TTL: 3600
```

---

### Step 3: Tambahkan ke DNS Provider

**Dimana DNS Anda dikelola?**
- Cloudflare
- Namecheap
- GoDaddy
- Vercel DNS
- Lainnya

**Cara Tambah DNS Records:**

1. Login ke DNS provider Anda
2. Cari menu **DNS Management** atau **DNS Records**
3. Klik **Add Record**
4. Copy-paste records dari Brevo (DKIM, SPF, DMARC)
5. Save

---

### Step 4: Verify di Brevo

1. Tunggu 5-30 menit (DNS propagation)
2. Kembali ke Brevo Dashboard → Domains
3. Klik **Verify domain**
4. Status akan berubah jadi **Verified** ✅

---

## 🔍 Check DNS Propagation

Gunakan tools ini untuk check apakah DNS sudah propagate:

**DKIM Check:**
https://mxtoolbox.com/dkim.aspx
- Domain: `canvango.com`
- Selector: `mail`

**SPF Check:**
https://mxtoolbox.com/spf.aspx
- Domain: `canvango.com`

**DMARC Check:**
https://mxtoolbox.com/dmarc.aspx
- Domain: `canvango.com`

---

## ⏱️ Timeline

- **DNS Propagation:** 5-30 menit (bisa sampai 24 jam)
- **Gmail Trust:** 1-3 hari setelah domain verified
- **Full Reputation:** 1-2 minggu dengan email activity konsisten

---

## 🎯 Solusi Sementara (Sebelum Domain Verified)

### 1. Gunakan Plain Text Link (Bukan Button)

Gmail lebih trust plain text link daripada button dengan styling.

**Ganti button dengan:**
```html
<p style="margin: 24px 0; color: #2563eb; font-size: 15px; line-height: 1.6; text-align: center;">
  <a href="{{ .ConfirmationURL }}" style="color: #2563eb; text-decoration: underline;">
    Klik di sini untuk konfirmasi email Anda
  </a>
</p>
```

### 2. Tambahkan Text Explanation

Tambahkan penjelasan sebelum link:
```html
<p style="margin: 0 0 16px; color: #4b5563; font-size: 14px; line-height: 1.6;">
  Link ini aman dan berasal dari Canvango. Anda akan diarahkan ke:
  <strong>canvango.com</strong>
</p>
```

### 3. Gunakan Short Link (Opsional)

Gunakan URL shortener seperti:
- Bitly
- TinyURL
- Custom domain shortener

Tapi ini **tidak recommended** karena bisa lebih suspicious.

---

## 📊 Monitoring Email Deliverability

Setelah domain verified, monitor di:

**Brevo Dashboard:**
- Statistics → Email
- Check: Delivery rate, bounce rate, spam rate

**Google Postmaster Tools:**
- https://postmaster.google.com
- Add domain: `canvango.com`
- Monitor: Spam rate, domain reputation

---

## ⚠️ Warning Signs

Jika email masih masuk spam setelah domain verified:

1. **Check SPF/DKIM/DMARC** alignment
2. **Reduce link count** (max 2-3 links per email)
3. **Avoid spam trigger words**: "free", "click here", "urgent"
4. **Warm up domain** (kirim email bertahap, jangan langsung banyak)
5. **Ask users** to mark as "Not Spam" dan add to contacts

---

## 🚀 Best Practices

### Email Content:
- ✅ Plain text + simple HTML
- ✅ Personal greeting: "Halo [Name]"
- ✅ Clear sender name: "Canvango" bukan "noreply"
- ✅ Unsubscribe link (untuk marketing emails)
- ✅ Physical address di footer (optional tapi recommended)

### Sending Behavior:
- ✅ Start slow (10-20 emails/day)
- ✅ Gradually increase volume
- ✅ Consistent sending schedule
- ✅ Monitor bounce rate (<5%)
- ✅ Monitor spam complaints (<0.1%)

### Domain Reputation:
- ✅ Verify domain di Brevo
- ✅ Setup SPF, DKIM, DMARC
- ✅ Use consistent "From" address
- ✅ Don't change sender frequently
- ✅ Maintain good engagement (opens, clicks)

---

## 🆘 Emergency Fix (Jika Urgent)

Jika butuh kirim email sekarang dan tidak bisa tunggu domain verification:

### Option 1: Gunakan Email Brevo Langsung

Di Supabase SMTP settings:
```
Sender email: 9d1374001@smtp-brevo.com
```

Ini akan langsung work tapi kurang profesional.

### Option 2: Kirim Manual Email

Sementara waktu, kirim email konfirmasi manual dari Gmail/Outlook Anda sendiri.

---

## 📞 Support

**Brevo Support:**
- Help: https://help.brevo.com
- Live chat: Available di dashboard

**DNS Provider Support:**
- Check dokumentasi DNS provider Anda

---

## ✅ Checklist

- [ ] Login ke Brevo Dashboard
- [ ] Add domain: canvango.com
- [ ] Copy DNS records (DKIM, SPF, DMARC)
- [ ] Login ke DNS provider
- [ ] Tambahkan 3 DNS records
- [ ] Save & wait 30 menit
- [ ] Verify domain di Brevo
- [ ] Test kirim email ulang
- [ ] Check apakah masih masuk spam
- [ ] Monitor deliverability di Brevo

---

**Priority:** 🔴 URGENT - Fix ini WAJIB untuk email production
**Estimated Time:** 30 menit - 24 jam (tergantung DNS propagation)
**Impact:** High - Email tidak bisa digunakan sampai domain verified
