# Canvango Group Web Application

A comprehensive web application for digital marketing services and business account verification. The platform provides role-based access control with three user types: Guest (visitors), Member (registered users), and Admin (system administrators).

## 🚀 Features

### For All Users (Guest & Member)
- 📊 Dashboard with system updates and announcements
- 📱 Service information pages (Business Manager Accounts, Personal Accounts, Verified BM Services, API)
- 🔐 Secure authentication system

### For Members
- 💳 Transaction history tracking
- 💰 Balance top-up functionality
- 🛡️ Warranty claim submission
- 📚 Tutorial and guide access
- 👤 Profile management

### For Administrators
- 👥 User management (view, edit, delete, role assignment)
- 💼 Transaction management (view, update status, refund)
- 📋 Claim management (review, approve/reject, process refunds)
- 📖 Tutorial management (create, edit, delete)
- 📊 System statistics and analytics
- ⚙️ System settings configuration
- 📝 Audit log tracking

## 📁 Project Structure

```
canvango-app/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts (Auth, Toast)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utility functions
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                  # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API route definitions
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   ├── config/          # Configuration files
│   │   └── database/        # Database migrations and seeds
│   └── package.json
│
├── API_DOCUMENTATION.md      # Complete API documentation
├── DEPLOYMENT_GUIDE.md       # Production deployment guide
└── README.md                 # This file
```

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **State Management:** Context API + React Query
- **Build Tool:** Vite
- **Testing:** Vitest + React Testing Library

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 14+
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Validation:** express-validator
- **Security:** helmet, cors, rate-limiting
- **Testing:** Jest + Supertest

