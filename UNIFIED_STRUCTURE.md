# 🎯 Unified Project Structure

## ✅ Penggabungan Backend Selesai!

Backend telah dipindahkan dari `canvango-app/backend/` ke `server/` untuk struktur yang lebih bersih dan unified.

---

## 📁 Struktur Baru

```
canvango-member-area/
├── src/                          # Frontend (React + Vite)
│   ├── features/
│   │   └── member-area/
│   │       ├── pages/           # User & Admin pages
│   │       ├── components/      # UI components
│   │       └── services/        # API calls
│   └── shared/                  # Shared utilities
│
├── server/                       # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── controllers/         # 15 controllers
│   │   ├── routes/              # 15 route files
│   │   ├── models/              # 9 models
│   │   ├── middleware/          # Auth, CORS, rate limit
│   │   ├── database/            # Migrations & schema
│   │   ├── config/              # Database, CORS, Supabase
│   │   ├── utils/               # JWT, cache, response
│   │   └── types/               # TypeScript types
│   ├── dist/                    # Build output
│   ├── tsconfig.json            # Server TypeScript config
│   ├── jest.config.js           # Server test config
│   ├── .env.example             # Environment template
│   └── .gitignore               # Server gitignore
│
├── public/                       # Static assets
├── dist/                         # Frontend build output
├── server.js                     # Production server (single port)
├── package.json                  # Unified dependencies
├── vite.config.ts                # Frontend build config
├── tsconfig.json                 # Frontend TypeScript config
├── Dockerfile                    # Docker configuration
└── .dockerignore                 # Docker ignore rules
```

---

## 🔄 Perubahan yang Dilakukan

### **1. Struktur Folder**
```bash
# Sebelum
canvango-app/backend/src/  → Backend code
canvango-app/backend/dist/ → Backend build

# Sesudah
server/src/                → Backend code
server/dist/               → Backend build
```

### **2. Package.json Scripts**

**Sebelum:**
```json
{
  "build:backend": "cd canvango-app/backend && npm run build",
  "dev:backend": "cd canvango-app/backend && npm run dev"
}
```

**Sesudah:**
```json
{
  "build:server": "tsc -p server/tsconfig.json",
  "dev:server": "tsx watch server/src/index.ts",
  "dev:all": "concurrently \"npm run dev\" \"npm run dev:server\"",
  "migrate": "tsx server/src/database/migrate.ts",
  "seed": "tsx server/src/database/seed.ts",
  "test:server": "jest --config server/jest.config.js"
}
```

### **3. Dependencies**

**Ditambahkan ke root package.json:**
- Backend dependencies: `bcrypt`, `cors`, `helmet`, `jsonwebtoken`, `pg`, dll
- Backend dev dependencies: `@types/express`, `@types/bcrypt`, `tsx`, `supertest`, dll
- Build tool: `concurrently` untuk run dev:all

### **4. Server.js**

**Path update:**
```javascript
// Sebelum
import('./canvango-app/backend/dist/index.js')
dotenv.config({ path: './canvango-app/backend/.env' })

// Sesudah
import('./server/dist/index.js')
dotenv.config({ path: './server/.env' })
```

### **5. Environment Files**

```bash
# Sebelum
canvango-app/backend/.env
canvango-app/backend/.env.example

# Sesudah
server/.env
server/.env.example
```

---

## 🚀 Cara Menggunakan

### **Development Mode**

```bash
# Opsi 1: Run semua sekaligus (recommended)
npm run dev:all

# Opsi 2: Run terpisah (2 terminals)
npm run dev          # Frontend: http://localhost:5173
npm run dev:server   # Backend: http://localhost:5000
```

### **Production Mode**

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp server/.env.example server/.env
# Edit server/.env dengan credentials Anda

# 3. Build
npm run build

# 4. Start
npm start

# Access: http://localhost:3000
```

### **Database Management**

```bash
# Run migrations
npm run migrate

# Seed data
npm run seed
```

### **Testing**

```bash
# Test frontend
npm test

# Test backend
npm run test:server
```

---

## 🐳 Docker Deployment

### **Build Image**

```bash
docker build -t canvango-app .
```

### **Run Container**

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e VITE_SUPABASE_URL=your_url \
  -e VITE_SUPABASE_ANON_KEY=your_key \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  -e JWT_SECRET=your_secret \
  -e JWT_REFRESH_SECRET=your_refresh_secret \
  canvango-app
```

### **Docker Compose**

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - server/.env
    restart: unless-stopped
