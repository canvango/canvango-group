# Requirements Document

## Introduction

This document outlines the requirements for consolidating the legacy frontend application (`canvango-app/frontend/`) into the root project structure. The goal is to have a single, unified codebase that eliminates duplication and confusion about which project to run.

## Glossary

- **Root Project**: The main project located at the repository root (`/`) with structure `src/features/member-area/`
- **Legacy Frontend**: The older application located at `canvango-app/frontend/` with pages-based architecture
- **Consolidation**: The process of merging code from Legacy Frontend into Root Project
- **Member Area**: The main application feature for authenticated users
- **Vite**: The build tool and dev server used by both projects
- **Environment Variables**: Configuration values prefixed with `VITE_` for frontend use

## Requirements

### Requirement 1: Project Structure Analysis

**User Story:** As a developer, I want to understand the differences between Root Project and Legacy Frontend, so that I can plan the consolidation strategy.

#### Acceptance Criteria

1. WHEN analyzing project structures, THE System SHALL identify all unique files in Legacy Frontend that don't exist in Root Project
2. WHEN comparing implementations, THE System SHALL document functional differences between duplicate components
3. WHEN reviewing dependencies, THE System SHALL list all npm packages used in Legacy Frontend but not in Root Project
4. WHEN examining configurations, THE System SHALL compare vite.config.ts, tsconfig.json, and tailwind.config.js between both projects
5. WHERE environment variables exist, THE System SHALL verify all VITE_ prefixed variables are documented

### Requirement 2: Missing Component Migration

**User Story:** As a developer, I want to migrate all missing components from Legacy Frontend to Root Project, so that no functionality is lost.

#### Acceptance Criteria

1. WHEN identifying missing components, THE System SHALL copy all unique React components from `canvango-app/frontend/src/` to appropriate locations in `src/`
2. WHEN migrating pages, THE System SHALL preserve all page-level components and their routing logic
3. WHEN copying services, THE System SHALL merge API service implementations without breaking existing Root Project services
4. WHEN transferring hooks, THE System SHALL ensure all custom hooks are available in Root Project
5. WHERE type definitions exist, THE System SHALL consolidate TypeScript types without conflicts

### Requirement 3: Configuration Consolidation

**User Story:** As a developer, I want unified configuration files, so that the project has consistent build and development settings.

#### Acceptance Criteria

1. WHEN merging vite.config.ts files, THE System SHALL preserve all necessary plugins and optimizations from both projects
2. WHEN consolidating tsconfig.json, THE System SHALL maintain strict type checking and path aliases
3. WHEN combining tailwind.config.js, THE System SHALL include all custom theme configurations and plugins
4. WHEN updating package.json, THE System SHALL merge all dependencies with latest compatible versions
5. WHERE PostCSS configuration exists, THE System SHALL ensure autoprefixer and other plugins are configured

### Requirement 4: Environment Variable Migration

**User Story:** As a developer, I want all environment variables properly configured in Root Project, so that the application can connect to Supabase and other services.

#### Acceptance Criteria

1. WHEN migrating .env files, THE System SHALL copy all VITE_ prefixed variables to root .env.development.local
2. WHEN validating environment setup, THE System SHALL verify VITE_SUPABASE_URL is accessible
3. WHEN checking API keys, THE System SHALL confirm VITE_SUPABASE_ANON_KEY is present
4. WHERE additional API configurations exist, THE System SHALL document and migrate them
5. IF environment variables are missing, THEN THE System SHALL create .env.example with placeholder values

### Requirement 5: Routing Integration

**User Story:** As a developer, I want all routes from Legacy Frontend integrated into Root Project routing, so that users can access all pages.

#### Acceptance Criteria

1. WHEN analyzing routes, THE System SHALL identify all route definitions in Legacy Frontend App.tsx
2. WHEN integrating routes, THE System SHALL add missing routes to Root Project's routing configuration
3. WHEN preserving navigation, THE System SHALL ensure all menu items and links work correctly
4. WHERE protected routes exist, THE System SHALL apply authentication guards consistently
5. IF route conflicts occur, THEN THE System SHALL resolve them with clear naming conventions

### Requirement 6: Style and Asset Migration

**User Story:** As a developer, I want all styles and assets from Legacy Frontend available in Root Project, so that the UI looks consistent.

#### Acceptance Criteria

1. WHEN migrating CSS, THE System SHALL copy all custom styles from Legacy Frontend index.css to Root Project
2. WHEN transferring assets, THE System SHALL move all images, icons, and fonts to Root Project public folder
3. WHEN consolidating Tailwind classes, THE System SHALL ensure all custom utility classes are available
4. WHERE CSS modules exist, THE System SHALL preserve component-specific styling
5. IF style conflicts occur, THEN THE System SHALL use CSS specificity or scoping to resolve them

### Requirement 7: Dependency Management

**User Story:** As a developer, I want a clean, consolidated package.json, so that dependency management is straightforward.

#### Acceptance Criteria

1. WHEN merging dependencies, THE System SHALL install all unique packages from Legacy Frontend to Root Project
2. WHEN resolving version conflicts, THE System SHALL use the latest compatible version
3. WHEN updating devDependencies, THE System SHALL include all build tools and testing libraries
4. WHERE peer dependencies exist, THE System SHALL ensure compatibility
5. IF unused dependencies are found, THEN THE System SHALL remove them after verification

### Requirement 8: Testing and Verification

**User Story:** As a developer, I want to verify the consolidated project works correctly, so that I can confidently delete the Legacy Frontend.

#### Acceptance Criteria

1. WHEN running dev server, THE System SHALL start successfully on port 5173
2. WHEN accessing the application, THE System SHALL display the login page correctly
3. WHEN authenticating users, THE System SHALL connect to Supabase and retrieve user data
4. WHEN navigating between pages, THE System SHALL load all routes without errors
5. WHERE functionality exists in Legacy Frontend, THE System SHALL verify it works in Root Project

### Requirement 9: Legacy Cleanup

**User Story:** As a developer, I want to safely remove the Legacy Frontend folder, so that the codebase is clean and maintainable.

#### Acceptance Criteria

1. WHEN all functionality is verified, THE System SHALL create a backup of canvango-app/frontend folder
2. WHEN documentation is complete, THE System SHALL update README with new project structure
3. WHEN cleanup is initiated, THE System SHALL remove canvango-app/frontend directory
4. WHERE references to old paths exist, THE System SHALL update all import statements
5. IF any issues are found, THEN THE System SHALL provide rollback instructions

### Requirement 10: Documentation Update

**User Story:** As a developer, I want updated documentation, so that future developers understand the consolidated project structure.

#### Acceptance Criteria

1. WHEN consolidation is complete, THE System SHALL update README.md with new structure
2. WHEN documenting changes, THE System SHALL create CONSOLIDATION_SUMMARY.md with migration details
3. WHEN updating dev setup, THE System SHALL provide clear instructions for running the project
4. WHERE architectural decisions were made, THE System SHALL document the rationale
5. IF breaking changes exist, THEN THE System SHALL document them in CHANGELOG.md
