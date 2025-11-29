# 🧪 Test Tripay Payment Channels - Manual Testing

## 📋 Status Check

**Edge Function:** ✅ Deployed
**Credentials:** ✅ Set in database
**Ready to Test:** ✅ Yes

---

## 🎯 Cara Test

### Option 1: HTML Test Page (Recommended)

1. **Buka file test:**
   ```
   test-tripay-payment-channels.html
   ```
   Double-click file atau buka di browser

2. **Get Access Token:**
   - Login ke https://canvango.com sebagai **admin**
   - Buka DevTools (F12)
   - Go to: **Application** → **Local Storage** → `https://canvango.com`
   - Find key: `sb-gpittnsfzgkdbqnccncn-auth-token`
   - Copy value: `{"access_token": "eyJhbG..."}`
   - Copy hanya bagian `access_token` value-nya

3. **Paste Token:**
   - Paste di input field "Supabase Access Token"

4. **Click Test:**
   - Click button "🚀 Test Fetch Payment Channels"

5. **Check Results:**
   - ✅ Success: Payment channels akan tampil
   - ❌ Error: Lihat error message

---

## 🔍 Expected Results

### Success Response

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
    }
    // ... more channels
  ]
}
```

### Possible Errors

**Error 1: "Unauthorized"**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```
**Cause:** Token invalid atau expired
**Fix:** Get new token, login ulang

**Error 2: "Admin access required"**
```json
{
  "success": false,
  "message": "Admin access required"
}
```
**Cause:** User bukan admin
**Fix:** Login dengan admin account

**Error 3: "Tripay API key not configured"**
```json
{
  "success": false,
  "message": "Tripay API key not configured"
}
```
**Cause:** Credentials tidak ada di database
**Fix:** Set credentials di Admin Settings

**Error 4: "Invalid API key"**
```json
{
  "success": false,
  "message": "Invalid API key"
}
```
**Cause:** API key salah atau merchant belum approved
**Fix:** 
- Verify API key di Admin Settings
- Check merchant T47159 status di Tripay dashboard

---

## 🔧 Option 2: Browser Console

```javascript
// 1. Login sebagai admin di https://canvango.com
// 2. Buka DevTools Console (F12)
// 3. Run this code:

async function testTripayChannels() {
  // Get access token from localStorage
  const authData = JSON.parse(
    localStorage.getItem('sb-gpittnsfzgkdbqnccncn-auth-token')
  );
  const accessToken = authData.access_token;
  
  console.log('🚀 Fetching payment channels...');
  
  const response = await fetch(
    'https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-get-payment-channels',
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );
  
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ Success!');
    console.log('📊 Total channels:', data.data.length);
    console.table(data.data.map(ch => ({
      code: ch.code,
      name: ch.name,
      fee: ch.fee_merchant.flat || `${ch.fee_merchant.percent}%`,
      active: ch.active
    })));
  } else {
    console.error('❌ Error:', data.message);
  }
  
  return data;
}

// Run test
testTripayChannels();
```

---

## 🔧 Option 3: cURL

```bash
# Get your access token first
ACCESS_TOKEN="your_access_token_here"

# Test Edge Function
curl -X GET \
  https://gpittnsfzgkdbqnccncn.supabase.co/functions/v1/tripay-get-payment-channels \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  | jq .
```

---

## 📊 What to Check

### 1. Response Status
- ✅ 200 OK - Success
- ❌ 401 Unauthorized - Token invalid
- ❌ 403 Forbidden - Not admin
- ❌ 500 Internal Server Error - Server error

### 2. Payment Channels Count
- Expected: **10-20 channels** (depends on merchant)
- Common channels:
  - BRIVA, BCAVA, BNIVA, MANDIRIVA (Virtual Account)
  - QRIS, SHOPEEPAY, OVO, DANA (E-Wallet)
  - ALFAMART, INDOMARET (Retail)

### 3. Channel Data
Each channel should have:
- ✅ `code` - Payment method code
- ✅ `name` - Payment method name
- ✅ `fee_merchant` - Merchant fee
- ✅ `icon_url` - Icon URL
- ✅ `active` - Active status

### 4. Fees
- Virtual Account: Usually Rp 2,500 flat
- QRIS: Usually 0.7%
- E-Wallet: Usually 2%
- Retail: Usually Rp 3,000-5,000 flat

---

## 🐛 Troubleshooting

### Test Failed - Check These:

**1. Credentials in Database**
```sql
SELECT tripay_config FROM system_settings;
```

**2. Merchant Status**
- Login: https://tripay.co.id/member
- Check merchant T47159 approved?
- Check API key active?

**3. Edge Function Deployed**
- Check: https://supabase.com/dashboard/project/gpittnsfzgkdbqnccncn/functions
- Should see: `tripay-get-payment-channels`

**4. Network Issues**
- Check internet connection
- Try different browser
- Disable VPN if any

---

## ✅ Success Indicators

If test successful, you should see:

1. ✅ **Status 200 OK**
2. ✅ **success: true**
3. ✅ **data array with 10+ channels**
4. ✅ **Each channel has complete data**
5. ✅ **Icons load properly**
6. ✅ **Fees displayed correctly**

---

## 📝 Next Steps After Success

Once test successful:

1. **Document Results** - Save payment channels list
2. **Update UI** - Integrate to Admin Settings
3. **Add Toggle** - Enable/disable per channel
4. **Save to Database** - Cache enabled channels
5. **Test Payment** - Create payment with enabled channel

---

## 🎯 Summary

**Test File:** `test-tripay-payment-channels.html`
**Edge Function:** `tripay-get-payment-channels`
**Status:** ✅ Ready to test

**Steps:**
1. Open test file in browser
2. Get admin access token
3. Paste token
4. Click test button
5. Check results

**Expected:** List of 10-20 payment channels with fees and status

---

**Ready to test!** 🚀

Buka `test-tripay-payment-channels.html` di browser dan test sekarang.
