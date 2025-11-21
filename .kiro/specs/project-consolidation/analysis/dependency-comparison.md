# Dependency Comparison Report

**Generated:** 2024-11-16  
**Purpose:** Compare dependencies between Root and Legacy Frontend projects

## Executive Summary

This report analyzes the npm dependencies in both projects to identify:
- Unique packages in each project
- Version conflicts
- Recommended resolutions for consolidation

---

## 1. Dependencies Comparison

### 1.1 Unique to Root Project

| Package | Version | Purpose |
|---------|---------|---------|
| `@hookform/resolvers` | ^5.2.2 | Form validation resolvers |
| `@octokit/rest` | ^20.0.2 | GitHub API client |
| `@tanstack/react-query` | ^5.90.9 | Data fetching and caching |
| `chalk` | ^5.3.0 | Terminal string styling |
| `dotenv` | ^16.3.1 | Environment variable loading |
| `inquirer` | ^9.2.12 | Interactive CLI prompts |
| `react-hook-form` | ^7.66.0 | Form management |
| `zod` | ^4.1.12 | Schema validation |

### 1.2 Unique to Legacy Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| `@heroicons/react` | ^2.2.0 | Icon library |
| `react-hot-toast` | ^2.4.1 | Toast notifications |

### 1.3 Shared Dependencies (Version Comparison)

| Package | Root Version | Legacy Version | Conflict? | Recommended |
|---------|--------------|----------------|-----------|-------------|
| `@supabase/supabase-js` | ^2.39.0 | ^2.81.1 | ⚠️ Yes | ^2.81.1 (newer) |
| `axios` | ^1.13.2 | ^1.6.5 | ⚠️ Yes | ^1.13.2 (newer) |
| `lucide-react` | ^0.553.0 | ^0.553.0 | ✅ No | ^0.553.0 |
| `react` | ^19.2.0 | ^18.2.0 | ⚠️ **MAJOR** | ^19.2.0 (Root) |
| `react-dom` | ^19.2.0 | ^18.2.0 | ⚠️ **MAJOR** | ^19.2.0 (Root) |
| `react-router-dom` | ^7.9.6 | ^6.21.1 | ⚠️ **MAJOR** | ^7.9.6 (Root) |

---

## 2. DevDependencies Comparison

### 2.1 Unique to Root Project

| Package | Version | Purpose |
|---------|---------|---------|
| `@types/inquirer` | ^9.0.7 | TypeScript types for inquirer |
| `@types/jest` | ^29.5.14 | TypeScript types for Jest |
| `jest` | ^29.7.0 | Testing framework |
| `jest-environment-jsdom` | ^30.2.0 | Jest DOM environment |
| `ts-jest` | ^29.1.1 | Jest TypeScript preprocessor |

### 2.2 Unique to Legacy Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| `@typescript-eslint/eslint-plugin` | ^6.14.0 | TypeScript ESLint plugin |
| `@typescript-eslint/parser` | ^6.14.0 | TypeScript ESLint parser |
| `eslint` | ^8.55.0 | JavaScript linter |
| `eslint-plugin-react-hooks` | ^4.6.0 | React Hooks ESLint rules |
| `eslint-plugin-react-refresh` | ^0.4.5 | React Refresh ESLint plugin |
| `jsdom` | ^23.0.1 | DOM implementation for testing |
| `rollup-plugin-visualizer` | ^6.0.5 | Bundle size visualization |
| `terser` | ^5.44.1 | JavaScript minifier |
| `vitest` | ^1.1.0 | Testing framework |

### 2.3 Shared DevDependencies (Version Comparison)

