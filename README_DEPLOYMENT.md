# 🚀 Canvango Deployment Guide

Panduan lengkap untuk deploy aplikasi Canvango ke berbagai platform.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm atau yarn
- Supabase account & project
- Git repository

---

## 🏗️ Build & Run Locally

### **Development Mode**

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp server/.env.example server/.env
# Edit server/.env dengan credentials Anda

# 3. Run development servers
npm run dev:all

# Access:
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
```

### **Production Mode**

```bash
# 1. Build
npm run build

# 2. Start
npm start

# Access: http://localhost:3000
```

---

## 🐳 Docker Deployment

### **Option 1: Docker Run**

```bash
# Build image
docker build -t canvango-app .

# Run container
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

### **Option 2: Docker Compose**

```bash
# 1. Setup environment
cp server/.env.example server/.env
# Edit server/.env

# 2. Start
docker-compose up -d

# 3. Check logs
docker-compose logs -f

# 4. Stop
docker-compose down
```

---

## ☁️ Cloud Deployment

### **1. Vercel**

#### **Setup**

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

#### **Configuration**

Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### **Environment Variables**

Di Vercel Dashboard → Settings → Environment Variables:
```
NODE_ENV=production
PORT=3000
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

---

### **2. Railway**

#### **Setup**

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login:
```bash
railway login
```

3. Initialize:
```bash
railway init
```

4. Deploy:
```bash
railway up
```

#### **Configuration**

Railway akan auto-detect `package.json` dan menjalankan:
- Build: `npm run build`
- Start: `npm start`

#### **Environment Variables**

Di Railway Dashboard → Variables:
```
NODE_ENV=production
PORT=3000
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

---

### **3. Render**

#### **Setup**

1. Connect GitHub repository di Render Dashboard

2. Create New Web Service

3. Configure:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Node

#### **Environment Variables**

Di Render Dashboard → Environment:
```
NODE_ENV=production
PORT=3000
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

---

### **4. AWS (EC2)**

#### **Setup**

1. Launch EC2 instance (Ubuntu 22.04)

2. SSH ke instance:
```bash
ssh -i your-key.pem ubuntu@your-ip
```

3. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

4. Install PM2:
```bash
sudo npm install -g pm2
```

5. Clone repository:
```bash
git clone your-repo-url
cd canvango-member-area
```

6. Setup:
```bash
npm install
cp server/.env.example server/.env
nano server/.env  # Edit dengan credentials
npm run build
```

7. Start with PM2:
```bash
pm2 start server.js --name canvango
pm2 save
pm2 startup
```

#### **Nginx Configuration**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

### **5. DigitalOcean App Platform**

#### **Setup**

1. Connect GitHub repository

2. Configure:
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
   - **HTTP Port**: 3000

#### **Environment Variables**

```
NODE_ENV=production
PORT=3000
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
```

---

## 🔐 Environment Variables

### **Required Variables**

```bash
# Node Environment
NODE_ENV=production
PORT=3000

# Supabase (Frontend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Supabase (Backend)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Secrets
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
```

### **Optional Variables**

```bash
# CORS (Development only)
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database (if using direct connection)
DATABASE_URL=postgresql://user:pass@host:5432/db
```

---

## 🔍 Health Check

Semua deployment harus memiliki health check endpoint:

```bash
curl http://your-domain.com/health
```

Response:
```json
{
  "status": "ok",
  "message": "Canvango API is running"
}
```

---

## 📊 Monitoring

### **PM2 (VPS)**

```bash
# Status
pm2 status

# Logs
pm2 logs canvango

# Restart
pm2 restart canvango

# Stop
pm2 stop canvango
```

### **Docker**

```bash
# Logs
docker logs -f container_name

# Stats
docker stats container_name

# Restart
docker restart container_name
```

---

## 🐛 Troubleshooting

### **Build Fails**

```bash
# Clear cache
rm -rf node_modules dist server/dist
npm install
npm run build
```

### **Server Won't Start**

```bash
# Check environment
cat server/.env

# Check build output
ls -la dist/
ls -la server/dist/

# Check logs
npm start
```

### **API Returns 404**

```bash
# Verify routes
curl http://localhost:3000/api/health

# Check server.js
cat server.js
```

### **Database Connection Fails**

```bash
# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/

# Verify credentials in server/.env
```

---

## 🚀 CI/CD Pipeline

GitHub Actions workflow sudah tersedia di `.github/workflows/ci.yml`:

- ✅ Lint code
- ✅ Run tests
- ✅ Build frontend & server
- ✅ Build Docker image
- ✅ Upload artifacts

### **Setup GitHub Secrets**

Di GitHub Repository → Settings → Secrets:

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET
JWT_REFRESH_SECRET
```

---

## 📈 Performance Tips

### **1. Enable Compression**

```javascript
// server/src/index.ts
import compression from 'compression';
app.use(compression());
```

### **2. Add Caching Headers**

```javascript
// Static files
app.use(express.static('dist', {
  maxAge: '1y',
  etag: true
}));
```

### **3. Use CDN**

Upload static assets ke CDN (Cloudflare, AWS CloudFront):
- Images
- CSS
- JavaScript bundles

### **4. Database Connection Pooling**

```javascript
// server/src/config/database.ts
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## 🔒 Security Checklist

- [ ] Environment variables tidak di-commit
- [ ] HTTPS enabled (SSL certificate)
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Helmet middleware enabled
- [ ] Input validation & sanitization
- [ ] JWT secrets strong (min 32 chars)
- [ ] Database credentials secure
- [ ] Regular security updates

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [React Production Build](https://react.dev/learn/start-a-new-react-project)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

## 🆘 Support

Jika ada masalah:

1. Check logs
2. Verify environment variables
3. Test locally first
4. Check health endpoint
5. Review documentation

---

**Happy Deploying! 🚀**
