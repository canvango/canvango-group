# SMS Provider Setup Guide

## Current Status

✅ **Development Mode**: OTP ditampilkan di console (tidak dikirim SMS)
❌ **Production Mode**: Belum ada SMS provider (perlu setup)

## Untuk Testing (Development)

Saat ini OTP **TIDAK dikirim via SMS**. Untuk testing:

1. **Lihat Console Browser** (F12):
   ```
   OTP Code (DEV): 123456
   ```

2. **Lihat Server Logs**:
   ```
   ==================================================
   📱 OTP SMS (DEVELOPMENT MODE)
   ==================================================
   Phone: +6281234567890
   OTP Code: 123456
   Message: Kode OTP Canvango: 123456. Berlaku 10 menit.
   ==================================================
   ```

3. **Lihat Response API** (di Network tab):
   ```json
   {
     "success": true,
     "data": {
       "otp_code": "123456"  // Only in development
     }
   }
   ```

## Setup SMS Provider (Production)

### Option 1: Twilio (Recommended)

**Kelebihan:**
- ✅ Reliable & global coverage
- ✅ Good documentation
- ✅ Easy integration
- ✅ Support Indonesia

**Biaya:** ~$0.0075 per SMS ke Indonesia

**Setup:**

1. **Daftar Twilio**: https://www.twilio.com/try-twilio

2. **Install package:**
   ```bash
   cd server
   npm install twilio
   ```

3. **Get credentials** dari Twilio Console:
   - Account SID
   - Auth Token
   - Phone Number

4. **Update `.env`:**
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

5. **Uncomment di `server/src/services/sms.service.ts`:**
   ```typescript
   // Uncomment OPTION 1: TWILIO section
   // Comment out DEVELOPMENT MODE section
   ```

6. **Restart server:**
   ```bash
   npm run dev
   ```

### Option 2: Zenziva (Indonesia)

**Kelebihan:**
- ✅ Provider lokal Indonesia
- ✅ Support Bahasa Indonesia
- ✅ Harga kompetitif

**Biaya:** Mulai dari Rp 150/SMS

**Setup:**

1. **Daftar Zenziva**: https://www.zenziva.net/

2. **Get credentials:**
   - Userkey
   - Passkey

3. **Update `.env`:**
   ```env
   ZENZIVA_USERKEY=your_userkey
   ZENZIVA_PASSKEY=your_passkey
   ```

4. **Uncomment di `server/src/services/sms.service.ts`:**
   ```typescript
   // Uncomment OPTION 2: ZENZIVA section
   // Comment out DEVELOPMENT MODE section
   ```

5. **Restart server**

### Option 3: Vonage (Nexmo)

**Kelebihan:**
- ✅ Global coverage
- ✅ Competitive pricing
- ✅ Good API

**Biaya:** ~$0.0062 per SMS ke Indonesia

**Setup:**

1. **Daftar Vonage**: https://dashboard.nexmo.com/sign-up

2. **Install package:**
   ```bash
   cd server
   npm install @vonage/server-sdk
   ```

3. **Get credentials:**
   - API Key
   - API Secret

4. **Update `.env`:**
   ```env
   VONAGE_API_KEY=your_api_key
   VONAGE_API_SECRET=your_api_secret
   ```

5. **Uncomment di `server/src/services/sms.service.ts`:**
   ```typescript
   // Uncomment OPTION 3: VONAGE section
   // Comment out DEVELOPMENT MODE section
   ```

6. **Restart server**

### Option 4: AWS SNS

**Kelebihan:**
- ✅ Jika sudah pakai AWS
- ✅ Integrated dengan AWS ecosystem
- ✅ Pay as you go

**Biaya:** ~$0.00645 per SMS ke Indonesia

**Setup:**

1. **Setup AWS Account** dengan SNS enabled

2. **Install package:**
   ```bash
   cd server
   npm install @aws-sdk/client-sns
   ```

3. **Configure AWS credentials:**
   ```env
   AWS_REGION=ap-southeast-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   ```

