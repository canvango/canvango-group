# 🚀 START HERE - Canvango Unified Application

## ⚡ Quick Start (5 Menit)

### **1. Install**
```bash
npm install
```

### **2. Setup Environment**
```bash
cp server/.env.example server/.env
```

Edit `server/.env` dengan credentials Supabase Anda:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
```

### **3. Run**
```bash
npm run dev:all
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 📁 Struktur Project

```
canvango-member-area/
├── src/           # Frontend (React)
├── server/        # Backend (Express)
├── server.js      # Production server
└── package.json   # Dependencies
```

---

## 🛠️ Commands

### **Development**
```bash
npm run dev:all      # Run frontend + backend
npm run dev          # Frontend only
npm run dev:server   # Backend only
```

### **Production**
```bash
npm run build        # Build both
npm start            # Start production server
```

### **Database**
```bash
npm run migrate      # Run migrations
npm run seed         # Seed data
```

### **Testing**
```bash
npm test             # Test frontend
npm run test:server  # Test backend
```

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| **QUICK_START_UNIFIED.md** | Detailed quick start |
| **UNIFIED_STRUCTURE.md** | Complete structure |
| **README_DEPLOYMENT.md** | Deployment guides |
| **PENGGABUNGAN_SELESAI.md** | Migration summary |

---

## 🎯 What Changed?

### **Before**
```
canvango-app/backend/  → Backend (nested)
2 package.json files
2 npm install commands
```

### **After**
```
server/                → Backend (clean)
1 package.json file
1 npm install command
```

---

## ✅ Benefits

- ✅ Simpler structure
- ✅ Faster development
- ✅ Easier deployment
- ✅ Docker ready
- ✅ CI/CD ready

---

## 🐛 Troubleshooting

### Port already in use?
```bash
npx kill-port 5173 5000
```

### Module not found?
```bash
npm install
```

### Build fails?
```bash
rm -rf dist server/dist
npm run build
```

---

## 🚀 Deploy

### **Vercel**
```bash
vercel
```

### **Railway**
```bash
railway up
```

### **Docker**
```bash
docker-compose up -d
```

See **README_DEPLOYMENT.md** for detailed guides.

---

## 🎉 You're Ready!

1. ✅ Run `npm install`
2. ✅ Setup `server/.env`
3. ✅ Run `npm run dev:all`
4. ✅ Start coding!

**Happy coding! 🚀**
