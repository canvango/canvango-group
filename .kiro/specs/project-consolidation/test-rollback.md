# Rollback Test Procedure

## Purpose

This document provides a safe testing procedure for the rollback plan without affecting the production consolidated project.

## Test Environment Setup

### Prerequisites

- Backup exists at `.kiro/specs/project-consolidation/backup/legacy-frontend/`
- You have a separate test directory or branch
- Development server is not running

---

## Test 1: Backup Integrity Verification

### Objective
Verify that the backup is complete and usable.

### Steps

```bash
# 1. Check backup exists
dir ".kiro\specs\project-consolidation\backup\legacy-frontend"

# Expected: Directory exists with files

# 2. Verify key files
dir ".kiro\specs\project-consolidation\backup\legacy-frontend\package.json"
dir ".kiro\specs\project-consolidation\backup\legacy-frontend\vite.config.ts"
dir ".kiro\specs\project-consolidation\backup\legacy-frontend\src"

# Expected: All files exist

# 3. Check package.json is valid
type ".kiro\specs\project-consolidation\backup\legacy-frontend\package.json"

# Expected: Valid JSON content

# 4. Verify source directory structure
dir /s /b ".kiro\specs\project-consolidation\backup\legacy-frontend\src" | findstr /i "\.tsx$ \.ts$"

# Expected: List of TypeScript/React files
```

### Success Criteria

- ✅ Backup directory exists
- ✅ All key files present
- ✅ package.json is valid JSON
- ✅ Source files exist

### Result

- [ ] PASS
- [ ] FAIL - Reason: _______________

---

## Test 2: Legacy Frontend Restoration (Dry Run)

### Objective
Test restoring the legacy frontend to a test location.

### Steps

```bash
# 1. Create test directory
mkdir ".kiro\specs\project-consolidation\test-restore"

# 2. Restore to test location
xcopy /E /I /Y ".kiro\specs\project-consolidation\backup\legacy-frontend" ".kiro\specs\project-consolidation\test-restore\frontend"

# 3. Verify restoration
dir ".kiro\specs\project-consolidation\test-restore\frontend"

# Expected: All files copied successfully

# 4. Check file count matches
dir /s /b ".kiro\specs\project-consolidation\backup\legacy-frontend" | find /c /v ""
dir /s /b ".kiro\specs\project-consolidation\test-restore\frontend" | find /c /v ""

# Expected: Same number of files

# 5. Verify package.json
type ".kiro\specs\project-consolidation\test-restore\frontend\package.json"

# Expected: Valid package.json content
```

### Success Criteria

- ✅ Test directory created
- ✅ Files copied successfully
- ✅ File count matches
- ✅ package.json is valid

### Result

- [ ] PASS
- [ ] FAIL - Reason: _______________

### Cleanup

```bash
# Remove test directory
rmdir /s /q ".kiro\specs\project-consolidation\test-restore"
```

---

## Test 3: Dependency Installation Test

### Objective
Verify that dependencies can be installed from the backup.

### Steps

```bash
# 1. Navigate to test restore location
cd ".kiro\specs\project-consolidation\test-restore\frontend"

# 2. Install dependencies
npm install

# Expected: Installation completes without errors

# 3. Verify node_modules created
dir node_modules

# Expected: node_modules directory exists with packages

# 4. Check for peer dependency warnings
# Review npm install output

# 5. Verify key packages installed
npm list react react-dom @supabase/supabase-js vite

# Expected: All packages listed with versions
```

### Success Criteria

- ✅ npm install completes
- ✅ No critical errors
- ✅ node_modules created
- ✅ Key packages installed

### Result

- [ ] PASS
- [ ] FAIL - Reason: _______________

---

## Test 4: Build Process Test

### Objective
Verify that the restored project can build successfully.

### Steps

```bash
# 1. Ensure you're in test restore directory
cd ".kiro\specs\project-consolidation\test-restore\frontend"

# 2. Run TypeScript compiler
npm run build:tsc

# Expected: TypeScript compilation succeeds

# 3. Run Vite build
npm run build

# Expected: Build completes successfully

# 4. Verify dist directory created
dir dist

# Expected: dist directory with built files

# 5. Check build output
dir dist\assets

# Expected: JS and CSS files present
```

### Success Criteria

- ✅ TypeScript compiles
- ✅ Vite build succeeds
- ✅ dist directory created
- ✅ Assets generated

### Result

- [ ] PASS
- [ ] FAIL - Reason: _______________

---

## Test 5: Development Server Test

### Objective
Verify that the dev server can start from the restored project.

### Steps