```

---

## 📦 Deployment Platforms

### **Vercel**

```bash
# Build command
npm run build

# Start command
npm start

# Root directory
./
```

### **Railway**

```bash
# Build command
npm run build

# Start command
npm start

# Port
3000
```

### **Render**

```bash
# Build command
npm run build

# Start command
npm start

# Environment
Node 18+
```

---

## ✅ Keuntungan Struktur Baru

### **1. Lebih Bersih**
```
✅ server/ → Jelas ini backend
✅ src/ → Jelas ini frontend
✅ Tidak ada nested folder canvango-app/backend/
```

### **2. Unified Dependencies**
```
✅ 1 package.json untuk semua dependencies
✅ 1 node_modules untuk frontend & backend
✅ Lebih mudah manage versions
```

### **3. Simplified Scripts**
```bash
# Sebelum
cd canvango-app/backend && npm run dev

# Sesudah
npm run dev:server
```

### **4. Better Development**
```bash
# Run semua sekaligus
npm run dev:all

# ✅ Frontend + Backend dalam 1 command
# ✅ Hot reload keduanya
# ✅ Tidak perlu 2 terminals
```

### **5. Easier Deployment**
```bash
# 1 build command
npm run build

# ✅ Build frontend → dist/
# ✅ Build backend → server/dist/
# ✅ Ready to deploy
```

---

## 🔧 Migration Checklist

- [x] Copy backend code ke `server/src/`
- [x] Create `server/tsconfig.json`
- [x] Create `server/jest.config.js`
- [x] Create `server/.gitignore`
- [x] Copy `server/.env.example`
- [x] Update `package.json` scripts
- [x] Merge dependencies ke root
- [x] Update `server.js` paths
- [x] Create `Dockerfile`
- [x] Create `.dockerignore`
- [x] Create documentation

---

## 🎯 Next Steps

### **1. Install Dependencies**
```bash
npm install
```

### **2. Setup Environment**
```bash
# Copy environment template
cp server/.env.example server/.env

# Edit dengan credentials Anda
notepad server/.env
```

### **3. Test Development**
```bash
# Run all
npm run dev:all

# Check:
# ✅ Frontend: http://localhost:5173
# ✅ Backend: http://localhost:5000
# ✅ No errors
```

### **4. Test Production**
```bash
# Build
npm run build

# Start
npm start

# Check:
# ✅ Server: http://localhost:3000
# ✅ Frontend loads
# ✅ API works
```

### **5. Optional: Remove Old Backend**
```bash
# Setelah yakin semuanya works
Remove-Item -Recurse -Force canvango-app/backend
```

---

## 🐛 Troubleshooting

### **Issue: Module not found**
```bash
# Solution: Install dependencies
npm install
```

### **Issue: Build fails**
```bash
# Check TypeScript config
cat server/tsconfig.json

# Try clean build
Remove-Item -Recurse -Force server/dist
npm run build:server
```

### **Issue: Server won't start**
```bash
# Check environment
cat server/.env

# Check if built
ls server/dist

# Try rebuild
npm run build:server
```

### **Issue: Database connection fails**
```bash
# Check Supabase credentials in server/.env
# Verify:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - DATABASE_URL (if using direct connection)
```

---

## 📚 File Locations Reference

### **Backend Code**
```
server/src/
├── controllers/     → API controllers
├── routes/          → Express routes
├── models/          → Data models
├── middleware/      → Auth, CORS, etc
├── database/        → Migrations, schema
├── config/          → Configuration
├── utils/           → Utilities
└── types/           → TypeScript types
```

### **Frontend Code**
```
src/
├── features/
│   └── member-area/
│       ├── pages/       → React pages
│       ├── components/  → React components
│       └── services/    → API services
└── shared/              → Shared code
```

### **Configuration**
```
server/tsconfig.json     → Backend TypeScript
tsconfig.json            → Frontend TypeScript
vite.config.ts           → Frontend build
server.js                → Production server
package.json             → Dependencies & scripts
```

---

## 🎉 Summary

✅ **Backend dipindahkan** dari `canvango-app/backend/` ke `server/`
✅ **Dependencies unified** dalam 1 package.json
✅ **Scripts simplified** untuk development & production
✅ **Docker ready** dengan Dockerfile & .dockerignore
✅ **Deployment ready** untuk Vercel, Railway, Render
✅ **Struktur lebih bersih** dan mudah dipahami

**Aplikasi siap untuk development dan production deployment!** 🚀
