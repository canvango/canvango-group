# Canvango Member Area

A modern, frontend-only React application for the Canvango member area, built with React, TypeScript, Vite, and Supabase.

> **Architecture:** This is a **frontend-only application** that uses Supabase as the complete backend solution. There is no separate backend server - all data operations go directly to Supabase with Row Level Security (RLS) for authorization.

## Features

- 🔐 Secure authentication with Supabase Auth
- 📊 Dashboard with real-time data
- 💳 Top-up and transaction management
- 🛍️ Product catalog and purchasing
- 🔧 API documentation and key management
- 👥 User and admin management
- 📱 Responsive design with Tailwind CSS
- ⚡ Fast development with Vite and HMR
- 📦 TypeScript support with full type definitions

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Environment variables configured

## Installation

```bash
# Install dependencies
npm install
```

## Quick Start

### 1. Environment Setup

Create a `.env.development.local` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Finding Supabase Credentials:**
1. Go to https://app.supabase.com
2. Select your project
3. Go to Settings > API
4. Copy the Project URL and anon/public key

### 2. Database Setup

Run the Supabase migrations to set up your database:

```bash
# Apply migrations
supabase db push
```

Or manually run the SQL files in `supabase/migrations/` directory.

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:5173/

### 4. Build for Production

```bash
npm run build
```

### 5. Preview Production Build

```bash
npm run preview
```

The production preview will be available at http://localhost:4173/

## Available Scripts

### Development

```bash
# Start development server with hot reload
npm run dev

# Build TypeScript files
npm run build:tsc

# Run linter
npm run lint
```

### Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run build:analyze
```

### Testing

```bash
# Run tests
npm test

# Verify Supabase integration
npm run verify:supabase

# Verify Supabase authentication
npm run verify:supabase:auth
```

### Utilities

```bash
# Run setup wizard
npm run setup

# Display current configuration
npm run config

# Verify all connections
npm run verify
```

## Environment Variables

All environment variables for the frontend must be prefixed with `VITE_` to be accessible in the application.

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abcdefgh.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Environment Files

- `.env.development.local` - Local development (not committed)
- `.env.local` - Local overrides (not committed)
- `.env.example` - Example template (committed)

**Note:** Never commit files containing actual credentials to version control.

## Common Development Tasks

### Running the Application

```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Setting Up a New Developer

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.development.local`
4. Add your Supabase credentials
5. Run `npm run dev`
6. Open http://localhost:5173

### Making Changes

- **Components:** Add to `src/features/member-area/components/` or `src/shared/components/`
- **Pages:** Add to `src/features/member-area/pages/`
- **Services:** Add to `src/features/member-area/services/`
- **Hooks:** Add to `src/features/member-area/hooks/` or `src/shared/hooks/`
- **Types:** Add to `src/features/member-area/types/` or `src/shared/types/`
- **Utils:** Add to `src/shared/utils/`

### Testing Changes

```bash
# Run TypeScript compiler
npm run build:tsc

# Build for production
npm run build

# Test production build
npm run preview
```

## Troubleshooting

### Development Server Issues

**Port already in use:**
```bash
# Kill process on port 5173
npx kill-port 5173
# Or use a different port
npm run dev -- --port 3000
```

**Module not found errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors:**
```bash
# Run TypeScript compiler to see all errors
npm run build:tsc
```

### Supabase Connection Issues

**Environment variables not loading:**
- Ensure file is named `.env.development.local` (not `.env.local` for dev)
- Verify variables are prefixed with `VITE_`
- Restart dev server after changing .env files

**Invalid URL format:**
- URL must start with `https://`
- URL must contain `.supabase.co`
- Example: `https://abcdefgh.supabase.co`

**Invalid API key:**
- Keys should be in JWT format (start with `eyJ`)
- Verify you copied the complete key
- Use anon key for client-side (not service role key)

**Authentication errors:**
- Check Supabase Auth is enabled in your project
- Verify email templates are configured
- Check RLS policies on tables

### Build Issues

**Build fails with memory error:**
```bash
# Increase Node memory limit
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

**Missing dependencies:**
```bash
# Install all dependencies
npm install
```

**Vite build errors:**
- Clear Vite cache: `rm -rf node_modules/.vite`
- Clear dist folder: `rm -rf dist`
- Rebuild: `npm run build`

## Architecture

### Frontend-Only Architecture

This application uses a **simplified, frontend-only architecture** with Supabase as the complete backend:

```
Browser (Frontend)
    ↓
    Direct Supabase API (100% of operations)
    ├─→ Supabase PostgreSQL (Database)
    ├─→ Supabase Auth (Authentication)
    ├─→ Supabase RLS (Authorization)
    └─→ Supabase Storage (File uploads)
