# Migration and Seeding Quick Guide

## Quick Start

### 1. Setup Database
```bash
# Create database
psql -U postgres -c "CREATE DATABASE canvango_db;"

# Run migrations
npm run migrate

# Seed with sample data
npm run seed
```

## What Gets Created

### Migrations (7 files)
1. **Users table** - Authentication and user management
2. **Transactions table** - Purchase tracking
3. **TopUps table** - Balance top-up requests
4. **Claims table** - Warranty claims
5. **Tutorials table** - Educational content
6. **Admin Audit Logs table** - Admin action tracking
7. **System Settings table** - Application configuration

### Seed Data
- **1 Admin**: admin@canvango.com / admin123
- **5 Members**: password123 for all
  - john.doe@example.com
  - jane.smith@example.com
  - bob.wilson@example.com
  - alice.johnson@example.com
  - charlie.brown@example.com
- **9 Transactions** - Various products and statuses
- **5 Top-ups** - Different payment methods
- **2 Claims** - Sample warranty claims
- **6 Tutorials** - Facebook Ads guides

## Migration System Features

- ✅ Version tracking (prevents duplicate runs)
- ✅ Transaction-based (all-or-nothing)
- ✅ Ordered execution (001, 002, 003...)
- ✅ Idempotent (safe to run multiple times)

## Common Commands

```bash
# Run migrations
npm run migrate

# Seed database
npm run seed

# Reset database (careful!)
psql -U postgres -c "DROP DATABASE canvango_db;"
psql -U postgres -c "CREATE DATABASE canvango_db;"
npm run migrate
npm run seed
```

For detailed documentation, see `DATABASE.md`
