# Project Consolidation Rollback Plan

## Overview

This document provides comprehensive rollback procedures for the project consolidation that merged the legacy frontend (`canvango-app/frontend/`) into the root project structure. Use this guide if you need to revert changes or recover from issues.

**Document Version:** 1.0  
**Last Updated:** November 17, 2025  
**Backup Location:** `.kiro/specs/project-consolidation/backup/legacy-frontend/`

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Backup Information](#backup-information)
3. [Rollback Scenarios](#rollback-scenarios)
4. [Complete Rollback Procedure](#complete-rollback-procedure)
5. [Partial Rollback Procedures](#partial-rollback-procedures)
6. [Recovery Procedures](#recovery-procedures)
7. [Verification Steps](#verification-steps)
8. [Emergency Contacts](#emergency-contacts)

---

## Quick Reference

### Emergency Rollback (5 minutes)

If you need to quickly restore the legacy frontend:

```bash
# 1. Stop the development server (Ctrl+C)

# 2. Restore legacy frontend from backup
xcopy /E /I /Y ".kiro\specs\project-consolidation\backup\legacy-frontend" "canvango-app\frontend"

# 3. Navigate to legacy frontend
cd canvango-app\frontend

# 4. Install dependencies
npm install

# 5. Start legacy dev server
npm run dev
```

### Rollback Decision Tree

```
Issue Detected
    │
    ├─ Complete System Failure? ──→ Use Complete Rollback
    │
    ├─ Specific Feature Broken? ──→ Use Partial Rollback
    │
    ├─ Configuration Issue? ──→ Use Configuration Rollback
    │
    ├─ Dependency Issue? ──→ Use Dependency Rollback
    │
    └─ Data/Auth Issue? ──→ Use Service Rollback
```

---

## Backup Information

### Backup Location

**Primary Backup:**
- **Path:** `.kiro/specs/project-consolidation/backup/legacy-frontend/`
- **Created:** Before consolidation (Task 1.4)
- **Size:** Complete legacy frontend with all files
- **Status:** ✅ Verified and intact

### Backup Contents

The backup includes:
- ✅ All source code (`src/`)
- ✅ Configuration files (vite.config.ts, tsconfig.json, etc.)
- ✅ Dependencies (package.json, package-lock.json)
- ✅ Environment variables (.env, .env.example)
- ✅ Public assets (`public/`)
- ✅ Build scripts (`scripts/`)
- ✅ Documentation files

### Backup Verification

To verify backup integrity:

```bash
# Check if backup exists
dir ".kiro\specs\project-consolidation\backup\legacy-frontend"

# Verify key files exist
dir ".kiro\specs\project-consolidation\backup\legacy-frontend\package.json"
dir ".kiro\specs\project-consolidation\backup\legacy-frontend\vite.config.ts"
dir ".kiro\specs\project-consolidation\backup\legacy-frontend\src"
```

---

## Rollback Scenarios

### Scenario 1: Complete System Failure

**Symptoms:**
- Application won't start
- Critical errors on all pages
- Build process fails completely
- Multiple features broken

**Solution:** [Complete Rollback Procedure](#complete-rollback-procedure)

**Estimated Time:** 15-20 minutes

---

### Scenario 2: Authentication Issues

**Symptoms:**
- Users cannot log in
- Session persistence broken
- Supabase connection errors
- Auth context errors

**Solution:** [Service Rollback - Authentication](#service-rollback---authentication)

**Estimated Time:** 10 minutes

---

### Scenario 3: Routing Problems

**Symptoms:**
- 404 errors on specific routes
- Navigation broken
- Protected routes not working
- Route guards failing

**Solution:** [Partial Rollback - Routing](#partial-rollback---routing)

**Estimated Time:** 10 minutes

---

### Scenario 4: Component Rendering Issues

**Symptoms:**
- Specific pages not rendering
- Component errors
- Missing UI elements
- Style issues

**Solution:** [Partial Rollback - Components](#partial-rollback---components)

**Estimated Time:** 15 minutes

---

### Scenario 5: Build/Configuration Issues

**Symptoms:**
- Build fails
- Dev server won't start
- TypeScript errors
- Vite configuration errors

**Solution:** [Configuration Rollback](#configuration-rollback)

**Estimated Time:** 10 minutes

---

### Scenario 6: Dependency Conflicts

**Symptoms:**
- npm install fails
- Peer dependency warnings
- Module not found errors
- Version conflicts

**Solution:** [Dependency Rollback](#dependency-rollback)

**Estimated Time:** 10 minutes

---

## Complete Rollback Procedure

### Prerequisites

- Backup exists at `.kiro/specs/project-consolidation/backup/legacy-frontend/`
- You have administrative access to the project
- Development server is stopped

### Step 1: Stop All Running Processes

```bash
# Stop development server (Ctrl+C in terminal)
# Close all IDE/editor windows for the project
# Stop any background processes
```

### Step 2: Create Current State Backup (Optional but Recommended)

```bash
# Create a backup of current consolidated state
mkdir ".kiro\specs\project-consolidation\backup\consolidated-state"
xcopy /E /I /Y "src" ".kiro\specs\project-consolidation\backup\consolidated-state\src"
copy package.json ".kiro\specs\project-consolidation\backup\consolidated-state\"
copy vite.config.ts ".kiro\specs\project-consolidation\backup\consolidated-state\"
copy tsconfig.json ".kiro\specs\project-consolidation\backup\consolidated-state\"
```

### Step 3: Restore Legacy Frontend

```bash
# Restore the complete legacy frontend from backup
xcopy /E /I /Y ".kiro\specs\project-consolidation\backup\legacy-frontend" "canvango-app\frontend"
```

### Step 4: Restore Root Project (Optional)

If you want to restore the root project to pre-consolidation state:

```bash
# Note: This requires a pre-consolidation backup of root project
# If you don't have this, skip to Step 5 and use dual-project setup

# Remove consolidated files (if you have a pre-consolidation root backup)
# rmdir /s /q src\features\member-area
# Restore from pre-consolidation backup
```

### Step 5: Install Dependencies

```bash
# Navigate to legacy frontend
cd canvango-app\frontend

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### Step 6: Configure Environment Variables

```bash
# Copy environment variables
copy .env.example .env

# Edit .env and add your Supabase credentials:
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Step 7: Verify Legacy Frontend Works

```bash
# Start development server
npm run dev

# Server should start on http://localhost:5173
# Open browser and test:
# - Login page loads
# - Authentication works
# - Dashboard displays
# - Navigation works
```

### Step 8: Document Rollback

Create a rollback report:

```bash
# Create rollback report
echo "Rollback completed on %date% %time%" > ".kiro\specs\project-consolidation\rollback-report.txt"
echo "Reason: [Describe reason]" >> ".kiro\specs\project-consolidation\rollback-report.txt"
echo "Issues encountered: [List issues]" >> ".kiro\specs\project-consolidation\rollback-report.txt"
```

### Step 9: Notify Team

- Inform team members of the rollback
- Document issues that caused the rollback
- Plan remediation steps

---

## Partial Rollback Procedures

### Partial Rollback - Components

If only specific components are causing issues:

```bash
# 1. Identify problematic component
# Example: Dashboard component

# 2. Restore component from backup
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\src\pages\Dashboard.tsx" "src\features\member-area\pages\Dashboard.tsx"

# 3. Restore related components if needed
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\src\components\DashboardCard.tsx" "src\features\member-area\components\DashboardCard.tsx"

# 4. Update imports if necessary
# Edit the restored files to fix import paths

# 5. Test the component
npm run dev
```

### Partial Rollback - Routing

If routing is broken:

```bash
# 1. Restore routing configuration from backup
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\src\App.tsx" "src\features\member-area\App.tsx"

# 2. Restore route components
xcopy /E /I /Y ".kiro\specs\project-consolidation\backup\legacy-frontend\src\pages" "src\features\member-area\pages"

# 3. Update main.tsx to use legacy routing
# Edit src/main.tsx to import and use the restored App.tsx

# 4. Test all routes
npm run dev
```

### Partial Rollback - Services

If API services are broken:

```bash
# 1. Restore service layer from backup
xcopy /E /I /Y ".kiro\specs\project-consolidation\backup\legacy-frontend\src\services" "src\features\member-area\services"

# 2. Restore Supabase configuration
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\src\lib\supabase.ts" "src\features\member-area\services\supabase.ts"

# 3. Update service imports in components
# Use find and replace to update import paths

# 4. Test API connectivity
npm run dev
```

### Service Rollback - Authentication

If authentication is broken:

```bash
# 1. Restore AuthContext
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\src\contexts\AuthContext.tsx" "src\features\member-area\contexts\AuthContext.tsx"

# 2. Restore auth service
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\src\services\auth.ts" "src\features\member-area\services\auth.ts"

# 3. Restore Supabase client
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\src\lib\supabase.ts" "src\features\member-area\services\supabase.ts"

# 4. Update environment variables
# Verify .env.development.local has correct Supabase credentials

# 5. Test authentication flow
npm run dev
```

### Configuration Rollback

If configuration files are causing issues:

```bash
# 1. Restore vite.config.ts
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\vite.config.ts" "vite.config.ts"

# 2. Restore tsconfig.json
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\tsconfig.json" "tsconfig.json"

# 3. Restore tailwind.config.js
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\tailwind.config.js" "tailwind.config.js"

# 4. Restore postcss.config.js
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\postcss.config.js" "postcss.config.js"

# 5. Clear build cache
rmdir /s /q node_modules\.vite
rmdir /s /q dist

# 6. Rebuild
npm run build
```

### Dependency Rollback

If dependency issues occur:

```bash
# 1. Restore package.json
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\package.json" "package.json"

# 2. Restore package-lock.json
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\package-lock.json" "package-lock.json"

# 3. Clean install
rmdir /s /q node_modules
npm install

# 4. Verify dependencies
npm list --depth=0

# 5. Test build
npm run build
```

---

## Recovery Procedures

### Recovery from Failed Rollback

If the rollback itself fails:

```bash
# 1. Stop all processes
# Press Ctrl+C in all terminals

# 2. Clean the project
rmdir /s /q node_modules
rmdir /s /q dist
rmdir /s /q .vite

# 3. Restore from backup again
xcopy /E /I /Y ".kiro\specs\project-consolidation\backup\legacy-frontend" "canvango-app\frontend"

# 4. Fresh install
cd canvango-app\frontend
npm install

# 5. Start fresh
npm run dev
```

### Recovery from Corrupted Backup

If the backup is corrupted or incomplete:

```bash
# 1. Check if git repository exists
git status

# 2. If git exists, restore from git history
git log --oneline --all
git checkout <commit-before-consolidation>

# 3. If no git, contact team for backup
# Request backup from team members or version control system
```

### Recovery from Environment Issues

If environment variables are lost:

```bash
# 1. Restore .env from backup
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\.env" ".env.development.local"

# 2. If backup .env is empty, use .env.example
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\.env.example" ".env.development.local"

# 3. Manually add Supabase credentials
# Edit .env.development.local:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. Verify environment variables load
npm run dev
# Check console for Supabase connection
```

---

## Verification Steps

### Post-Rollback Verification Checklist

After any rollback, verify the following:

#### 1. Development Server

```bash
# Start dev server
npm run dev

# Verify:
# ✅ Server starts without errors
# ✅ No console errors
# ✅ Port 5173 is accessible
```

#### 2. Authentication

```bash
# Test in browser:
# ✅ Login page loads
# ✅ Can log in with valid credentials
# ✅ Session persists on page reload
# ✅ Can log out successfully
```

#### 3. Core Features

```bash
# Test in browser:
# ✅ Dashboard displays
# ✅ Product catalog loads
# ✅ Transaction history accessible
# ✅ Top-up functionality works
# ✅ API documentation loads
```

#### 4. Navigation

```bash
# Test in browser:
# ✅ All menu items work
# ✅ All routes accessible
# ✅ Protected routes require auth
# ✅ Back/forward buttons work
```

#### 5. Data Loading

```bash
# Test in browser:
# ✅ Supabase connection works
# ✅ User data loads
# ✅ Product data displays
# ✅ Transaction data shows
```

#### 6. Build Process

```bash
# Test build
npm run build

# Verify:
# ✅ Build completes successfully
# ✅ No TypeScript errors
# ✅ No build warnings
# ✅ dist/ folder created
```

#### 7. Production Preview

```bash
# Test production build
npm run preview

# Verify:
# ✅ Preview server starts
# ✅ Application works in production mode
# ✅ No console errors
```

### Verification Report Template

Create a verification report after rollback:

```markdown
# Rollback Verification Report

**Date:** [Date]
**Time:** [Time]
**Performed By:** [Name]
**Rollback Type:** [Complete/Partial/Configuration/etc.]

## Verification Results

### Development Server
- [ ] Server starts: YES/NO
- [ ] No errors: YES/NO
- [ ] Port accessible: YES/NO

### Authentication
- [ ] Login works: YES/NO
- [ ] Session persists: YES/NO
- [ ] Logout works: YES/NO

### Core Features
- [ ] Dashboard: YES/NO
- [ ] Product catalog: YES/NO
- [ ] Transactions: YES/NO
- [ ] Top-up: YES/NO

### Build Process
- [ ] Build succeeds: YES/NO
- [ ] No TS errors: YES/NO
- [ ] Preview works: YES/NO

## Issues Found

[List any issues discovered during verification]

## Next Steps

[List actions needed to resolve remaining issues]

## Sign-off

Verified by: [Name]
Date: [Date]
Status: [PASS/FAIL]
```

---

## Emergency Contacts

### Technical Contacts

**Development Team Lead:**
- Name: [To be filled]
- Email: [To be filled]
- Phone: [To be filled]

**DevOps/Infrastructure:**
- Name: [To be filled]
- Email: [To be filled]
- Phone: [To be filled]

**Database Administrator:**
- Name: [To be filled]
- Email: [To be filled]
- Phone: [To be filled]

### Escalation Path

1. **Level 1:** Development team member attempts rollback
2. **Level 2:** Team lead reviews and assists
3. **Level 3:** DevOps team involved for infrastructure issues
4. **Level 4:** Full team meeting to assess situation

### External Resources

**Supabase Support:**
- Dashboard: https://app.supabase.com
- Documentation: https://supabase.com/docs
- Support: support@supabase.io

**Vite Documentation:**
- Website: https://vitejs.dev
- GitHub: https://github.com/vitejs/vite

**React Documentation:**
- Website: https://react.dev
- GitHub: https://github.com/facebook/react

---

## Appendix

### A. File Mapping Reference

Key files and their locations:

| Legacy Location | Consolidated Location |
|----------------|----------------------|
| `canvango-app/frontend/src/App.tsx` | `src/features/member-area/MemberArea.tsx` |
| `canvango-app/frontend/src/pages/` | `src/features/member-area/pages/` |
| `canvango-app/frontend/src/components/` | `src/features/member-area/components/` |
| `canvango-app/frontend/src/services/` | `src/features/member-area/services/` |
| `canvango-app/frontend/src/hooks/` | `src/features/member-area/hooks/` |
| `canvango-app/frontend/src/contexts/` | `src/features/member-area/contexts/` |
| `canvango-app/frontend/src/types/` | `src/features/member-area/types/` |
| `canvango-app/frontend/src/utils/` | `src/shared/utils/` |
| `canvango-app/frontend/vite.config.ts` | `vite.config.ts` (merged) |
| `canvango-app/frontend/package.json` | `package.json` (merged) |

### B. Common Issues and Solutions

#### Issue: "Module not found" errors

**Solution:**
```bash
# Clear node_modules and reinstall
rmdir /s /q node_modules
npm install
```

#### Issue: "Port 5173 already in use"

**Solution:**
```bash
# Find and kill process using port 5173
netstat -ano | findstr :5173
taskkill /PID <process_id> /F

# Or use a different port
npm run dev -- --port 5174
```

#### Issue: Supabase connection fails

**Solution:**
```bash
# Verify environment variables
type .env.development.local

# Check Supabase credentials in dashboard
# Update .env.development.local with correct values
```

#### Issue: TypeScript errors after rollback

**Solution:**
```bash
# Clear TypeScript cache
rmdir /s /q node_modules\.cache

# Rebuild
npm run build:tsc
```

#### Issue: Styles not loading

**Solution:**
```bash
# Clear Vite cache
rmdir /s /q node_modules\.vite

# Restart dev server
npm run dev
```

### C. Rollback Testing Checklist

Before performing a rollback in production:

- [ ] Test rollback procedure in development environment
- [ ] Verify backup integrity
- [ ] Document all steps taken
- [ ] Notify team of planned rollback
- [ ] Schedule rollback during low-traffic period
- [ ] Have team members available for support
- [ ] Prepare communication for users if needed
- [ ] Test verification procedures
- [ ] Have escalation contacts ready

### D. Lessons Learned Template

After a rollback, document lessons learned:

```markdown
# Rollback Lessons Learned

**Date:** [Date]
**Incident:** [Brief description]

## What Went Wrong

[Describe what caused the need for rollback]

## What Went Well

[Describe what worked well during rollback]

## What Could Be Improved

[Describe areas for improvement]

## Action Items

1. [Action item 1]
2. [Action item 2]
3. [Action item 3]

## Prevention Measures

[Describe steps to prevent similar issues]
```

---

## Document Maintenance

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-11-17 | Development Team | Initial rollback plan created |

### Review Schedule

This document should be reviewed:
- After any rollback is performed
- Quarterly as part of disaster recovery planning
- When significant changes are made to the project structure
- When new team members join

### Document Owner

**Owner:** Development Team Lead  
**Last Reviewed:** November 17, 2025  
**Next Review:** February 17, 2026

---

**END OF ROLLBACK PLAN**