| Package | Root Version | Legacy Version | Conflict? | Recommended |
|---------|--------------|----------------|-----------|-------------|
| `@testing-library/jest-dom` | ^6.9.1 | ^6.1.5 | ⚠️ Minor | ^6.9.1 (newer) |
| `@testing-library/react` | ^16.3.0 | ^14.1.2 | ⚠️ **MAJOR** | ^16.3.0 (Root) |
| `@types/react` | ^19.2.5 | ^18.2.43 | ⚠️ **MAJOR** | ^19.2.5 (Root) |
| `@types/react-dom` | ^19.2.3 | ^18.2.17 | ⚠️ **MAJOR** | ^19.2.3 (Root) |
| `@vitejs/plugin-react` | ^4.3.4 | ^4.2.1 | ⚠️ Minor | ^4.3.4 (newer) |
| `autoprefixer` | ^10.4.20 | ^10.4.16 | ⚠️ Patch | ^10.4.20 (newer) |
| `postcss` | ^8.4.49 | ^8.4.32 | ⚠️ Patch | ^8.4.49 (newer) |
| `tailwindcss` | ^3.4.17 | ^3.4.0 | ⚠️ Patch | ^3.4.17 (newer) |
| `typescript` | ^5.3.3 | ^5.2.2 | ⚠️ Minor | ^5.3.3 (newer) |
| `vite` | ^7.2.2 | ^5.0.8 | ⚠️ **MAJOR** | ^7.2.2 (Root) |

---

## 3. Critical Version Conflicts

### 3.1 React Ecosystem (MAJOR UPGRADE)
**Impact:** HIGH - Breaking changes expected

| Package | Legacy | Root | Change |
|---------|--------|------|--------|
| `react` | 18.2.0 | 19.2.0 | Major upgrade |
| `react-dom` | 18.2.0 | 19.2.0 | Major upgrade |
| `@types/react` | 18.2.43 | 19.2.5 | Major upgrade |
| `@types/react-dom` | 18.2.17 | 19.2.3 | Major upgrade |
| `@testing-library/react` | 14.1.2 | 16.3.0 | Major upgrade |

**Resolution Strategy:**
- Use Root versions (React 19)
- Test all Legacy components with React 19
- Update any deprecated APIs
- Review React 19 migration guide

### 3.2 React Router (MAJOR UPGRADE)
**Impact:** HIGH - API changes expected

| Package | Legacy | Root | Change |
|---------|--------|------|--------|
| `react-router-dom` | 6.21.1 | 7.9.6 | Major upgrade |

**Resolution Strategy:**
- Use Root version (v7)
- Update routing patterns if needed
- Test all navigation flows
- Review React Router v7 migration guide

### 3.3 Vite (MAJOR UPGRADE)
**Impact:** MEDIUM - Build configuration changes

| Package | Legacy | Root | Change |
|---------|--------|------|--------|
| `vite` | 5.0.8 | 7.2.2 | Major upgrade |

**Resolution Strategy:**
- Use Root version (v7)
- Update vite.config.ts if needed
- Test build process
- Review Vite v7 changelog

### 3.4 Supabase Client
**Impact:** MEDIUM - API compatibility

| Package | Legacy | Root | Change |
|---------|--------|------|--------|
| `@supabase/supabase-js` | 2.81.1 | 2.39.0 | Legacy is newer |

**Resolution Strategy:**
- Use Legacy version (2.81.1) - newer and more stable
- Test all Supabase operations
- Review changelog for breaking changes

### 3.5 Axios
**Impact:** LOW - Minor version difference

| Package | Legacy | Root | Change |
|---------|--------|------|--------|
| `axios` | 1.6.5 | 1.13.2 | Root is newer |

**Resolution Strategy:**
- Use Root version (1.13.2)
- No breaking changes expected

---

## 4. Testing Framework Conflict

### 4.1 Current State
- **Root**: Uses Jest
- **Legacy**: Uses Vitest

### 4.2 Resolution Strategy
**Recommendation:** Standardize on Vitest

**Rationale:**
1. Vitest is faster and more modern
2. Better Vite integration
3. Jest-compatible API
4. Smaller bundle size

