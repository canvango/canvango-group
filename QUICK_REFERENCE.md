# 🚀 Quick Reference - Personal Accounts

## 📊 Current Status

```
✅ 11 Products Active
✅ 5 Products with Stock (28 accounts)
❌ 6 Products Out of Stock
✅ 3 Categories Active
💰 Price Range: Rp 10K - 250K
```

---

## 🎯 Products Overview

### ✅ With Stock
| Product | Price | Stock | Category |
|---------|-------|-------|----------|
| Basic 1Y | 75K | 10 | aged_1year |
| Old 2009-2023 | 100K | 5 | aged_3years |
| Standard 2Y | 125K | 8 | aged_2years |
| Premium 3Y+ | 175K | 3 | aged_3years |
| Vintage 2009-2015 | 250K | 2 | aged_3years |

### ❌ Out of Stock
| Product | Price | Category |
|---------|-------|----------|
| Muda 2025 | 10K | aged_1year |
| Spam 2009-2020 | 35K | aged_3years |
| Vietnam 2023-2025 | 70K | aged_1year |
| ID Card + Email Verif | 95K | aged_1year |
| US 2024 | 100K | aged_1year |
| Old 2015-2019 | 100K | aged_3years |

---

## ⚡ Quick Actions

### View All Products
```sql
SELECT product_name, price, 
  (SELECT COUNT(*) FROM product_accounts 
   WHERE product_id = p.id AND status = 'available') as stock
FROM products p
WHERE product_type = 'personal_account' AND is_active = true;
```

### Add Stock (Single)
```sql
INSERT INTO product_accounts (product_id, account_data, status)
VALUES ('[PRODUCT_ID]', '{"email":"...","password":"..."}', 'available');
```

### Update Price
```sql
UPDATE products SET price = [NEW_PRICE] WHERE id = '[PRODUCT_ID]';
```

### Check Low Stock (< 5)
```sql
SELECT product_name, COUNT(*) as stock
FROM products p
JOIN product_accounts pa ON p.id = pa.product_id
WHERE p.product_type = 'personal_account' 
  AND pa.status = 'available'
GROUP BY p.id, product_name
HAVING COUNT(*) < 5;
```

---

## 🔗 Quick Links

- **Frontend:** `/akun-personal`
- **Admin:** `/admin/products`
- **Docs:** `PERSONAL_ACCOUNT_SAMPLE_DATA.md`
- **SQL:** `SQL_QUERIES_PERSONAL_ACCOUNTS.md`
- **Guide:** `ADMIN_GUIDE_PERSONAL_ACCOUNTS.md`

---

## 📞 Emergency Contacts

**Issue:** Product not showing  
**Check:** `is_active`, `stock_status`, available stock

**Issue:** Stock not decreasing  
**Check:** Transaction status, purchase record, account assignment

**Issue:** Price not updating  
**Check:** Cache, updated_at timestamp

---

## 💡 Pro Tips

1. Always backup before bulk operations
2. Use transactions for complex updates
3. Monitor stock levels daily
4. Update prices based on demand
5. Check security advisors weekly

---

**Last Updated:** 28 Nov 2025  
**Version:** 1.0
