# ✅ Tripay Integration Checklist

Quick checklist untuk memastikan semua berjalan dengan baik.

---

## 🔴 Priority 1: Test Current Setup (15 min)

### Step 1: Verify Vercel Environment Variables
- [ ] Go to https://vercel.com/your-project/settings/environment-variables
- [ ] Check `SUPABASE_SERVICE_ROLE_KEY` exists
- [ ] Check `VITE_SUPABASE_URL` exists
- [ ] If missing, add from Supabase dashboard
- [ ] Redeploy if added new variables

### Step 2: Test API Route
- [ ] Open `test-tripay-current.html` in browser
- [ ] Enter your site URL
- [ ] Login to your site in another tab
- [ ] Get user token from console
- [ ] Paste token in test form
- [ ] Click "Test Create Transaction"
- [ ] Verify response shows payment data

### Step 3: Test via UI
- [ ] Login to your site
- [ ] Go to Top Up page
- [ ] Payment methods load correctly
- [ ] Select payment method (e.g., BRI VA)
- [ ] Enter amount (min 10,000)
- [ ] Click "Bayar Sekarang"
- [ ] Redirects to Tripay payment page

### Step 4: Verify Database
- [ ] Run SQL: `SELECT * FROM transactions ORDER BY created_at DESC LIMIT 5`
- [ ] Transaction exists
- [ ] Has `tripay_reference`
- [ ] Has `tripay_checkout_url`
- [ ] Status is "pending"

### Step 5: Document Results
- [ ] Screenshot of successful payment page
- [ ] Note any errors encountered
- [ ] Record response times
- [ ] Save test transaction reference

---

## 🟡 Priority 2: Deploy Cloudflare Worker (Optional - 30 min)

### Step 1: Setup
- [ ] `cd cloudflare-worker`
- [ ] `npm install`
- [ ] Edit `.dev.vars` with Tripay credentials
- [ ] Verify credentials are correct

### Step 2: Test Locally
- [ ] `npm run dev`
- [ ] Open `test-worker.html`
- [ ] Set URL to `http://localhost:8787`
- [ ] Test payment channels endpoint
- [ ] Test create transaction endpoint
- [ ] Verify responses

### Step 3: Deploy
- [ ] `wrangler login`
- [ ] `npm run deploy:production`
- [ ] Copy worker URL from output
- [ ] Save URL for next step

### Step 4: Configure Cloudflare
- [ ] Go to Cloudflare Dashboard
- [ ] Workers & Pages → your worker
- [ ] Settings → Environment Variables
- [ ] Add `TRIPAY_API_KEY`
- [ ] Add `TRIPAY_PRIVATE_KEY`
- [ ] Add `TRIPAY_MERCHANT_CODE`
- [ ] Add `ALLOWED_ORIGINS`
- [ ] Save and Deploy

### Step 5: Update Frontend
- [ ] Add worker URL to `.env.production`
- [ ] Or update via Admin UI (System Settings)
- [ ] `npm run build`
- [ ] `vercel --prod`

### Step 6: Test Production
- [ ] Test payment channels via worker
- [ ] Test create transaction via worker
- [ ] Test end-to-end flow
- [ ] Verify no errors

---

## 🟢 Priority 3: Monitoring & Optimization (Ongoing)

### Daily Monitoring
- [ ] Check Vercel logs for errors
- [ ] Check Cloudflare metrics (if using worker)
- [ ] Monitor transaction success rate
- [ ] Check payment callback working

### Weekly Review
- [ ] Review failed transactions
- [ ] Check payment method performance
- [ ] Analyze response times
- [ ] Update documentation if needed

### Monthly Tasks
- [ ] Review Tripay fees
- [ ] Check for new payment methods
- [ ] Sync payment channels
- [ ] Update credentials if needed

---

## 🐛 Troubleshooting Checklist

### If Payment Fails
- [ ] User is logged in
- [ ] Amount >= 10,000 IDR
- [ ] Payment method is active
- [ ] Tripay credentials correct
- [ ] Network connection stable
- [ ] Check browser console for errors
- [ ] Check Vercel logs
- [ ] Check database for transaction

### If CORS Error
- [ ] API route has CORS headers
- [ ] Origin is allowed
- [ ] Redeploy if needed
- [ ] Clear browser cache

### If Signature Invalid
- [ ] Private key is correct
- [ ] Merchant code is correct
- [ ] Amount format is correct
- [ ] No extra spaces in credentials

---

## 📊 Success Metrics

### Current Setup Working
- [ ] 0 errors in last 24 hours
- [ ] 100% transaction creation success
- [ ] < 2 seconds response time
- [ ] Payment page loads correctly
- [ ] Callback updates status

### Cloudflare Worker Working
- [ ] Worker deployed successfully
- [ ] < 100ms response time
- [ ] 0% error rate
- [ ] Global CDN active
- [ ] Cost = $0

---

## 📝 Notes

**Issues Encountered:**
```
(document any issues here)
```

**Solutions Applied:**
```
(document solutions here)
```

**Performance Metrics:**
```
- Average response time: _____ ms
- Success rate: _____ %
- Error rate: _____ %
```

**Next Steps:**
```
(what to do next)
```

---

## ✅ Final Verification

Before marking as complete:

- [ ] Current setup tested and working
- [ ] At least 1 successful test transaction
- [ ] Database updated correctly
- [ ] Payment page opens
- [ ] No console errors
- [ ] No Vercel errors
- [ ] Documentation updated
- [ ] Team notified

---

**Status:** ⬜ Not Started / 🟡 In Progress / ✅ Complete  
**Last Updated:** ___________  
**Updated By:** ___________

🚀 **Start with Priority 1!**