**Migration Steps:**
1. Keep Vitest from Legacy
2. Remove Jest from Root
3. Update test scripts
4. Migrate any Jest-specific tests

---

## 5. Linting Configuration

### 5.1 Current State
- **Root**: No ESLint configuration
- **Legacy**: Full ESLint setup with TypeScript support

### 5.2 Resolution Strategy
**Recommendation:** Adopt Legacy ESLint configuration

**Packages to Add:**
- `eslint`
- `@typescript-eslint/eslint-plugin`
- `@typescript-eslint/parser`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`

---

## 6. Additional Packages to Consider

### 6.1 From Root (Keep)
- `@hookform/resolvers` - Useful for form validation
- `@tanstack/react-query` - Modern data fetching
- `react-hook-form` - Better form management
- `zod` - Schema validation

### 6.2 From Legacy (Keep)
- `@heroicons/react` - Icon library (complement to lucide-react)
- `react-hot-toast` - Toast notifications
- `rollup-plugin-visualizer` - Bundle analysis
- `terser` - Production optimization

### 6.3 CLI-Specific (Root Only)
These are specific to Root's CLI functionality:
- `@octokit/rest` - GitHub integration
- `chalk` - Terminal styling
- `dotenv` - Environment loading
- `inquirer` - Interactive prompts

**Decision:** Keep in Root, not needed in consolidated frontend

---

## 7. Consolidated package.json Recommendation

### 7.1 Dependencies
```json
{
  "dependencies": {
    "@heroicons/react": "^2.2.0",
    "@hookform/resolvers": "^5.2.2",
    "@supabase/supabase-js": "^2.81.1",
    "@tanstack/react-query": "^5.90.9",
    "axios": "^1.13.2",
    "lucide-react": "^0.553.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-hook-form": "^7.66.0",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^7.9.6",
    "zod": "^4.1.12"
  }
}
```

### 7.2 DevDependencies
```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^20.10.5",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "jsdom": "^23.0.1",
    "postcss": "^8.4.49",
    "rollup-plugin-visualizer": "^6.0.5",
    "tailwindcss": "^3.4.17",
    "terser": "^5.44.1",
    "typescript": "^5.3.3",
    "vite": "^7.2.2",
    "vitest": "^1.1.0"
  }
}
```

---

## 8. Migration Risks

### 8.1 High Risk
1. **React 19 Upgrade** - May require code changes
2. **React Router v7** - Routing API changes
3. **Vite v7** - Build configuration updates

### 8.2 Medium Risk
1. **Supabase version** - API compatibility
2. **Testing framework switch** - Test migration

### 8.3 Low Risk
1. **Minor version updates** - Generally backward compatible
2. **New packages** - Additive, no conflicts

---

## 9. Recommended Migration Order

1. **Phase 1**: Update shared dependencies to latest compatible versions
2. **Phase 2**: Add missing packages from both projects
3. **Phase 3**: Upgrade React ecosystem to v19
4. **Phase 4**: Upgrade React Router to v7
5. **Phase 5**: Upgrade Vite to v7
6. **Phase 6**: Standardize on Vitest
7. **Phase 7**: Add ESLint configuration
8. **Phase 8**: Test thoroughly

---

## 10. Summary

### Total Packages
- **Root Dependencies**: 11
- **Legacy Dependencies**: 7
- **Consolidated**: 12 (recommended)

### Total DevDependencies
- **Root DevDependencies**: 13
- **Legacy DevDependencies**: 18
- **Consolidated**: 21 (recommended)

### Version Conflicts
- **Critical (Major)**: 6 conflicts
- **Minor**: 5 conflicts
- **Patch**: 3 conflicts

### Recommended Actions
1. Use Root's React 19 ecosystem
2. Use Legacy's newer Supabase client
3. Adopt Vitest over Jest
4. Add ESLint from Legacy
5. Keep useful packages from both projects
