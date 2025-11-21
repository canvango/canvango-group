# Analisa Konfigurasi Supabase

## 📋 Overview

Aplikasi ini menggunakan Supabase untuk:
1. **Authentication** - Login/Register user
2. **Database** - Menyimpan data user, transactions, products
3. **Password Reset** - Fitur forgot password

## 🔍 Current Configuration

### Environment Variables

**File: `canvango-app/frontend/.env`**
```env
VITE_API_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

**Status:** ❌ Kosong (Not configured)

### Supabase Client

**File: `canvango-app/frontend/src/utils/supabase.ts`**
```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase credentials not found.');
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };
```

**Status:** ✅ Safe (Uses placeholder if not configured)

---

## 🗄️ Expected Database Schema

### Table: `users`

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('guest', 'member', 'admin')),
  balance BIGINT DEFAULT 0,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Index for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### Table: `products`

```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'bm' | 'personal'
  type TEXT NOT NULL, -- 'verified', 'limit_250', 'bm50', etc.
  price BIGINT NOT NULL,
  stock INTEGER DEFAULT 0,
  description TEXT,
  features JSONB,
  warranty_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_type ON products(type);
CREATE INDEX idx_products_active ON products(is_active);

-- RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active products
CREATE POLICY "Anyone can read active products"
  ON products FOR SELECT
  USING (is_active = true);
```

### Table: `transactions`

```sql
-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('account', 'topup')),
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  amount BIGINT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  payment_method TEXT,
  accounts JSONB, -- Array of purchased accounts
  warranty_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);

-- RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own transactions
CREATE POLICY "Users can read own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);
```

### Table: `warranty_claims`

```sql
-- Warranty claims table
CREATE TABLE warranty_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_warranty_claims_user ON warranty_claims(user_id);
CREATE INDEX idx_warranty_claims_status ON warranty_claims(status);

-- RLS
ALTER TABLE warranty_claims ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own claims
CREATE POLICY "Users can read own claims"
  ON warranty_claims FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create claims
CREATE POLICY "Users can create claims"
  ON warranty_claims FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Table: `verified_bm_orders`

```sql
-- Verified BM orders table
CREATE TABLE verified_bm_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  urls TEXT[] NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'success', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_verified_bm_orders_user ON verified_bm_orders(user_id);
CREATE INDEX idx_verified_bm_orders_status ON verified_bm_orders(status);

-- RLS
ALTER TABLE verified_bm_orders ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own orders
CREATE POLICY "Users can read own orders"
  ON verified_bm_orders FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create orders
CREATE POLICY "Users can create orders"
  ON verified_bm_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Table: `api_keys`

```sql
-- API keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key TEXT UNIQUE NOT NULL,
  name TEXT,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_key ON api_keys(key);

-- RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own keys
CREATE POLICY "Users can read own keys"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 🔧 Setup Instructions

### Step 1: Create Supabase Project

1. **Go to** https://supabase.com
2. **Click** "New Project"
3. **Fill in:**
   - Project name: `canvango-group`
   - Database password: (generate strong password)
   - Region: (closest to your users)
4. **Wait** for project to be created (~2 minutes)

### Step 2: Get Credentials

1. **Go to** Project Settings → API
2. **Copy:**
   - Project URL: `https://xxxxx.supabase.co`
   - anon/public key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 3: Update Environment Variables

**File: `canvango-app/frontend/.env`**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Run SQL Migrations

1. **Go to** SQL Editor in Supabase dashboard
2. **Create new query**
3. **Copy and paste** the SQL from above (all tables)
4. **Run** the query
5. **Verify** tables are created in Table Editor

### Step 5: Enable Email Auth

1. **Go to** Authentication → Providers
2. **Enable** Email provider
3. **Configure:**
   - Confirm email: ON (recommended)
   - Secure email change: ON
   - Secure password change: ON

### Step 6: Configure Email Templates (Optional)

1. **Go to** Authentication → Email Templates
2. **Customize:**
   - Confirmation email
   - Password reset email
   - Magic link email

### Step 7: Test Connection

1. **Restart** dev server
   ```bash
   npm run dev
   ```

2. **Try to register** a new user
3. **Check** Supabase dashboard → Authentication → Users
4. **Verify** user is created

---

## 🔐 Security Configuration

### Row Level Security (RLS)