```bash
# 1. Ensure you're in test restore directory
cd ".kiro\specs\project-consolidation\test-restore\frontend"

# 2. Copy environment variables
copy .env.example .env

# 3. Edit .env with test Supabase credentials
# (Use development/test credentials, not production)

# 4. Start dev server
npm run dev

# Expected: Server starts on port 5173

# 5. Open browser to http://localhost:5173
# Expected: Application loads

# 6. Check console for errors
# Expected: No critical errors

# 7. Stop server (Ctrl+C)
```

### Success Criteria

- ✅ Dev server starts
- ✅ No startup errors
- ✅ Application loads in browser
- ✅ No console errors

### Result

- [ ] PASS
- [ ] FAIL - Reason: _______________

---

## Test 6: Configuration File Restoration Test

### Objective
Test restoring individual configuration files.

### Steps

```bash
# 1. Create test config directory
mkdir ".kiro\specs\project-consolidation\test-config"

# 2. Copy current configs to test location
copy vite.config.ts ".kiro\specs\project-consolidation\test-config\vite.config.ts.current"
copy tsconfig.json ".kiro\specs\project-consolidation\test-config\tsconfig.json.current"
copy tailwind.config.js ".kiro\specs\project-consolidation\test-config\tailwind.config.js.current"

# 3. Copy backup configs to test location
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\vite.config.ts" ".kiro\specs\project-consolidation\test-config\vite.config.ts.backup"
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\tsconfig.json" ".kiro\specs\project-consolidation\test-config\tsconfig.json.backup"
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\tailwind.config.js" ".kiro\specs\project-consolidation\test-config\tailwind.config.js.backup"

# 4. Compare files
fc ".kiro\specs\project-consolidation\test-config\vite.config.ts.current" ".kiro\specs\project-consolidation\test-config\vite.config.ts.backup"

# Expected: Shows differences between files

# 5. Verify backup configs are valid
type ".kiro\specs\project-consolidation\test-config\vite.config.ts.backup"

# Expected: Valid TypeScript/JavaScript syntax
```

### Success Criteria

- ✅ Config files copied
- ✅ Backup configs are valid
- ✅ Differences identified
- ✅ No corruption detected

### Result

- [ ] PASS
- [ ] FAIL - Reason: _______________

### Cleanup

```bash
# Remove test config directory
rmdir /s /q ".kiro\specs\project-consolidation\test-config"
```

---

## Test 7: Partial Rollback Test (Component)

### Objective
Test restoring a single component file.

### Steps

```bash
# 1. Create test component directory
mkdir ".kiro\specs\project-consolidation\test-component"

# 2. Copy a component from backup
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\src\pages\Dashboard.tsx" ".kiro\specs\project-consolidation\test-component\Dashboard.tsx"

# 3. Verify file copied
type ".kiro\specs\project-consolidation\test-component\Dashboard.tsx"

# Expected: Valid React component code

# 4. Check file size
dir ".kiro\specs\project-consolidation\test-component\Dashboard.tsx"

# Expected: File has reasonable size (not 0 bytes)

# 5. Verify imports are present
findstr /i "import" ".kiro\specs\project-consolidation\test-component\Dashboard.tsx"

# Expected: Shows import statements
```

### Success Criteria

- ✅ Component file copied
- ✅ File is not empty
- ✅ Valid React code
- ✅ Imports present

### Result

- [ ] PASS
- [ ] FAIL - Reason: _______________

### Cleanup

```bash
# Remove test component directory
rmdir /s /q ".kiro\specs\project-consolidation\test-component"
```

---

## Test 8: Environment Variable Restoration Test

### Objective
Test restoring environment variables.

### Steps

```bash
# 1. Create test env directory
mkdir ".kiro\specs\project-consolidation\test-env"

# 2. Copy .env files from backup
copy ".kiro\specs\project-consolidation\backup\legacy-frontend\.env.example" ".kiro\specs\project-consolidation\test-env\.env.example"

# 3. Verify .env.example content
type ".kiro\specs\project-consolidation\test-env\.env.example"

# Expected: Shows VITE_ prefixed variables

# 4. Check for required variables
findstr /i "VITE_SUPABASE" ".kiro\specs\project-consolidation\test-env\.env.example"

# Expected: Shows VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 5. Verify format is correct
# Expected: KEY=value format
```

### Success Criteria

- ✅ .env.example copied
- ✅ Contains VITE_ variables
- ✅ Supabase variables present
- ✅ Correct format

### Result

- [ ] PASS
- [ ] FAIL - Reason: _______________

### Cleanup

```bash
# Remove test env directory
rmdir /s /q ".kiro\specs\project-consolidation\test-env"
```

