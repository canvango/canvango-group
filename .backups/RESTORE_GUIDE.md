# Backup Restore Guide

## 📦 Available Checkpoints

Lihat folder `.backups/` untuk daftar checkpoint yang tersedia.

---

## 🔄 Cara Restore Checkpoint

### Option 1: Full Restore (Recommended)
Restore semua file dari checkpoint:

```powershell
# Ganti [CHECKPOINT_NAME] dengan nama folder checkpoint
Copy-Item -Path ".backups\[CHECKPOINT_NAME]\*" -Destination "." -Recurse -Force
```

**Contoh:**
```powershell
Copy-Item -Path ".backups\checkpoint_2025-11-18_20-56-20\*" -Destination "." -Recurse -Force
```

### Option 2: Selective Restore
Restore file/folder tertentu saja:

```powershell
# Restore src folder saja
Copy-Item -Path ".backups\[CHECKPOINT_NAME]\src" -Destination "." -Recurse -Force

# Restore config files saja
Copy-Item -Path ".backups\[CHECKPOINT_NAME]\package.json" -Destination "." -Force
Copy-Item -Path ".backups\[CHECKPOINT_NAME]\tsconfig.json" -Destination "." -Force
```

### Option 3: Compare Before Restore
Bandingkan file sebelum restore:

```powershell
# Compare file content
$current = Get-Content "src\main.tsx"
$backup = Get-Content ".backups\[CHECKPOINT_NAME]\src\main.tsx"
Compare-Object $current $backup
```

---

## ⚠️ Important Notes

1. **Backup node_modules**: Checkpoint TIDAK menyimpan `node_modules/`. Setelah restore, jalankan:
   ```powershell
   npm install
   ```

2. **Environment files**: File `.env` tidak di-backup untuk keamanan. Pastikan `.env` Anda tetap ada.

3. **Git status**: Setelah restore, cek git status:
   ```powershell
   git status
   ```

4. **Rebuild**: Setelah restore, rebuild project:
   ```powershell
   npm run build
   ```

---

## 📋 Checkpoint Contents

Setiap checkpoint berisi:
- ✅ `src/` - Full source code
- ✅ `package.json` - Dependencies
- ✅ `tsconfig.json` - TypeScript config
- ✅ `vite.config.ts` - Build config
- ✅ `tailwind.config.js` - Styling config

**TIDAK termasuk:**
- ❌ `node_modules/` - Install ulang dengan `npm install`
- ❌ `.env` files - Untuk keamanan
- ❌ `dist/` - Build output
- ❌ `.git/` - Git history

---

## 🗑️ Cleanup Old Backups

Hapus checkpoint lama untuk menghemat space:

```powershell
# List all checkpoints
Get-ChildItem -Path ".backups" -Directory | Sort-Object Name

# Delete specific checkpoint
Remove-Item -Path ".backups\[CHECKPOINT_NAME]" -Recurse -Force

# Keep only last 5 checkpoints
Get-ChildItem -Path ".backups" -Directory | Sort-Object Name -Descending | Select-Object -Skip 5 | Remove-Item -Recurse -Force
```

---

## 🆘 Emergency Restore

Jika project rusak total:

```powershell
# 1. Restore dari checkpoint terbaru
$latest = Get-ChildItem -Path ".backups" -Directory | Sort-Object Name -Descending | Select-Object -First 1
Copy-Item -Path "$($latest.FullName)\*" -Destination "." -Recurse -Force

# 2. Install dependencies
npm install

# 3. Rebuild
npm run build

# 4. Test
npm run dev
```

---

**Last Updated**: 18 November 2025
