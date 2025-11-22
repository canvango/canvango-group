# Design Document - Vercel Deployment Fix

## Overview

Masalah deployment di Vercel disebabkan oleh **missing file extensions** dalam import statements di ES modules. Node.js di environment Linux (Vercel) memerlukan explicit file extensions (.js) untuk ES module imports, berbeda dengan development environment Windows yang lebih permissive.

### Root Cause Analysis

1. **Import Statement Issue**: 
   ```typescript
   // ❌ WRONG - Missing .js extension
   import { ProductAccountFieldModel } from '../models/productAccountField.model';
   
   // ✅ CORRECT - With .js extension
   import { ProductAccountFieldModel } from '../models/productAccountField.model.js';
   ```

2. **ES Modules Requirement**: Ketika menggunakan `"type": "module"` di package.json, Node.js requires explicit extensions untuk relative imports.

3. **Platform Difference**: Windows lebih toleran dengan missing extensions, tapi Linux (Vercel) strict.

4. **TypeScript Compilation**: TypeScript tidak otomatis menambahkan .js extension ke compiled output jika source tidak memilikinya.

## Architecture

### Current Architecture (Problematic)

```
Source (TypeScript)                    Compiled (JavaScript)
─────────────────────                  ─────────────────────
productAccount.controller.ts    →      productAccount.controller.js
├─ import from '../models/            ├─ import from '../models/
│  productAccountField.model'         │  productAccountField.model'  ❌ Missing .js
└─ import from '../models/            └─ import from '../models/
   productAccount.model'                 productAccount.model'        ❌ Missing .js

                                       Vercel (Linux) → Cannot find module!
```

### Target Architecture (Fixed)

```
Source (TypeScript)                    Compiled (JavaScript)
─────────────────────                  ─────────────────────
productAccount.controller.ts    →      productAccount.controller.js
├─ import from '../models/            ├─ import from '../models/
│  productAccountField.model.js'      │  productAccountField.model.js'  ✅ Has .js
└─ import from '../models/            └─ import from '../models/
   productAccount.model.js'              productAccount.model.js'        ✅ Has .js

                                       Vercel (Linux) → Module found! ✅
```

## Components and Interfaces

### 1. Import Statement Standardization

**Affected Files:**
- All controller files in `server/src/controllers/`
- All model files in `server/src/models/`
- All route files in `server/src/routes/`
- All service files in `server/src/services/`
- Main index file `server/src/index.ts`

**Pattern to Fix:**
```typescript
// Pattern 1: Model imports
import { ModelName } from '../models/model.name';
// Fix to:
import { ModelName } from '../models/model.name.js';

// Pattern 2: Config imports
import { config } from '../config/database';
// Fix to:
import { config } from '../config/database.js';

// Pattern 3: Middleware imports
import { authMiddleware } from '../middleware/auth.middleware';
// Fix to:
import { authMiddleware } from '../middleware/auth.middleware.js';

// Pattern 4: Utility imports
import { helper } from '../utils/helper';
// Fix to:
import { helper } from '../utils/helper.js';
```

### 2. Vercel Configuration Enhancement

**File: `vercel.json`**

Current configuration perlu diperbaiki untuk:
- Ensure proper build output inclusion
- Configure function memory and timeout
- Set correct Node.js version
- Configure environment variables

**Enhanced Configuration:**
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm install --production=false",
  "functions": {
    "api/index.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api"
    },
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```

### 3. Build Process Verification

**File: `package.json`**

Build scripts sudah benar, tapi perlu tambahan verification step:

```json
{
  "scripts": {
    "build": "npm run build:frontend && npm run build:server && npm run postbuild:server && npm run verify:build",
    "verify:build": "node scripts/verify-build.js"
  }
}
```

**New File: `scripts/verify-build.js`**

Script untuk memverifikasi bahwa semua required files ada setelah build:
- Check dist/ folder exists
- Check server/dist/ folder exists
- Check critical files (index.js, models, controllers)
- Verify no missing dependencies

### 4. .gitignore Update

**File: `.gitignore`**

Ensure build artifacts tidak di-commit:
```gitignore
# Build output
dist/
build/
server/dist/

# Dependencies
node_modules/

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db
```

## Data Models

No database schema changes required. This is purely a build and deployment configuration fix.

## Error Handling

### Build-Time Error Detection

1. **TypeScript Compilation Errors**
   - TSC will show errors if imports are incorrect
   - Use `--noEmit` flag to check without building

2. **Module Resolution Errors**
   - Add pre-deployment test script
   - Verify all imports can be resolved

### Runtime Error Handling

1. **Module Not Found Errors**
   - Enhanced error messages in server.js
   - Log full module path being searched
   - Provide debugging information

2. **Vercel Function Errors**
   - Proper error logging to Vercel logs
   - Structured error responses
   - Stack trace preservation

**Enhanced Error Handler in `server.js`:**
```javascript
async function handler(req, res) {
  try {
    if (!appPromise) {
      appPromise = setupApp();
    }
    
    const app = await appPromise;
    return app(req, res);
  } catch (error) {
    console.error('❌ Serverless function error:', error);
    console.error('Stack:', error.stack);
    console.error('Module search paths:', module.paths);
    
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Server initialization failed',
        details: error.message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: error.stack
        })
      }
    });
  }
}
```

## Testing Strategy

### 1. Local Testing

**Pre-Deployment Checklist:**
```bash
# 1. Clean build
npm run clean
npm run build

