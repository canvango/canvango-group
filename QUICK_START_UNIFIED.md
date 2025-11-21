# ⚡ Quick Start - Unified Structure

Panduan cepat untuk mulai development dengan struktur baru.

---

## 🚀 Setup (5 Menit)

### **1. Install Dependencies**

```bash
npm install
```

### **2. Setup Environment**

```bash
# Copy template
cp server/.env.example server/.env

# Edit dengan credentials Anda
notepad server/.env
```

**Required variables:**
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars

# Frontend (di root .env)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### **3. Run Development**

```bash
# Opsi 1: Run semua sekaligus (recommended)
npm run dev:all

# Opsi 2: Run terpisah (2 terminals)
npm run dev          # Frontend
npm run dev:server   # Backend
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## 📁 Struktur Project

```
canvango-member-area/
├── src/                    # Frontend (React)
│   └── features/
│       └── member-area/
│           ├── pages/      # React pages
│           ├── components/ # UI components
│           └── services/   # API calls
│
├── server/                 # Backend (Express)
│   └── src/
│       ├── controllers/    # API controllers
│       ├── routes/         # Express routes
│       ├── models/         # Data models
│       ├── middleware/     # Auth, CORS, etc
│       └── database/       # Migrations
│
├── server.js               # Production server
└── package.json            # Unified dependencies
```

---

## 🛠️ Development Commands

### **Frontend**

```bash
# Run dev server
npm run dev

# Build
npm run build:frontend

# Preview build
npm run preview
```

### **Backend**

```bash
# Run dev server
npm run dev:server

# Build
npm run build:server

# Run migrations
npm run migrate

# Seed database
npm run seed
```

### **Full Stack**

```bash
# Run both (recommended)
npm run dev:all

# Build both
npm run build

# Start production
npm start
```

### **Testing**

```bash
# Test frontend
npm test

# Test backend
npm run test:server

# Lint
npm run lint
```

---

## 🔧 Common Tasks

### **Add New API Endpoint**

1. Create controller:
```typescript
// server/src/controllers/myFeature.controller.ts
export const getMyData = async (req, res) => {
  // Your logic
};
```

2. Create route:
```typescript
// server/src/routes/myFeature.routes.ts
import { Router } from 'express';
import { getMyData } from '../controllers/myFeature.controller.js';

const router = Router();
router.get('/my-data', getMyData);

export default router;
```

3. Register route:
```typescript
// server/src/index.ts
import myFeatureRoutes from './routes/myFeature.routes.js';
app.use('/api/my-feature', myFeatureRoutes);
```

### **Add New Frontend Page**

1. Create page:
```typescript
// src/features/member-area/pages/MyPage.tsx
export default function MyPage() {
  return <div>My Page</div>;
}
```

2. Add route:
```typescript
// src/features/member-area/routes/index.tsx
import MyPage from '../pages/MyPage';

<Route path="/my-page" element={<MyPage />} />
```

### **Add Database Migration**

```bash
# Create migration file
# server/src/database/migrations/009_my_migration.sql

CREATE TABLE my_table (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

# Run migration
npm run migrate
```

---

## 🐛 Troubleshooting

### **Port Already in Use**

```bash
# Kill process on port 5173 (frontend)
npx kill-port 5173

# Kill process on port 5000 (backend)
npx kill-port 5000
```

### **Module Not Found**

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### **Build Fails**

```bash
# Clean build
rm -rf dist server/dist
npm run build
```

### **Database Connection Error**

```bash
# Check Supabase credentials
cat server/.env

# Test connection
curl https://your-project.supabase.co/rest/v1/
```

---

## 📦 Production Deployment

### **Build**

```bash
npm run build
```

**Output:**
- `dist/` - Frontend build
- `server/dist/` - Backend build

### **Start**

```bash
npm start
```

**Access:** http://localhost:3000

### **Docker**

```bash
# Build image
docker build -t canvango-app .

# Run container
docker run -p 3000:3000 canvango-app
```

---

## 🎯 Next Steps

1. ✅ Setup environment variables
2. ✅ Run `npm run dev:all`
3. ✅ Test login & features
4. ✅ Make your changes
5. ✅ Test production build
6. ✅ Deploy!

---

## 📚 Documentation

- **UNIFIED_STRUCTURE.md** - Struktur project lengkap
- **README_DEPLOYMENT.md** - Panduan deployment
- **server/src/database/README.md** - Database schema
- **SINGLE_PORT_IMPLEMENTATION_SUMMARY.md** - Single port setup

---

## 🆘 Need Help?

1. Check logs di terminal
2. Check browser console (F12)
3. Verify environment variables
4. Review documentation
5. Test API dengan curl/Postman

---

**Happy Coding! 🚀**
