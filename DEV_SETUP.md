# Development Setup Guide

> **Note:** This guide is for the consolidated project structure. The legacy frontend has been successfully merged and removed.

## Prerequisites

Before you begin, ensure you have:
- Node.js 18 or higher installed
- npm (comes with Node.js)
- A Supabase account and project
- Git (for version control)

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd <project-directory>

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env.development.local` file in the project root:

```bash
# Copy the example file
cp .env.example .env.development.local
```

Edit `.env.development.local` and add your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Finding Your Supabase Credentials:**
1. Go to https://app.supabase.com
2. Select your project
3. Navigate to Settings > API
4. Copy the "Project URL" and "anon/public" key

### 3. Database Setup

If you haven't set up the database yet:

```bash
# Using Supabase CLI (recommended)
supabase db push

# Or manually run migrations from supabase/migrations/ directory
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at http://localhost:5173/

## Running the Application

### Development Mode

```bash
# Start development server with hot reload
npm run dev
```

Features:
- Hot Module Replacement (HMR) - changes appear instantly
- TypeScript type checking
- Tailwind CSS with JIT compilation
- Auto-refresh on file changes
- Opens automatically in your default browser

### Production Build

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The production build will be in the `dist/` directory.

## Available Scripts

### Development
- `npm run dev` - Start Vite development server (http://localhost:5173)
- `npm run build:tsc` - Compile TypeScript only (for type checking)
- `npm run lint` - Run ESLint

### Production
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Testing & Verification
- `npm test` - Run tests
- `npm run verify:supabase` - Verify Supabase integration
- `npm run verify:supabase:auth` - Verify Supabase authentication

### Utilities
- `npm run setup` - Run setup wizard
- `npm run config` - Display current configuration
- `npm run verify` - Verify all connections

## Project Structure

The project uses a feature-based architecture:

```
.
├── src/
│   ├── features/
│   │   └── member-area/          # Main application feature
│   │       ├── components/       # Feature-specific components
│   │       ├── pages/            # Page components
│   │       ├── services/         # API services & Supabase client
│   │       ├── hooks/            # Custom React hooks
│   │       ├── contexts/         # React contexts (Auth, UI)
│   │       ├── types/            # TypeScript types
│   │       ├── config/           # Configuration
│   │       └── MemberArea.tsx    # Main feature component
│   ├── shared/
│   │   ├── components/           # Reusable UI components
│   │   ├── hooks/                # Shared hooks
│   │   ├── utils/                # Utility functions
│   │   └── types/                # Shared types
│   ├── main.tsx                  # Application entry point
│   └── index.css                 # Global styles
├── public/                       # Static assets
├── supabase/
│   └── migrations/               # Database migrations
├── scripts/                      # Utility scripts
├── .env.development.local        # Local environment variables (not committed)
├── .env.example                  # Environment template
├── vite.config.ts                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## Development Workflow

### Adding New Features

1. **Create feature structure** in `src/features/member-area/`
2. **Add components** in appropriate directories
3. **Create services** for API calls in `services/`
4. **Add types** in `types/`
5. **Create hooks** if needed in `hooks/`
6. **Update routing** in `MemberArea.tsx`

### Adding Shared Components

1. Create component in `src/shared/components/`
2. Export from `index.ts` if needed
3. Import and use in feature components

### Working with Supabase

The Supabase client is initialized in `src/features/member-area/services/supabase.ts`:

```typescript
import { supabase } from '@/features/member-area/services/supabase';

// Use in your components/services
const { data, error } = await supabase
  .from('table_name')
  .select('*');
```

### Environment Variables

All frontend environment variables must be prefixed with `VITE_`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Access in code:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
```

**Important:** Restart the dev server after changing environment variables.

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 5173
npx kill-port 5173

# Or use a different port
npm run dev -- --port 3000
```

#### Environment Variables Not Loading

- Ensure file is named `.env.development.local` (not just `.env`)
- Verify all variables are prefixed with `VITE_`
- Restart dev server after changing environment files
- Check for typos in variable names

#### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

#### TypeScript Errors

```bash
# Run TypeScript compiler to see all errors
npm run build:tsc

# Check specific file
npx tsc --noEmit src/path/to/file.tsx
```

#### Supabase Connection Issues

1. **Invalid URL format:**
   - Must start with `https://`
   - Must contain `.supabase.co`
   - Example: `https://abcdefgh.supabase.co`

2. **Invalid API key:**
   - Should be in JWT format (starts with `eyJ`)
   - Use anon key, not service role key
   - Verify you copied the complete key

3. **Authentication errors:**
   - Check Supabase Auth is enabled
   - Verify email templates are configured
   - Check RLS policies on tables

#### Build Errors

```bash
# Clear dist folder
rm -rf dist

# Rebuild
npm run build

# If memory issues
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Development Tips

1. **Hot Module Replacement (HMR):**
   - Changes appear instantly without full page reload
   - Preserves component state during updates

2. **TypeScript:**
   - Errors appear in both browser and terminal
   - Use VS Code for inline type checking

3. **Tailwind CSS:**
   - Changes apply instantly with HMR
   - Use Tailwind IntelliSense extension for autocomplete

4. **React DevTools:**
   - Install browser extension for component debugging
   - Inspect component props and state
   - Profile performance

5. **Browser Console:**
   - Check for errors and warnings
   - Use `console.log()` for debugging
   - Network tab for API calls

### Best Practices

1. **Code Organization:**
   - Keep components small and focused
   - Use feature-based structure
   - Separate concerns (UI, logic, data)

2. **Type Safety:**
   - Define types for all props and state
   - Use TypeScript strict mode
   - Avoid `any` type

3. **Performance:**
   - Use React.memo for expensive components
   - Implement code splitting for large features
   - Optimize images and assets

4. **Security:**
   - Never commit `.env` files
   - Use anon key for client-side
   - Validate user input
   - Implement RLS policies

## CLI Tools

For running CLI utilities:

```bash
# Using npm scripts (recommended)
npm run setup      # Run setup wizard
npm run verify     # Verify connections
npm run config     # Display configuration

# Or compile and run directly
npm run build:tsc
node dist/cli.js setup
```

## Getting Help

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review error messages in browser console
3. Verify Supabase configuration
4. Check environment variables are set correctly
5. Consult [CONSOLIDATION_SUMMARY.md](./CONSOLIDATION_SUMMARY.md) for migration details
6. Review [README.md](./README.md) for general documentation

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
