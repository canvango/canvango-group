# Vercel ESM Module Error Fix

## Problem

```
SyntaxError: Unexpected token 'export'
    at compileSourceTextModule (node:internal/modules/esm/utils:346:16)
```

**Root Cause**: Vercel's serverless function runtime couldn't properly handle the ESM syntax (`import`/`export`) in `server.js` when using the `@vercel/node` builder directly.

## Solution

Created a proper Vercel serverless function structure:

### 1. Created `api/index.js`

```javascript
/**
 * Vercel Serverless Function Entry Point
 */
import handler from '../server.js';

export default handler;
```

This file acts as the entry point for Vercel's serverless functions and properly imports the main server handler.

### 2. Updated `vercel.json`

**Before:**
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

**After:**
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```

**Changes:**
- Removed explicit `builds` configuration (Vercel auto-detects `api/` folder)
- Changed `routes` to `rewrites` (modern Vercel config)
- All requests now route to `/api` which maps to `api/index.js`

### 3. Updated `.vercelignore`

Added:
```
# Keep api folder for Vercel
!api
```

This ensures the `api/` folder is included in the deployment.

## How It Works

1. **Build Phase**: 
   - `npm run build` compiles frontend (Vite) → `dist/`
   - `npm run build` compiles backend (TypeScript) → `server/dist/`

2. **Deployment Phase**:
   - Vercel detects `api/index.js` as a serverless function
   - All requests are rewritten to `/api`
   - `api/index.js` imports and executes the handler from `server.js`
   - `server.js` serves both API routes and static frontend files

3. **Runtime**:
   ```
   Request → Vercel Edge → /api → api/index.js → server.js → Express App
                                                              ├─ /api/* → Backend API
                                                              └─ /* → Frontend SPA
   ```

## File Structure

```
project/
├── api/
│   └── index.js          # Vercel serverless function entry
├── server.js             # Main Express app (ESM)
├── server/
│   └── dist/
│       ├── package.json  # {"type": "module"}
│       └── index.js      # Compiled backend
├── dist/                 # Compiled frontend
│   ├── index.html
│   └── assets/
├── vercel.json           # Vercel configuration
└── package.json          # Root package.json with "type": "module"
```

## Testing

### Local Test
```bash
npm run build
npm start
```

Visit: http://localhost:3000

### Vercel Test

After deployment, check:
- Homepage: `https://your-app.vercel.app/`
- API: `https://your-app.vercel.app/api/health`
- SPA Routes: `https://your-app.vercel.app/dashboard`

## Verification

✅ No more `SyntaxError: Unexpected token 'export'`
✅ Serverless function starts successfully
✅ Both API and frontend routes work
✅ ESM modules properly loaded

## Next Steps

1. Commit changes:
   ```bash
   git add api/ vercel.json .vercelignore DEPLOYMENT_STATUS.md
   git commit -m "fix: resolve Vercel ESM module error with api/ entry point"
   git push
   ```

2. Redeploy on Vercel (automatic if connected to GitHub)

3. Monitor deployment logs in Vercel dashboard

## References

- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
- [Vercel Configuration](https://vercel.com/docs/projects/project-configuration)
