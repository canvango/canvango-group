# Implementation Plan - Vercel Deployment Fix

## Overview

Fix module resolution errors di Vercel deployment dengan menambahkan .js extensions ke semua relative imports di backend codebase. Total ada 4 file yang perlu diperbaiki.

---

## Tasks

- [x] 1. Fix import statements in model files




  - Update `server/src/models/productAccountField.model.ts` - add .js extension to config import
  - Update `server/src/models/productAccount.model.ts` - add .js extension to config import
  - _Requirements: 1.1, 1.2, 1.4_

- [x] 2. Fix import statements in controller files





  - Update `server/src/controllers/productAccount.controller.ts` - add .js extensions to model imports
  - Update `server/src/controllers/purchase.controller.ts` - add .js extensions to all relative imports (models, config, utils)
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3. Rebuild and verify build output





  - Run `npm run build` to recompile TypeScript
  - Verify compiled .js files have correct import statements with .js extensions
  - Check that no "Cannot find module" errors occur during build
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Update .gitignore to exclude build artifacts




  - Ensure `dist/` and `server/dist/` are in .gitignore
  - Verify build artifacts are not tracked by git
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 5. Enhance Vercel configuration





  - Update `vercel.json` with function memory and timeout settings
  - Add proper rewrite rules for API and SPA routing
  - Configure Node.js version if needed
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 6. Create build verification script





  - Create `scripts/verify-build.js` to check build output
  - Verify all critical files exist after build
  - Check for missing .js extensions in compiled imports
  - Add verification to build process in package.json
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 7. Enhance error handling in server.js





  - Add detailed error logging for module resolution failures
  - Include module search paths in error output
  - Add stack trace for debugging
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 8. Test locally before deployment





  - Clean build: `npm run clean && npm run build`
  - Start production server: `npm start`
  - Test critical API endpoints (health, products, product-accounts)
  - Verify no module resolution errors in console
  - _Requirements: 1.3, 3.1, 3.2_

- [-] 9. Deploy to Vercel and verify



  - Commit all changes to git
  - Push to GitHub to trigger Vercel deployment
  - Monitor Vercel build logs for errors
  - Check Vercel function logs after deployment
  - Test all API endpoints on preview URL
  - Verify frontend loads correctly
  - _Requirements: 2.1, 2.2, 2.3, 5.1, 5.2_

- [ ] 10. Update deployment documentation
  - Document the .js extension requirement for ES modules
  - Add troubleshooting section for common deployment errors
  - Update README with Vercel deployment instructions
  - _Requirements: 5.4_

---

## Notes

### Critical Files to Fix

1. **server/src/models/productAccountField.model.ts**
   - Line 1: `import { getSupabaseClient } from '../config/supabase';`
   - Fix: Add `.js` → `'../config/supabase.js'`

2. **server/src/models/productAccount.model.ts**
   - Line 1: `import { getSupabaseClient } from '../config/supabase';`
   - Fix: Add `.js` → `'../config/supabase.js'`

3. **server/src/controllers/productAccount.controller.ts**
   - Line 2: `import { ProductAccountFieldModel } from '../models/productAccountField.model';`
   - Line 3: `import { ProductAccountModel } from '../models/productAccount.model';`
   - Fix: Add `.js` to both imports

4. **server/src/controllers/purchase.controller.ts**
   - Line 2: `import { TransactionModel } from '../models/Transaction.model';`
   - Line 3: `import { ProductAccountModel } from '../models/productAccount.model';`
   - Line 4: `import { UserModel } from '../models/User.model';`
   - Line 5: `import { getSupabaseClient } from '../config/supabase';`
   - Line 6: `import { successResponse, errorResponse } from '../utils/response';`
   - Fix: Add `.js` to all 5 imports

### Why This Happens

- **ES Modules Requirement**: When using `"type": "module"` in package.json, Node.js requires explicit file extensions for relative imports
- **Platform Difference**: Windows is more permissive, but Linux (Vercel) is strict
- **TypeScript Behavior**: TypeScript doesn't automatically add .js extensions during compilation

### Testing Checklist

Before marking deployment as complete, verify:
- [ ] No "Cannot find module" errors in Vercel logs
- [ ] `/api/health` endpoint returns 200
- [ ] `/api/products` returns product list
- [ ] `/api/product-accounts/fields/:productId` works
- [ ] Frontend loads without errors
- [ ] Login functionality works
- [ ] Product management works

### Rollback Plan

If deployment fails:
1. Check Vercel function logs for specific error
2. Revert to previous Vercel deployment via Vercel dashboard
3. Fix issues locally
4. Re-deploy to preview environment first
5. Test thoroughly before promoting to production
