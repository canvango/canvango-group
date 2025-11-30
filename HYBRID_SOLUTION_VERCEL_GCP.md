# Hybrid Solution: Vercel Frontend + GCP Callback

## Problem

- ✅ Frontend harus di Vercel (canvango.com)
- ✅ Callback URL harus `https://canvango.com/api/tripay-callback`
- ❌ Vercel rewrites causing 307 redirect
- ❌ TriPay tidak bisa follow redirects

## Solution: Hybrid Architecture

```
canvango.com (Frontend)
  ↓
Vercel (Static files + most API routes)
  ↓
/api/tripay-callback → GCP Cloud Function (via proxy)
```

---

## Option 1: Cloudflare Workers (Recommended - Easiest)

**Architecture:**
```
TriPay → canvango.com/api/tripay-callback
       → Cloudflare (DNS + Worker)
       → GCP Cloud Function
       → Supabase Edge Function
```

### Steps:

1. **Deploy GCP Function** (as before)
   ```bash
   cd gcp-functions/tripay-callback
   gcloud functions deploy tripay-callback \
     --runtime nodejs20 \
     --trigger-http \
     --allow-unauthenticated \
     --region asia-southeast2 \
     --entry-point tripayCallback
   ```

2. **Get GCP Function URL**
   ```
   https://asia-southeast2-PROJECT_ID.cloudfunctions.net/tripay-callback
   ```

3. **Create Cloudflare Worker**
   
   Go to: Cloudflare Dashboard → Workers & Pages → Create Worker
   
   ```javascript
   export default {
     async fetch(request) {
       // Only handle /api/tripay-callback
       const url = new URL(request.url);
       
       if (url.pathname === '/api/tripay-callback') {
         // Forward to GCP
         const gcpUrl = 'https://asia-southeast2-PROJECT_ID.cloudfunctions.net/tripay-callback';
         
         return fetch(gcpUrl, {
           method: request.method,
           headers: request.headers,
           body: request.body,
         });
       }
       
       // All other requests go to Vercel
       return fetch(request);
     }
   };
   ```

4. **Add Worker Route**
   - Cloudflare Dashboard → Workers & Pages → Your Worker
   - Add Route: `canvango.com/api/tripay-callback`
   - Save

**Done!** Now:
- `canvango.com` → Vercel (frontend)
- `canvango.com/api/tripay-callback` → Cloudflare Worker → GCP → Supabase

---

## Option 2: Vercel Edge Middleware (Simpler)

**Create middleware to proxy specific route:**

### File: `middleware.ts` (project root)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only handle /api/tripay-callback
  if (request.nextUrl.pathname === '/api/tripay-callback') {
    const gcpUrl = 'https://asia-southeast2-PROJECT_ID.cloudfunctions.net/tripay-callback';
    
    // Forward to GCP
    const response = await fetch(gcpUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    return new NextResponse(response.body, {
      status: response.status,
      headers: response.headers,
    });
  }
  
  // Continue to normal routing
  return NextResponse.next();
}

export const config = {
  matcher: '/api/tripay-callback',
};
```

**Deploy:**
```bash
git add middleware.ts
git commit -m "feat: add middleware to proxy tripay callback to GCP"
git push
vercel --prod
```

---

## Option 3: Keep Everything in Vercel (Fix Routing)

**Last attempt - fix Vercel routing properly:**

### File: `vercel.json`

```json
{
  "functions": {
    "api/tripay-callback.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "routes": [
    {
      "src": "/api/tripay-callback",
      "dest": "/api/tripay-callback.ts",
      "methods": ["POST"]
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

**Key changes:**
- Use `routes` instead of `rewrites`
- Explicit route for `/api/tripay-callback`
- Catch-all route that preserves path

**Deploy:**
```bash
git add vercel.json
git commit -m "fix: use explicit routes for API endpoints"
git push
vercel --prod --force
```

---

## Option 4: Nginx Reverse Proxy on VPS

**If you have VPS:**

### Nginx Config:

```nginx
server {
    listen 443 ssl;
    server_name canvango.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Callback route → GCP
    location /api/tripay-callback {
        proxy_pass https://asia-southeast2-PROJECT_ID.cloudfunctions.net/tripay-callback;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Callback-Signature $http_x_callback_signature;
    }
    
    # Everything else → Vercel
    location / {
        proxy_pass https://canvango-group.vercel.app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Update DNS:**
- Point `canvango.com` A record to VPS IP

---

## Comparison

| Solution | Complexity | Cost | Reliability |
|----------|-----------|------|-------------|
| Cloudflare Worker | Low | Free | ⭐⭐⭐⭐⭐ |
| Vercel Middleware | Low | Free | ⭐⭐⭐⭐ |
| Fix Vercel Routing | Very Low | Free | ⭐⭐⭐ |
| VPS Nginx | High | $5-10/mo | ⭐⭐⭐⭐⭐ |

---

## Recommended: Cloudflare Worker

**Why:**
1. ✅ Free (100k requests/day)
2. ✅ Easy to setup
3. ✅ No code changes needed
4. ✅ Works with existing Vercel setup
5. ✅ Very reliable
6. ✅ Global edge network

**Steps:**
1. Deploy GCP function
2. Create Cloudflare Worker (5 minutes)
3. Add route for `/api/tripay-callback`
4. Done!

---

## Alternative: Fix Vercel (Try First)

**Before going to GCP/Cloudflare, try one more Vercel fix:**

### File: `vercel.json`

```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

**That's it!** Remove all routing config, let Vercel auto-detect.

**Deploy:**
```bash
vercel --prod --force
```

**Test:**
```bash
curl -X POST https://canvango.com/api/tripay-callback \
  -H "X-Callback-Signature: test" \
  -d '{"test": true}'
```

If still 307, then go with Cloudflare Worker solution.

---

## Summary

**URL Requirement:** `https://canvango.com/api/tripay-callback` ✅

**Solutions (in order of preference):**
1. **Try Vercel fix first** (simplest config)
2. **Cloudflare Worker** (if Vercel still fails)
3. **Vercel Middleware** (if no Cloudflare)
4. **GCP + Nginx VPS** (if you have VPS)

**Recommended Action:**
1. Try minimal `vercel.json` config
2. If still fails, setup Cloudflare Worker
3. Both keep `canvango.com` domain requirement ✅

---

**Next Step:** Which solution do you want to try first?
