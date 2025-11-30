# Deploy TriPay Callback to GCP Cloud Functions

## Why GCP Instead of Vercel?

**Problem dengan Vercel:**
- ❌ Rewrites causing 307 redirects
- ❌ Complex routing configuration
- ❌ Edge cache propagation delays
- ❌ TriPay tidak bisa follow redirects

**Solution dengan GCP:**
- ✅ No redirects - direct response
- ✅ Simple configuration
- ✅ Stable and reliable
- ✅ Full control over routing

---

## Prerequisites

### 1. Install Google Cloud SDK

**Windows:**
```bash
# Download installer
https://cloud.google.com/sdk/docs/install

# Or use Chocolatey
choco install gcloudsdk
```

**Verify installation:**
```bash
gcloud --version
```

### 2. Login to GCP

```bash
gcloud auth login
```

### 3. Set Project

```bash
# List projects
gcloud projects list

# Set active project
gcloud config set project YOUR_PROJECT_ID
```

---

## Deployment Steps

### Step 1: Navigate to Function Directory

```bash
cd gcp-functions/tripay-callback
```

### Step 2: Deploy Function

```bash
gcloud functions deploy tripay-callback \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --region asia-southeast2 \
  --entry-point tripayCallback \
  --memory 256MB \
  --timeout 10s
```

**Parameters:**
- `--runtime nodejs20` - Node.js 20 runtime
- `--trigger-http` - HTTP trigger
- `--allow-unauthenticated` - Public access (for TriPay)
- `--region asia-southeast2` - Jakarta region (closest to Indonesia)
- `--entry-point tripayCallback` - Function name in code
- `--memory 256MB` - Memory allocation
- `--timeout 10s` - Timeout

### Step 3: Get Function URL

After deployment, you'll get URL like:
```
https://asia-southeast2-YOUR_PROJECT_ID.cloudfunctions.net/tripay-callback
```

---

## Configure Custom Domain

### Option 1: Cloud Load Balancer (Recommended)

**Steps:**

1. **Reserve Static IP**
   ```bash
   gcloud compute addresses create tripay-callback-ip \
     --global
   ```

2. **Get IP Address**
   ```bash
   gcloud compute addresses describe tripay-callback-ip \
     --global \
     --format="get(address)"
   ```

3. **Create Serverless NEG**
   ```bash
   gcloud compute network-endpoint-groups create tripay-callback-neg \
     --region=asia-southeast2 \
     --network-endpoint-type=serverless \
     --cloud-function-name=tripay-callback
   ```

4. **Create Backend Service**
   ```bash
   gcloud compute backend-services create tripay-callback-backend \
     --global
   
   gcloud compute backend-services add-backend tripay-callback-backend \
     --global \
     --network-endpoint-group=tripay-callback-neg \
     --network-endpoint-group-region=asia-southeast2
   ```

5. **Create URL Map**
   ```bash
   gcloud compute url-maps create tripay-callback-map \
     --default-service=tripay-callback-backend
   ```

6. **Create SSL Certificate**
   ```bash
   gcloud compute ssl-certificates create tripay-callback-cert \
     --domains=canvango.com
   ```

7. **Create HTTPS Proxy**
   ```bash
   gcloud compute target-https-proxies create tripay-callback-proxy \
     --ssl-certificates=tripay-callback-cert \
     --url-map=tripay-callback-map
   ```

8. **Create Forwarding Rule**
   ```bash
   gcloud compute forwarding-rules create tripay-callback-rule \
     --global \
     --target-https-proxy=tripay-callback-proxy \
     --address=tripay-callback-ip \
     --ports=443
   ```

9. **Update DNS**
   - Add A record: `canvango.com` → `[Static IP from step 2]`
   - Or CNAME: `api.canvango.com` → `[Static IP]`

### Option 2: Firebase Hosting (Simpler)

**Steps:**

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login**
   ```bash
   firebase login
   ```

3. **Init Hosting**
   ```bash
   firebase init hosting
   ```

4. **Configure Rewrite** (firebase.json)
   ```json
   {
     "hosting": {
       "public": "public",
       "rewrites": [
         {
           "source": "/api/tripay-callback",
           "function": "tripay-callback"
         }
       ]
     }
   }
   ```

5. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

6. **Connect Custom Domain**
   - Firebase Console → Hosting → Add custom domain
   - Follow DNS setup instructions

---

## Testing

### Test Function Directly

```bash
curl -X POST \
  https://asia-southeast2-YOUR_PROJECT_ID.cloudfunctions.net/tripay-callback \
  -H "Content-Type: application/json" \
  -H "X-Callback-Signature: test" \
  -d '{"test": true}'
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid signature"
}
```

✅ This means function is working!

### Test with TriPay Callback Tester

1. Update callback URL in TriPay dashboard:
   ```
   https://asia-southeast2-YOUR_PROJECT_ID.cloudfunctions.net/tripay-callback
   ```
   
   Or with custom domain:
   ```
   https://canvango.com/api/tripay-callback
   ```

2. Test with TriPay Callback Tester

3. Expected: **Status BERHASIL** ✅

---

## Monitoring

### View Logs

```bash
gcloud functions logs read tripay-callback \
  --region asia-southeast2 \
  --limit 50
```

### Real-time Logs

```bash
gcloud functions logs read tripay-callback \
  --region asia-southeast2 \
  --limit 50 \
  --format="table(timestamp, message)"
```

---

## Cost Estimation

**Cloud Functions Pricing (asia-southeast2):**
- Invocations: $0.40 per million
- Compute time: $0.0000025 per GB-second
- Network egress: $0.12 per GB

**Estimated Monthly Cost:**
- 10,000 callbacks/month
- 256MB memory, 1s average duration
- ~$0.10 - $0.50 per month

**Very cheap!** 💰

---

## Advantages of GCP Solution

1. ✅ **No redirects** - Direct HTTP 200 response
2. ✅ **Reliable** - Google infrastructure
3. ✅ **Fast** - Asia region (low latency)
4. ✅ **Scalable** - Auto-scales with traffic
5. ✅ **Cheap** - Pay per use
6. ✅ **Simple** - No complex routing
7. ✅ **Monitoring** - Built-in logs and metrics

---

## Troubleshooting

### Issue: Permission denied

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Issue: API not enabled

```bash
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Issue: Deployment fails

Check logs:
```bash
gcloud functions logs read tripay-callback --region asia-southeast2
```

---

## Quick Deploy (One Command)

```bash
cd gcp-functions/tripay-callback && \
gcloud functions deploy tripay-callback \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --region asia-southeast2 \
  --entry-point tripayCallback \
  --memory 256MB \
  --timeout 10s
```

---

**Recommended:** Deploy to GCP for stable, reliable callback handling! 🚀
