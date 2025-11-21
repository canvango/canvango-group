# Canvango Group - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ (https://nodejs.org/)
- PostgreSQL 14+ (https://www.postgresql.org/download/)
- npm or yarn package manager

## Database Setup

### 1. Create PostgreSQL Database

Open PostgreSQL command line or pgAdmin and run:

```sql
CREATE DATABASE canvango_db;
```

### 2. Create Database User (Optional)

```sql
CREATE USER canvango_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE canvango_db TO canvango_user;
```

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd canvango-app/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` file with your configuration:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=canvango_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_here_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_token_secret_here_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=5
```

**Important:** Generate secure random strings for JWT secrets. You can use:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Run Database Migrations

```bash
npm run migrate
```

This will create all necessary tables in your database.

### 5. Seed Database (Optional)

To populate the database with sample data for development:

```bash
npm run seed
```

This will create:
- 1 Admin user: `admin@canvango.com` / `admin123`
- 5 Member users (password: `password123`):
  - `john.doe@example.com`
  - `jane.smith@example.com`
  - `bob.wilson@example.com`
  - `alice.johnson@example.com`
  - `charlie.brown@example.com`
- Sample transactions, top-ups, claims, and tutorials

**Note:** See `backend/DATABASE.md` for detailed database documentation.

### 6. Start Backend Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm run build
npm start
```

The backend API will be available at `http://localhost:5000`

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd canvango-app/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start Frontend Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Verify Installation

### 1. Check Backend Health

Open your browser or use curl:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Canvango API is running"
}
```

### 2. Check Frontend

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the Canvango Group welcome page.

## Project Structure

```
canvango-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/     # Request handlers
│   │   ├── database/        # Database migrations and seeds
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Utility functions
│   │   └── index.ts         # Entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   ├── contexts/        # React contexts
    │   ├── hooks/           # Custom hooks
    │   ├── pages/           # Page components
    │   ├── services/        # API services
    │   ├── types/           # TypeScript types
    │   ├── utils/           # Utility functions
    │   ├── App.tsx          # Main app component
    │   ├── main.tsx         # Entry point
    │   └── index.css        # Global styles
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.ts
```

## Next Steps

Now that your project is set up, you can proceed with implementing the features:

1. **Task 2**: Implement database models
2. **Task 3**: Implement authentication system
3. **Task 4**: Implement user endpoints
4. And so on...

Refer to `.kiro/specs/canvango-group-web-app/tasks.md` for the complete implementation plan.

## Troubleshooting

### Database Connection Issues

If you get database connection errors:
1. Verify PostgreSQL is running
2. Check database credentials in `.env`
3. Ensure the database exists
4. Check firewall settings

### Port Already in Use

If port 5000 or 5173 is already in use:
1. Change the port in backend `.env` (PORT variable)
2. Update frontend `.env` (VITE_API_URL)
3. Update frontend `vite.config.ts` server port

### Module Not Found Errors

If you get module not found errors:
1. Delete `node_modules` folder
2. Delete `package-lock.json`
3. Run `npm install` again

## Development Commands

### Backend
- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with initial data
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