**Why RLS?**
- Prevents users from accessing other users' data
- Enforced at database level
- Cannot be bypassed from frontend

**Example:**
```sql
-- Without RLS: User can see ALL transactions
SELECT * FROM transactions;

-- With RLS: User can only see THEIR transactions
SELECT * FROM transactions; -- Automatically filtered by auth.uid()
```

### API Keys Security

**Best Practices:**
1. **Never expose** service_role_key in frontend
2. **Only use** anon_key in frontend
3. **Enable** RLS on all tables
4. **Validate** all inputs on backend

### Password Security

**Supabase handles:**
- ✅ Password hashing (bcrypt)
- ✅ Salt generation
- ✅ Secure storage
- ✅ Password reset flow

---

## 📊 Current vs Expected

### Current State

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase Project | ❌ Not created | Need to create |
| Environment Variables | ❌ Empty | Need credentials |
| Database Tables | ❌ Not created | Need to run migrations |
| RLS Policies | ❌ Not configured | Need to enable |
| Email Auth | ❌ Not configured | Need to enable |

### Expected State (After Setup)

| Component | Status | Notes |
|-----------|--------|-------|
| Supabase Project | ✅ Created | Project ready |
| Environment Variables | ✅ Configured | Credentials added |
| Database Tables | ✅ Created | All tables exist |
| RLS Policies | ✅ Enabled | Security enforced |
| Email Auth | ✅ Configured | Auth working |

---

## 🧪 Testing Supabase Connection

### Test 1: Check Client Initialization

```typescript
// In browser console
console.log(import.meta.env.VITE_SUPABASE_URL);
// Should show: https://your-project.supabase.co

console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
// Should show: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Test 2: Test Authentication

```typescript
// Try to register
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'password123'
});

console.log('Register result:', { data, error });
```

### Test 3: Test Database Query

```typescript
// Try to fetch products
const { data, error } = await supabase
  .from('products')
  .select('*')
  .limit(10);

console.log('Products:', { data, error });
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid API key"

**Cause:** Wrong anon key or expired key

**Solution:**
1. Go to Supabase dashboard
2. Project Settings → API
3. Copy fresh anon key
4. Update `.env`
5. Restart dev server

### Issue 2: "relation 'users' does not exist"

**Cause:** Tables not created

**Solution:**
1. Go to SQL Editor
2. Run migration SQL
3. Verify in Table Editor

### Issue 3: "Row Level Security policy violation"

**Cause:** RLS enabled but no policies

**Solution:**
1. Check RLS policies in Table Editor
2. Add missing policies
3. Test again

### Issue 4: "Email not confirmed"

**Cause:** Email confirmation required

**Solution:**
1. Check email for confirmation link
2. Or disable email confirmation in settings
3. Or manually confirm in dashboard

---

## 💡 Alternative: Continue Without Supabase

### Pros
- ✅ Faster development
- ✅ No external dependencies
- ✅ Works offline
- ✅ No costs

### Cons
- ⚠️ No real authentication
- ⚠️ No data persistence
- ⚠️ Cannot deploy to production
- ⚠️ Limited testing

### When to Use
- Early development
- UI/UX prototyping
- Demo purposes
- Learning/training

### When NOT to Use
- Production deployment
- Real user data
- Payment processing
- Security-critical features

---

## 🎯 Recommendation

### For Development (Now)
**Continue with Mock Mode**
- Focus on UI/UX
- Test user flows
- Fix bugs
- Polish features

### For Production (Later)
**Setup Supabase**
- Create project
- Run migrations
- Configure auth
- Test thoroughly
- Deploy

---

## 📝 Checklist

### Before Setup
- [ ] Decide if you need Supabase
- [ ] Understand the costs
- [ ] Plan database schema
- [ ] Review security requirements

### During Setup
- [ ] Create Supabase project
- [ ] Get credentials
- [ ] Update `.env`
- [ ] Run SQL migrations
- [ ] Enable RLS
- [ ] Configure email auth
- [ ] Test connection

### After Setup
- [ ] Test registration
- [ ] Test login
- [ ] Test data queries
- [ ] Verify RLS works
- [ ] Test password reset
- [ ] Monitor usage
- [ ] Setup backups

---

**Status:** Supabase NOT configured (using Mock Mode)
**Recommendation:** Continue with Mock Mode for now, setup Supabase when ready for production