```

**Why No Backend Server?**
- ✅ **No CORS issues** - Direct browser-to-Supabase communication
- ✅ **Faster** - Eliminates backend hop (50% latency reduction)
- ✅ **Simpler** - Single codebase to maintain
- ✅ **Cheaper** - No serverless functions or server costs
- ✅ **More secure** - Database-level security with RLS policies

### Technology Stack

- **Frontend Framework:** React 19 with TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 3
- **Routing:** React Router 7
- **State Management:** React Context + Hooks
- **Data Fetching:** TanStack Query (React Query)
- **Backend:** Supabase (Auth, Database, Storage, RLS)
- **Form Handling:** React Hook Form + Zod
- **UI Components:** Custom components with Heroicons & Lucide
- **Deployment:** Static site hosting (Vercel, Netlify, etc.)

### Data Flow Pattern

All data operations follow this pattern:

```typescript
// 1. Supabase Client (Direct database access)
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', userId);

// 2. React Query Hook (Caching & state management)
export const useTableData = () => {
  return useQuery({
    queryKey: ['table_name'],
    queryFn: fetchTableData
  });
};

// 3. Component (UI rendering)
const { data, isLoading, error } = useTableData();
```

### Security Model

**Supabase Row Level Security (RLS)** provides database-level authorization:

- **User Isolation:** Users can only access their own data
- **Role-Based Access:** Admins have elevated permissions
- **Automatic Enforcement:** RLS policies apply to all queries
- **No Backend Needed:** Authorization happens at the database layer

Example RLS Policy:
```sql
-- Users can only see their own warranty claims
CREATE POLICY "user_isolation"
  ON warranty_claims FOR SELECT
  USING (auth.uid() = user_id);
```

### Key Features

- **Authentication:** Supabase Auth with email/password
- **Authorization:** Database-level RLS policies (no backend code)
- **Real-time Data:** Supabase real-time subscriptions
- **Responsive Design:** Mobile-first approach with Tailwind
- **Code Splitting:** Automatic route-based code splitting
- **Type Safety:** Full TypeScript coverage
- **Error Handling:** Centralized error boundaries and toast notifications
- **Static Deployment:** Deploy as static files (no server required)

## Security Best Practices

### Frontend-Only Security Model

Since this is a frontend-only application, security is handled at the database level:

1. **Supabase RLS Policies** - All authorization happens at the database layer
   - Users can only access their own data
   - Admins have elevated permissions
   - Policies are enforced automatically on all queries

2. **Supabase Anon Key is Safe** - The anon key is designed to be public
   - RLS policies protect data even with the anon key
   - Service role key is NEVER exposed to frontend
   - Rate limiting prevents abuse

3. **Environment Variables**
   - Never commit `.env` files (they're in `.gitignore`)
   - Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are needed
   - These are safe to expose in frontend code

4. **Input Validation**
   - Use Zod schemas for form validation
   - Validate on frontend before Supabase queries
   - Supabase constraints provide additional validation

5. **XSS Protection**
   - React escapes content by default
   - Sanitize user-generated content
   - Use Content Security Policy headers

6. **HTTPS Only**
   - Always use secure connections in production
   - Supabase enforces HTTPS

7. **Regular Updates**
   - Keep dependencies updated
   - Monitor Supabase security advisories
   - Rotate keys if compromised

## Project Structure

```
.
├── src/
│   ├── features/
│   │   └── member-area/          # Main member area feature
│   │       ├── components/       # Feature-specific components
│   │       ├── pages/            # Page components
│   │       ├── services/         # API services and Supabase client
│   │       ├── hooks/            # Custom React hooks
│   │       ├── contexts/         # React contexts (Auth, UI)
│   │       ├── types/            # TypeScript type definitions
│   │       ├── config/           # Feature configuration
│   │       └── MemberArea.tsx    # Main feature component
│   ├── shared/
│   │   ├── components/           # Reusable UI components
│   │   ├── hooks/                # Shared custom hooks
│   │   ├── utils/                # Utility functions
│   │   └── types/                # Shared type definitions
│   ├── main.tsx                  # Application entry point
│   └── index.css                 # Global styles
├── public/                       # Static assets
├── dist/                         # Production build output
├── supabase/
│   └── migrations/               # Database migrations
├── scripts/                      # Utility scripts
├── .env.development.local        # Local development environment variables
├── .env.example                  # Environment variables template
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

