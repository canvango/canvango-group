# Fix Account Pool - Database Migration

## 🐛 Problem

Error: **"Failed to save fields"** pada `/admin/products` → Account Pool tab

## 🔍 Root Cause

Tables `product_account_fields` dan `product_accounts` belum ada di database. Migration belum dijalankan.

## ✅ Solution

### Option 1: Run Migration via Supabase Dashboard (Recommended)

1. **Login ke Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Pilih project Anda

2. **Buka SQL Editor**
   - Sidebar → SQL Editor
   - Klik "New Query"

3. **Copy & Paste Migration**
   - Buka file: `supabase/migrations/003_create_product_account_pool.sql`
   - Copy semua isinya
   - Paste ke SQL Editor

4. **Run Migration**
   - Klik tombol "Run" atau tekan Ctrl+Enter
   - Tunggu sampai selesai (✓ Success)

5. **Verify Tables Created**
   ```sql
   -- Check tables exist
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('product_account_fields', 'product_accounts');
   ```

### Option 2: Run via Supabase CLI (If you have it)

```bash
# Make sure you're in project root
cd /path/to/your/project

# Run migration
supabase db push

# Or apply specific migration
supabase migration up
```

### Option 3: Manual SQL Execution

Jika tidak bisa akses Supabase Dashboard, jalankan SQL ini langsung:

```sql
-- 1. Create product_account_fields table
CREATE TABLE IF NOT EXISTS product_account_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  field_name VARCHAR(100) NOT NULL,
  field_type VARCHAR(20) NOT NULL CHECK (field_type IN ('text', 'password', 'email', 'url', 'textarea')),
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_account_fields_product_id 
  ON product_account_fields(product_id);

-- 2. Create product_accounts table
CREATE TABLE IF NOT EXISTS product_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  account_data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'sold', 'claimed', 'replaced')),
  assigned_to_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  assigned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_accounts_product_id 
  ON product_accounts(product_id);

CREATE INDEX IF NOT EXISTS idx_product_accounts_status 
  ON product_accounts(product_id, status);

CREATE INDEX IF NOT EXISTS idx_product_accounts_transaction 
  ON product_accounts(assigned_to_transaction_id);

-- 3. Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Add triggers
DROP TRIGGER IF EXISTS update_product_account_fields_updated_at ON product_account_fields;
CREATE TRIGGER update_product_account_fields_updated_at
  BEFORE UPDATE ON product_account_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_accounts_updated_at ON product_accounts;
CREATE TRIGGER update_product_accounts_updated_at
  BEFORE UPDATE ON product_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Enable RLS
ALTER TABLE product_account_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_accounts ENABLE ROW LEVEL SECURITY;

-- 6. Add RLS policies
CREATE POLICY "Admin full access to product_account_fields"
  ON product_account_fields
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin full access to product_accounts"
  ON product_accounts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can view their purchased accounts"
  ON product_accounts
  FOR SELECT
  TO authenticated
  USING (
    assigned_to_transaction_id IN (
      SELECT id FROM transactions
      WHERE user_id = auth.uid()
    )
  );
```

## 🧪 Verify Migration Success

Run this query to check:

```sql
-- Check tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('product_account_fields', 'product_accounts');

-- Should return:
-- product_account_fields | 8
-- product_accounts       | 8
```

## 🎯 After Migration

1. **Refresh browser** (clear cache if needed)
2. **Go to Admin → Kelola Produk**
3. **Click eye icon** on any product
4. **Switch to "Account Pool" tab**
5. **Click "Edit Fields"**
6. **Add fields** (Email, Password, etc.)
7. **Click "Save Fields"**
8. ✅ Should work now!

## 📝 Test Checklist

After migration:
- [ ] Can save fields configuration
- [ ] Can add account to pool
- [ ] Stock count updates
- [ ] Can edit available account
- [ ] Can delete available account
- [ ] User can purchase and get account
- [ ] User can view account in transaction detail

## 🚨 If Still Not Working

Check server logs for detailed error:

```bash
# Check backend logs
# Look for errors related to product_account_fields or product_accounts
```

Common issues:
1. **Foreign key constraint** - Make sure `products` and `transactions` tables exist
2. **RLS policy** - Make sure user has admin role
3. **Auth context** - Make sure `auth.uid()` is working

## 📞 Need Help?

If migration fails, check:
1. Do `products` table exist?
2. Do `transactions` table exist?
3. Does `uuid_generate_v4()` extension exist?

Run this to check:

```sql
-- Check required tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'transactions', 'users');

-- Check uuid extension
SELECT * FROM pg_extension WHERE extname = 'uuid-ossp';
```

---

**Status**: Migration file ready at `supabase/migrations/003_create_product_account_pool.sql`

**Next**: Run migration via Supabase Dashboard or CLI