4. **Uncomment di `server/src/services/sms.service.ts`:**
   ```typescript
   // Uncomment OPTION 4: AWS SNS section
   // Comment out DEVELOPMENT MODE section
   ```

5. **Restart server**

## Testing SMS Integration

### 1. Test Send OTP

```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "081234567890"}'
```

**Expected:**
- ✅ SMS diterima di HP
- ✅ Server log: "✅ OTP sent to +6281234567890 via [Provider]"

### 2. Check Server Logs

```
📱 OTP SMS (DEVELOPMENT MODE)  // Should NOT appear in production
✅ OTP sent to +6281234567890 via Twilio  // Should appear
```

### 3. Verify OTP

```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "081234567890", "otp_code": "123456"}'
```

## Troubleshooting

### SMS tidak terkirim

**Check 1: Provider credentials**
```bash
# Check .env file
cat server/.env | grep TWILIO
# or
cat server/.env | grep ZENZIVA
```

**Check 2: Server logs**
```
Look for error messages:
- "Twilio SMS error: ..."
- "Failed to send OTP SMS"
```

**Check 3: Phone number format**
```
Valid: +6281234567890
Valid: 081234567890
Invalid: 81234567890 (missing 0 or +62)
```

**Check 4: Provider balance**
- Check Twilio/Zenziva/Vonage balance
- Ensure sufficient credits

### OTP masih muncul di response

**Issue:** `otp_code` masih ada di API response

**Fix:** Set `NODE_ENV=production` di `.env`:
```env
NODE_ENV=production
```

### Rate limiting

**Issue:** "Too many OTP requests"

**Cause:** Max 3 OTP per 10 minutes per phone

**Fix:** Wait 10 minutes or clear database:
```sql
DELETE FROM phone_otp_verifications 
WHERE phone = '+6281234567890';
```

## Cost Comparison

| Provider | Cost per SMS | Min. Top-up | Coverage |
|----------|-------------|-------------|----------|
| Twilio | $0.0075 | $20 | Global |
| Zenziva | Rp 150 | Rp 50,000 | Indonesia |
| Vonage | $0.0062 | $10 | Global |
| AWS SNS | $0.00645 | Pay as you go | Global |

## Recommendations

### For Small Projects (< 1000 SMS/month)
- **Zenziva** - Murah, lokal, mudah setup

### For Medium Projects (1000-10000 SMS/month)
- **Twilio** - Reliable, good docs, global

### For Large Projects (> 10000 SMS/month)
- **AWS SNS** - Scalable, integrated dengan AWS

### For Testing/Development
- **Current setup** - No SMS, OTP di console

## Security Best Practices

1. **Never log OTP in production:**
   ```typescript
   if (process.env.NODE_ENV !== 'development') {
     // Don't log OTP
   }
   ```

2. **Use environment variables:**
   ```typescript
   // ❌ DON'T
   const apiKey = 'hardcoded_key';
   
   // ✅ DO
   const apiKey = process.env.TWILIO_API_KEY;
   ```

3. **Rate limiting:**
   - Max 3 OTP per 10 minutes ✅ (already implemented)
   - Max 10 OTP per day per phone (optional)

4. **OTP expiry:**
   - 10 minutes ✅ (already implemented)

5. **Max attempts:**
   - 3 attempts per OTP ✅ (already implemented)

## Next Steps

1. ✅ Choose SMS provider
2. ✅ Sign up & get credentials
3. ✅ Install npm package
4. ✅ Update `.env` file
5. ✅ Uncomment provider code in `sms.service.ts`
6. ✅ Comment out DEVELOPMENT MODE
7. ✅ Restart server
8. ✅ Test with real phone number
9. ✅ Monitor costs & usage

## Support

Jika ada masalah:
1. Check server logs
2. Check provider dashboard (balance, logs)
3. Test dengan curl commands di atas
4. Check `server/src/services/sms.service.ts` implementation