### Feature-Based Architecture

The project uses a feature-based architecture where related code is grouped by feature rather than by type. This makes the codebase more maintainable and scalable.

**Benefits:**
- Clear separation of concerns
- Easy to locate related code
- Better code organization
- Scalable for large applications
- Easier to test and maintain

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Performance

### Frontend-Only Architecture Benefits

The direct Supabase architecture provides significant performance improvements:

**Latency Comparison:**
```
Old Architecture (with backend):
Frontend → Backend → Supabase = 200ms

New Architecture (direct):
Frontend → Supabase = 100ms

Result: 50% faster response times
```

### Bundle Size Optimizations

The production build is optimized with:
- Code splitting by route
- Vendor chunk separation (React, Supabase)
- Tree shaking for unused code
- Minification and compression
- **No backend dependencies** (~700KB savings)

**Main Bundles:**
- React vendor: ~273 KB (89 KB gzipped)
- Supabase client: ~50 KB (15 KB gzipped)
- Application code: ~39 KB (12 KB gzipped)
- CSS: ~59 KB (10 KB gzipped)

**Total Initial Load:** ~421 KB (~126 KB gzipped)

### Optimization Tips

1. **Lazy Loading:** Routes are automatically code-split
2. **React Query Caching:** Reduces redundant API calls (5-10 min cache)
3. **Image Optimization:** Use WebP format and lazy loading
4. **CDN Delivery:** Static files served from global edge network
5. **Supabase Edge Network:** Low latency worldwide
6. **No Cold Starts:** No serverless functions = instant response

## Deployment

### Static Site Deployment

This application deploys as a **static site** - no server or serverless functions required.

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory containing only static files (HTML, CSS, JS).

### Deploy to Vercel (Recommended)

**Option 1: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Option 2: GitHub Integration**
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Vercel auto-deploys on push to main branch

**Vercel Configuration:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework Preset: Vite
- No serverless functions needed

### Deploy to Netlify

**Option 1: Netlify CLI**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

**Option 2: GitHub Integration**
1. Push code to GitHub
2. Import project in Netlify dashboard
3. Netlify auto-deploys on push to main branch

**Netlify Configuration:**
- Build Command: `npm run build`
- Publish Directory: `dist`
- No functions directory needed

### Environment Variables in Production

Set these environment variables in your hosting platform dashboard:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase Dashboard → Settings → API |

**Important:** These keys are safe to expose in frontend code. Supabase RLS policies protect your data.

### Deployment Checklist

- [ ] Build succeeds locally: `npm run build`
- [ ] Environment variables set in hosting platform
- [ ] Supabase RLS policies enabled on all tables
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled (automatic on Vercel/Netlify)
- [ ] Test all pages after deployment
- [ ] Verify no CORS errors in browser console

### Vercel Configuration File

The included `vercel.json` is optimized for static site deployment:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**What's NOT in the config:**
- ❌ No `functions` - No serverless functions
- ❌ No `/api` rewrites - No backend API
- ❌ No CORS headers - Not needed for static sites

### Performance

**Production Build Size:**
- React vendor: ~273 KB (89 KB gzipped)
- Supabase client: ~50 KB (15 KB gzipped)
- Application code: ~39 KB (12 KB gzipped)
- CSS: ~59 KB (10 KB gzipped)

**Total:** ~421 KB (~126 KB gzipped)

**Benefits of Static Deployment:**
- ⚡ Fast initial load (served from CDN)
- 🌍 Global edge network
- 💰 Free tier available (Vercel/Netlify)
- 🔄 Automatic deployments from Git
- 📊 Built-in analytics

## Migration from Backend Architecture

If you're migrating from the old backend Express architecture, see the [Migration Guide](./.kiro/specs/cors-fix-comprehensive/MIGRATION_GUIDE.md) for detailed instructions.

**Key Changes:**
- ✅ All services now use direct Supabase access
- ✅ No backend server or `/api` endpoints
- ✅ Supabase RLS policies handle authorization
- ✅ Simpler deployment (static site only)
- ✅ No CORS issues

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the error messages in the browser console
3. Verify your Supabase configuration
4. Check that all environment variables are set correctly
5. Review the [Migration Guide](./.kiro/specs/cors-fix-comprehensive/MIGRATION_GUIDE.md) if migrating from old architecture
