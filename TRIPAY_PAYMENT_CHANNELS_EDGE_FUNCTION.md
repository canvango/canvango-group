# ✅ Tripay Payment Channels - Edge Function

## 🎯 Status: DEPLOYED

**Edge Function:** `tripay-get-payment-channels`
**URL:** `https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-get-payment-channels`
**Status:** ✅ Deployed

---

## 📋 What It Does

Fetches available payment channels from Tripay API:
- Reads Tripay credentials from database (or environment fallback)
- Calls Tripay API: `GET /merchant/payment-channel`
- Returns list of payment methods with fees and status
- Admin-only access (requires admin role)

---

## 🔐 Security

- ✅ Requires authentication (Bearer token)
- ✅ Admin-only access (checks user role)
- ✅ Credentials from database (secure)
- ✅ No CORS issues (server-side call)

---

## 📡 API Endpoint

### Request

```bash
GET https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-get-payment-channels

Headers:
  Authorization: Bearer {supabase_access_token}
  Content-Type: application/json
```

### Response (Success)

```json
{
  "success": true,
  "message": "success",
  "data": [
    {
      "group": "Virtual Account",
      "code": "BRIVA",
      "name": "BRI Virtual Account",
      "type": "virtual_account",
      "fee_merchant": {
        "flat": 2500,
        "percent": 0
      },
      "fee_customer": {
        "flat": 0,
        "percent": 0
      },
      "total_fee": {
        "flat": 2500,
        "percent": 0
      },
      "minimum_fee": 2500,
      "maximum_fee": 2500,
      "icon_url": "https://tripay.co.id/images/payment_icon/BRIVA.png",
      "active": true
    },
    {
      "group": "Virtual Account",
      "code": "BCAVA",
      "name": "BCA Virtual Account",
      "type": "virtual_account",
      "fee_merchant": {
        "flat": 2500,
        "percent": 0
      },
      "fee_customer": {
        "flat": 0,
        "percent": 0
      },
      "total_fee": {
        "flat": 2500,
        "percent": 0
      },
      "minimum_fee": 2500,
      "maximum_fee": 2500,
      "icon_url": "https://tripay.co.id/images/payment_icon/BCAVA.png",
      "active": true
    },
    {
      "group": "QRIS",
      "code": "QRIS",
      "name": "QRIS (All E-Wallet)",
      "type": "qris",
      "fee_merchant": {
        "flat": 0,
        "percent": 0.7
      },
      "fee_customer": {
        "flat": 0,
        "percent": 0
      },
      "total_fee": {
        "flat": 0,
        "percent": 0.7
      },
      "minimum_fee": 0,
      "maximum_fee": 0,
      "icon_url": "https://tripay.co.id/images/payment_icon/QRIS.png",
      "active": true
    }
    // ... more payment methods
  ]
}
```

### Response (Error)

```json
{
  "success": false,
  "message": "Admin access required"
}
```

---

## 🧪 Testing

### Test with curl

```bash
# Get your access token first
ACCESS_TOKEN="your_supabase_access_token"

# Call Edge Function
curl -X GET \
  https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-get-payment-channels \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Test with JavaScript

```typescript
import { supabase } from '@/clients/supabase';

async function fetchPaymentChannels() {
  const { data: { session } } = await supabase.auth.getSession();
  
  const response = await fetch(
    'https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-get-payment-channels',
    {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const data = await response.json();
  console.log('Payment channels:', data);
  return data;
}
```

---

## 📊 Expected Payment Channels

Based on Tripay documentation, you should get:

### Virtual Account
- BRIVA (BRI)
- BCAVA (BCA)
- BNIVA (BNI)
- MANDIRIVA (Mandiri)
- PERMATAVA (Permata)
- CIMBVA (CIMB Niaga)
- BNCVA (BNC)
- BSIVA (BSI)

### E-Wallet
- QRIS
- SHOPEEPAY
- OVO
- DANA
- LINKAJA

### Retail
- ALFAMART
- INDOMARET

### Others
- Depends on your merchant configuration

---

## 🔄 Credential Flow

```
Admin calls Edge Function
    ↓
Edge Function checks admin role
    ↓
Reads Tripay credentials from database
    ↓ (if not found)
Falls back to environment variables
    ↓
Calls Tripay API
    ↓
Returns payment channels
```

---

## 📝 Logs

Check Edge Function logs:

```bash
npx supabase functions logs tripay-get-payment-channels --tail
```

Expected logs:
```
✅ Using Tripay credentials from database
🚀 Fetching payment channels from Tripay
📍 Mode: production
🔑 API Key: LYIV2DddSP...
📊 Tripay response status: 200
✅ Payment channels fetched successfully
📊 Total channels: 15
```

---

## 🐛 Troubleshooting

### Error: "Unauthorized"
**Cause:** Not logged in or invalid token
**Fix:** Ensure user is authenticated

### Error: "Admin access required"
**Cause:** User is not admin
**Fix:** Login with admin account

### Error: "Tripay API key not configured"
**Cause:** No credentials in database or environment
**Fix:** Configure credentials in Admin Settings

### Error: "Failed to fetch payment channels"
**Cause:** Tripay API error (invalid key, merchant not approved)
**Fix:** 
- Verify merchant T47159 is approved
- Check API key is correct
- Check Tripay dashboard

---

## 🎯 Next Steps

**Waiting for your instructions:**

1. **Frontend Integration?**
   - Create service function to call Edge Function
   - Add to Admin Settings UI
   - Show payment channels in table

2. **Database Cache?**
   - Save payment channels to database
   - Refresh on demand
   - Use cached data for performance

3. **UI Design?**
   - List view with toggle enable/disable
   - Show fees per method
   - Refresh button

**Let me know what you want to do next!** 🚀

---

**Status:** ✅ Edge Function Ready
**Deployed:** Yes
**Tested:** Pending (waiting for your test)
**Next:** Waiting for instructions