### Database
- **Primary Database:** PostgreSQL (via Supabase)
- **Backend-as-a-Service:** Supabase
- **Migration Tool:** Custom SQL migrations
- **Connection Pooling:** Supabase Client
- **Authentication:** Supabase Auth

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** 9.x or higher (comes with Node.js)
- **Git** (for version control)
- **Supabase Account** ([Sign up](https://supabase.com))

### Verify Installation

```bash
node --version    # Should be v18.x or higher
npm --version     # Should be v9.x or higher
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd canvango-app
```

### 2. Supabase Setup

#### Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name:** canvango-app (or your preferred name)
   - **Database Password:** Choose a strong password
   - **Region:** Select closest to your users
4. Click "Create new project" and wait for setup to complete (2-3 minutes)

#### Get Supabase Credentials

Once your project is ready:

1. Go to **Project Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. Copy the following credentials:
   - **Project URL:** `https://xxxxx.supabase.co`
   - **anon public key:** For frontend (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role key:** For backend (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

⚠️ **Important:** Never expose the `service_role` key in frontend code or public repositories!

#### Configure Supabase Authentication

1. Go to **Authentication** > **Providers** in Supabase Dashboard
2. Enable **Email** provider
3. Configure email templates (optional):
   - Go to **Authentication** > **Email Templates**
   - Customize "Confirm signup", "Reset password", etc.
4. Set **Site URL** to your frontend URL:
   - Development: `http://localhost:5173`
   - Production: Your production domain

### 3. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Configuration (for migrations only)
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_database_password

# JWT Configuration (not used with Supabase Auth)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
```

**Note:** The database configuration is only needed for running migrations. All runtime database operations use the Supabase client.

#### Run Database Migrations

```bash
npm run migrate
```

This will create all necessary tables in your Supabase database:
- users
- transactions
- topups
- claims
- tutorials
- admin_audit_logs
- system_settings

It will also create database functions for:
- `update_user_balance` - Atomic balance updates
- `increment_tutorial_views` - Atomic view count increments

#### Generate TypeScript Types

Generate type-safe database types from your Supabase schema:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

Replace `YOUR_PROJECT_ID` with your Supabase project ID (found in Project Settings).

**Note:** Run this command whenever you make schema changes to keep types in sync.

#### Seed Database (Optional)

```bash
npm run seed
```

This will create:
- Admin user (admin@canvango.com / Admin123!)
- Sample member users
- Sample transactions
- Sample tutorials

#### Start Backend Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

Backend will be available at `http://localhost:5000`

### 4. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
VITE_APP_NAME=Canvango Group
VITE_APP_VERSION=1.0.0
```

**Important:** Use the **anon public key** (not the service_role key) for the frontend.

#### Start Frontend Development Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 5. Access the Application

Open your browser and navigate to:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api

#### Default Login Credentials

**Admin Account:**
- Email: `admin@canvango.com`
- Password: `Admin123!`

**Member Account (if seeded):**
- Email: `member@canvango.com`
- Password: `Member123!`

## 📝 Environment Variables

### Backend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 5000 | Yes |
| `NODE_ENV` | Environment (development/production) | development | Yes |
| `SUPABASE_URL` | Supabase project URL | - | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | - | Yes |
| `DB_HOST` | PostgreSQL host (for migrations) | db.xxxxx.supabase.co | Yes |
| `DB_PORT` | PostgreSQL port | 5432 | Yes |
| `DB_NAME` | Database name | postgres | Yes |
| `DB_USER` | Database user | postgres | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `JWT_SECRET` | JWT signing secret (legacy) | - | No |
| `JWT_EXPIRES_IN` | JWT expiration time (legacy) | 7d | No |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:5173 | Yes |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | 900000 | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 5 | No |

### Frontend Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | http://localhost:5000/api | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | - | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key | - | Yes |
| `VITE_APP_NAME` | Application name | Canvango Group | No |
| `VITE_APP_VERSION` | Application version | 1.0.0 | No |

## 🧪 Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🏗️ Building for Production

### Backend Build

```bash
cd backend
npm run build
```

Compiled files will be in the `dist` directory.

### Frontend Build

```bash
cd frontend
npm run build
```

Optimized production files will be in the `dist` directory.

## 📚 Available Scripts

### Backend Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run migrate` | Run database migrations |
| `npm run seed` | Seed database with sample data |
| `npm run lint` | Run ESLint |

### Frontend Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run lint` | Run ESLint |

## 🔒 Security Features

- **JWT Authentication:** Secure token-based authentication
- **Password Hashing:** bcrypt with salt rounds
- **Rate Limiting:** Protection against brute force attacks
- **CORS Protection:** Configured allowed origins
- **Input Sanitization:** XSS and SQL injection prevention
- **HTTPS Enforcement:** Redirect HTTP to HTTPS in production
- **Helmet.js:** Security headers
- **Admin Audit Logging:** Track all admin actions

## 📖 Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API endpoint reference
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Project Structure](./PROJECT_STRUCTURE.md)** - Detailed project structure
- **[Setup Guide](./SETUP.md)** - Additional setup information
- **[Supabase Setup](./SUPABASE_SETUP.md)** - Detailed Supabase configuration
- **[Supabase Migration Guide](./backend/SUPABASE_MIGRATION.md)** - Migration from PostgreSQL to Supabase
- **[Database Functions](./backend/DATABASE_FUNCTIONS.md)** - RPC functions documentation

## 🐛 Troubleshooting

### Supabase Connection Issues

**Backend can't connect to Supabase:**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check if Supabase project is active (not paused)
- Ensure service role key is used (not anon key)

**Frontend authentication not working:**
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct
- Check browser console for errors
- Ensure Email provider is enabled in Supabase Dashboard

**Type generation fails:**
```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Generate types with project reference
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts
```

### Port Already in Use

```bash
# Find process using port 5000 (backend)
lsof -i :5000          # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>          # macOS/Linux
taskkill /PID <PID> /F # Windows
```

### Migration Errors

```bash
# Reset database (WARNING: This will delete all data)
cd backend
npm run migrate:reset
npm run migrate
npm run seed
```

### Frontend Build Errors

```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 👥 Team

- **Development Team:** Canvango Group
- **Contact:** support@canvango.com

## 🔄 Version History

- **v1.0.0** (2024-01-15) - Initial release
  - User authentication and authorization
  - Transaction management
  - Top-up functionality
  - Claim system
  - Tutorial management
  - Admin panel with full management capabilities

## 📞 Support

For support and questions:
- **Email:** support@canvango.com
- **Documentation:** https://docs.canvango.com
- **Issue Tracker:** [GitHub Issues](https://github.com/canvango/canvango-app/issues)

## 🙏 Acknowledgments

- React Team for the amazing framework
- Express.js community
- PostgreSQL team
- All open-source contributors