---

## Test 9: Rollback Documentation Accessibility Test

### Objective
Verify that rollback documentation is accessible and readable.

### Steps

```bash
# 1. Verify ROLLBACK_PLAN.md exists
dir ".kiro\specs\project-consolidation\ROLLBACK_PLAN.md"

# Expected: File exists

# 2. Verify ROLLBACK_QUICK_REFERENCE.md exists
dir ".kiro\specs\project-consolidation\ROLLBACK_QUICK_REFERENCE.md"

# Expected: File exists

# 3. Check file sizes
dir ".kiro\specs\project-consolidation\ROLLBACK*.md"

# Expected: Files have content (not 0 bytes)

# 4. Open and review documentation
type ".kiro\specs\project-consolidation\ROLLBACK_QUICK_REFERENCE.md"

# Expected: Readable markdown content

# 5. Verify key sections present
findstr /i "Emergency Rollback" ".kiro\specs\project-consolidation\ROLLBACK_QUICK_REFERENCE.md"

# Expected: Section found
```

### Success Criteria

- ✅ Documentation files exist
- ✅ Files have content
- ✅ Markdown is readable
- ✅ Key sections present

### Result

- [ ] PASS
- [ ] FAIL - Reason: _______________

---

## Test 10: Complete Rollback Simulation (Safe)

### Objective
Simulate a complete rollback without affecting the production project.

### Steps

```bash
# 1. Create simulation directory
mkdir ".kiro\specs\project-consolidation\rollback-simulation"

# 2. Restore legacy frontend to simulation directory
xcopy /E /I /Y ".kiro\specs\project-consolidation\backup\legacy-frontend" ".kiro\specs\project-consolidation\rollback-simulation\canvango-app\frontend"

# 3. Navigate to simulated legacy frontend
cd ".kiro\specs\project-consolidation\rollback-simulation\canvango-app\frontend"

# 4. Install dependencies
npm install

# 5. Copy environment variables
copy .env.example .env
# Edit .env with test credentials

# 6. Start dev server
npm run dev

# Expected: Server starts successfully

# 7. Test in browser
# - Open http://localhost:5173
# - Verify login page loads
# - Test authentication (if test credentials available)

# 8. Stop server (Ctrl+C)

# 9. Test build
npm run build

# Expected: Build succeeds

# 10. Test preview
npm run preview

# Expected: Preview server starts
```

### Success Criteria

- ✅ Restoration successful
- ✅ Dependencies install
- ✅ Dev server starts
- ✅ Application loads
- ✅ Build succeeds
- ✅ Preview works

### Result

- [ ] PASS
- [ ] FAIL - Reason: _______________

### Cleanup

```bash
# Stop any running servers (Ctrl+C)

# Navigate back to root
cd ..\..\..

# Remove simulation directory
rmdir /s /q ".kiro\specs\project-consolidation\rollback-simulation"
```

---

## Test Summary Report

### Test Results

| Test # | Test Name | Result | Notes |
|--------|-----------|--------|-------|
| 1 | Backup Integrity | ☐ PASS ☐ FAIL | |
| 2 | Legacy Restoration | ☐ PASS ☐ FAIL | |
| 3 | Dependency Installation | ☐ PASS ☐ FAIL | |
| 4 | Build Process | ☐ PASS ☐ FAIL | |
| 5 | Development Server | ☐ PASS ☐ FAIL | |
| 6 | Configuration Restoration | ☐ PASS ☐ FAIL | |
| 7 | Partial Rollback | ☐ PASS ☐ FAIL | |
| 8 | Environment Variables | ☐ PASS ☐ FAIL | |
| 9 | Documentation | ☐ PASS ☐ FAIL | |
| 10 | Complete Simulation | ☐ PASS ☐ FAIL | |

### Overall Assessment

- **Total Tests:** 10
- **Passed:** ___
- **Failed:** ___
- **Pass Rate:** ___%

### Rollback Plan Status

- [ ] ✅ APPROVED - Rollback plan is tested and ready
- [ ] ⚠️ NEEDS WORK - Issues found, plan needs updates
- [ ] ❌ NOT READY - Critical issues, do not use

### Issues Found

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Recommendations

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

### Sign-off

**Tested By:** _______________  
**Date:** _______________  
**Time:** _______________  
**Status:** _______________

---

## Notes

- All tests should be performed in a safe test environment
- Do not test rollback procedures on production systems
- Keep test results for documentation
- Update rollback plan based on test findings
- Retest after any changes to the rollback plan

---

**Last Updated:** November 17, 2025  
**Version:** 1.0