# 2. Test production build locally
npm start

# 3. Test all critical endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/products
curl http://localhost:3000/api/product-accounts/fields/[productId]

# 4. Verify no module errors in logs
```

### 2. Vercel Preview Testing

**After Deployment:**
1. Deploy to Vercel preview environment
2. Check Vercel function logs for errors
3. Test all API endpoints
4. Verify frontend loads correctly
5. Test authentication flow
6. Test product management features

### 3. Automated Testing

**New Test Script: `scripts/test-imports.js`**

```javascript
// Test that all imports can be resolved
import { glob } from 'glob';
import { readFile } from 'fs/promises';

async function testImports() {
  const files = await glob('server/dist/**/*.js');
  
  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const imports = content.match(/from ['"](.+?)['"]/g);
    
    if (imports) {
      for (const imp of imports) {
        const path = imp.match(/from ['"](.+?)['"]/)[1];
        
        // Check if relative import has .js extension
        if (path.startsWith('.') && !path.endsWith('.js')) {
          console.error(`❌ Missing .js extension in ${file}: ${imp}`);
          process.exit(1);
        }
      }
    }
  }
  
  console.log('✅ All imports have correct extensions');
}

testImports();
```

## Implementation Phases

### Phase 1: Fix Import Statements (Critical)
**Priority: HIGH**
**Estimated Time: 30 minutes**

1. Update all controller imports
2. Update all model imports
3. Update all route imports
4. Update main index.ts imports

### Phase 2: Enhance Vercel Configuration
**Priority: MEDIUM**
**Estimated Time: 15 minutes**

1. Update vercel.json with enhanced config
2. Add function memory and timeout settings
3. Configure proper rewrites

### Phase 3: Add Build Verification
**Priority: MEDIUM**
**Estimated Time: 20 minutes**

1. Create verify-build.js script
2. Create test-imports.js script
3. Update package.json scripts
4. Test verification scripts

### Phase 4: Update Documentation
**Priority: LOW**
**Estimated Time: 10 minutes**

1. Update deployment guide
2. Add troubleshooting section
3. Document common errors

## Deployment Strategy

### Pre-Deployment

1. ✅ Fix all import statements
2. ✅ Update vercel.json
3. ✅ Test build locally
4. ✅ Run verification scripts
5. ✅ Commit changes

### Deployment

1. Push to GitHub
2. Vercel auto-deploys
3. Monitor build logs
4. Check function logs
5. Test preview URL

### Post-Deployment

1. Verify all endpoints work
2. Check error logs
3. Test critical user flows
4. Monitor performance
5. Promote to production if successful

## Rollback Plan

If deployment fails:

1. **Immediate**: Revert to previous Vercel deployment
2. **Investigation**: Check Vercel function logs
3. **Fix**: Apply fixes based on logs
4. **Re-deploy**: Test in preview first

## Performance Considerations

### Bundle Size

Current serverless function size should be monitored:
- Target: < 50MB (Vercel limit)
- Current estimate: ~20-30MB
- Optimization: Already using production dependencies only

### Cold Start

- Expected cold start: 1-2 seconds
- Warm function: < 100ms
- Optimization: Keep function warm with health checks

### Memory Usage

- Allocated: 1024MB
- Expected usage: 200-400MB
- Headroom: Sufficient for spikes

## Security Considerations

1. **Environment Variables**: All sensitive data in Vercel environment variables
2. **CORS**: Properly configured in backend
3. **Rate Limiting**: Already implemented
4. **Input Validation**: Already implemented
5. **SQL Injection**: Using Supabase client (safe)

## Monitoring and Logging

### Vercel Logs

Monitor for:
- Module resolution errors
- Function timeouts
- Memory issues
- API errors

### Application Logs

Key metrics:
- Request count
- Error rate
- Response time
- Database query time

## Success Criteria

Deployment is successful when:

1. ✅ No "Cannot find module" errors in Vercel logs
2. ✅ All API endpoints return correct responses
3. ✅ Frontend loads without errors
4. ✅ Authentication works correctly
5. ✅ Product management features work
6. ✅ No console errors in browser
7. ✅ Response times < 500ms for API calls
8. ✅ Cold start < 2 seconds

## References

- [Node.js ES Modules Documentation](https://nodejs.org/api/esm.html)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
