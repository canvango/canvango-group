# Canvango Member Area

A modern, consolidated React application for the Canvango member area, built with React, TypeScript, Vite, and Supabase.

> **Note:** This project has been successfully consolidated into a unified root-level application. The legacy frontend structure has been removed. See [CONSOLIDATION_SUMMARY.md](./CONSOLIDATION_SUMMARY.md) for migration details.

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

### Technology Stack

- **Frontend Framework:** React 19 with TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 3
- **Routing:** React Router 7
- **State Management:** React Context + Hooks
- **Data Fetching:** TanStack Query (React Query)
- **Backend:** Supabase (Auth, Database, Storage)
- **Form Handling:** React Hook Form + Zod
- **UI Components:** Custom components with Heroicons & Lucide

### Key Features

- **Authentication:** Supabase Auth with email/password
- **Authorization:** Role-based access control (user, admin)
- **Real-time Data:** Supabase real-time subscriptions
- **Responsive Design:** Mobile-first approach with Tailwind
- **Code Splitting:** Automatic route-based code splitting
- **Type Safety:** Full TypeScript coverage
- **Error Handling:** Centralized error boundaries and toast notifications

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Use anon key for client-side** - Never expose service role key
3. **Enable RLS policies** - Protect database tables with Row Level Security
4. **Validate user input** - Use Zod schemas for form validation
5. **Sanitize data** - Prevent XSS attacks
6. **Use HTTPS** - Always use secure connections in production
7. **Rotate keys regularly** - Update Supabase keys periodically

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

### Bundle Size Analysis

The production build is optimized with:
- Code splitting by route
- Vendor chunk separation (React, Supabase, Axios)
- Tree shaking for unused code
- Minification and compression

**Main Bundles:**
- React vendor: ~273 KB (89 KB gzipped)
- Supabase vendor: ~167 KB (40 KB gzipped)
- Application code: ~39 KB (12 KB gzipped)
- CSS: ~59 KB (10 KB gzipped)

**Total Initial Load:** ~538 KB (~151 KB gzipped)

### Optimization Tips

1. **Lazy Loading:** Routes are automatically code-split
2. **Image Optimization:** Use WebP format and lazy loading
3. **Caching:** Leverage browser caching for static assets
4. **CDN:** Consider using a CDN for production deployment

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Environment Variables in Production

Make sure to set these environment variables in your hosting platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the error messages in the browser console
3. Verify your Supabase configuration
4. Check that all environment variables are set correctly
