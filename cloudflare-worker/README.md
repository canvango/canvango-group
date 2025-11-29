# Tripay Proxy - Cloudflare Worker

Cloudflare Worker yang berfungsi sebagai proxy untuk Tripay API, menangani CORS dan menyembunyikan API credentials.

## Features

- ✅ CORS handling
- ✅ Secure API key management
- ✅ Signature generation
- ✅ Support sandbox & production
- ✅ Multiple endpoints (payment channels, create transaction, transaction detail)

## Setup

### 1. Install Dependencies

```bash
cd cloudflare-worker
npm install
```

### 2. Configure Environment Variables

Buat file `.dev.vars` untuk development:

```env
TRIPAY_API_KEY=your-api-key
TRIPAY_PRIVATE_KEY=your-private-key
TRIPAY_MERCHANT_CODE=your-merchant-code
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com
```

### 3. Development

```bash
npm run dev
```

Worker akan berjalan di `http://localhost:8787`

### 4. Deploy

#### Deploy ke Staging

```bash
npm run deploy:staging
```

#### Deploy ke Production

```bash
npm run deploy:production
```

### 5. Set Environment Variables di Cloudflare

Setelah deploy, set environment variables via Cloudflare Dashboard:

1. Buka Workers & Pages
2. Pilih worker `tripay-proxy`
3. Settings → Variables
4. Add variables:
   - `TRIPAY_API_KEY`
   - `TRIPAY_PRIVATE_KEY`
   - `TRIPAY_MERCHANT_CODE`
   - `ALLOWED_ORIGINS` (comma-separated)

## API Endpoints

### GET /payment-channels

Get available payment channels.

**Query Parameters:**
- `sandbox` (optional): `true` untuk sandbox mode

**Example:**
```bash
curl https://your-worker.workers.dev/payment-channels?sandbox=true
```

### POST /create-transaction

Create new payment transaction.

**Body:**
```json
{
  "method": "BRIVA",
  "merchant_ref": "INV-123",
  "amount": 50000,
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "081234567890",
  "order_items": [
    {
      "name": "Top Up Balance",
      "price": 50000,
      "quantity": 1
    }
  ],
  "return_url": "https://yourdomain.com/payment/success",
  "expired_time": 1234567890,
  "sandbox": true
}
```

### GET /transaction/:reference

Get transaction detail by reference.

**Query Parameters:**
- `sandbox` (optional): `true` untuk sandbox mode

**Example:**
```bash
curl https://your-worker.workers.dev/transaction/T0000XXXXX?sandbox=true
```

## Security

- API keys disimpan sebagai environment variables di Cloudflare
- CORS protection dengan whitelist origins
- Signature generation di server-side
- No API keys exposed ke client

## Testing

Test dengan curl atau Postman:

```bash
# Test payment channels
curl -X GET "https://your-worker.workers.dev/payment-channels?sandbox=true" \
  -H "Origin: https://yourdomain.com"

# Test create transaction
curl -X POST "https://your-worker.workers.dev/create-transaction" \
  -H "Content-Type: application/json" \
  -H "Origin: https://yourdomain.com" \
  -d '{
    "method": "BRIVA",
    "merchant_ref": "TEST-123",
    "amount": 50000,
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "customer_phone": "081234567890",
    "order_items": [{"name": "Test", "price": 50000, "quantity": 1}],
    "return_url": "https://yourdomain.com/success",
    "sandbox": true
  }'
```

## Monitoring

Monitor worker di Cloudflare Dashboard:
- Real-time logs
- Request metrics
- Error tracking
- Performance analytics

## Cost

Cloudflare Workers Free Tier:
- 100,000 requests/day
- 10ms CPU time per request
- Unlimited bandwidth

Untuk traffic lebih tinggi, upgrade ke Workers Paid ($5/month):
- 10 million requests/month included
- $0.50 per additional million requests
