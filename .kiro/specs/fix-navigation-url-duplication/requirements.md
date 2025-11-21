# Requirements Document

## Introduction

This document specifies the requirements for fixing the URL duplication bug in the member area navigation system. The current implementation causes URLs to accumulate repeated path segments (e.g., `/dashboard/dashboard/dashboard/...`) when users navigate through the sidebar menu. This occurs because the routing configuration uses absolute paths with `/member/` prefix while React Router is already nested within the member area context, causing path segments to be appended repeatedly instead of replaced.

## Glossary

- **Navigation System**: The sidebar menu and navigation hooks that allow users to move between different pages in the member area
- **Route Configuration**: The centralized configuration file (`routes.config.ts`) that defines all route paths and metadata
- **React Router**: The routing library used for client-side navigation in the application
- **Nested Routes**: Routes defined within a parent route context (in this case, member area routes within the main app routes)
- **Absolute Path**: A path that starts with `/` and specifies the complete route from the root
- **Relative Path**: A path without leading `/` that is resolved relative to the current route context
- **Path Segment**: A portion of a URL path separated by `/` (e.g., `dashboard`, `akun-bm`)

## Requirements

### Requirement 1

**User Story:** As a user navigating the member area, I want URLs to remain clean and correct when I click sidebar menu items, so that I can bookmark pages and share links without errors.

#### Acceptance Criteria

1. WHEN a user clicks any sidebar menu item, THE Navigation System SHALL navigate to the correct page without duplicating path segments in the URL
2. WHEN a user views the browser address bar after navigation, THE Navigation System SHALL display a clean URL with no repeated path segments
3. WHEN a user bookmarks a page and returns to it later, THE Navigation System SHALL load the correct page from the bookmarked URL
4. WHEN a user shares a URL with another user, THE Navigation System SHALL ensure the shared URL navigates to the intended page
5. WHEN a user refreshes the page, THE Navigation System SHALL maintain the current page without URL corruption

### Requirement 2

**User Story:** As a developer maintaining the codebase, I want route paths to be consistently defined using relative paths, so that the routing system works correctly with React Router's nested route context.

#### Acceptance Criteria

1. THE Route Configuration SHALL define all member area routes using relative paths without leading `/` or `/member/` prefix
2. THE Route Configuration SHALL maintain backward compatibility with existing route references throughout the codebase
3. WHEN a component references a route constant, THE Route Configuration SHALL provide the correct path format for the routing context
4. THE Route Configuration SHALL include clear documentation explaining the relative path convention
5. THE Route Configuration SHALL preserve all existing functionality without introducing new bugs or breaking changes

### Requirement 3

**User Story:** As a developer working with navigation, I want the Sidebar component to use correct path formats, so that navigation links work properly within the nested routing context.

#### Acceptance Criteria

1. THE Sidebar SHALL use relative paths for all React Router Link components
2. THE Sidebar SHALL remove any path normalization logic that strips `/member/` prefix
3. WHEN rendering menu items, THE Sidebar SHALL use route paths directly from the Route Configuration without modification
4. THE Sidebar SHALL correctly identify active menu items based on the current route
5. THE Sidebar SHALL maintain all existing visual states and accessibility features

### Requirement 4

**User Story:** As a developer using navigation utilities, I want the useNavigation hook to handle paths correctly, so that programmatic navigation works without URL duplication.

#### Acceptance Criteria

1. THE useNavigation hook SHALL accept relative paths for navigation within the member area
2. THE useNavigation hook SHALL remove any path normalization logic that strips `/member/` prefix
3. WHEN navigateTo function is called, THE useNavigation hook SHALL pass the path directly to React Router navigate function
4. WHEN isActive function is called, THE useNavigation hook SHALL compare paths without unnecessary normalization
5. THE useNavigation hook SHALL maintain all existing functionality for query parameters and navigation history

### Requirement 5

**User Story:** As a developer, I want all route definitions to be consistent across the application, so that routing behavior is predictable and maintainable.

#### Acceptance Criteria

1. THE Route Configuration SHALL use consistent path format across all route definitions
2. WHEN defining new routes, THE Route Configuration SHALL follow the established relative path convention
3. THE Route Configuration SHALL provide helper functions that work correctly with relative paths
4. THE Route Configuration SHALL include examples demonstrating correct usage of route paths
5. THE Route Configuration SHALL ensure guest users and authenticated members can both navigate correctly without URL duplication

### Requirement 6

**User Story:** As a QA tester, I want to verify that the fix does not introduce new bugs, so that the application remains stable and functional.

#### Acceptance Criteria

1. WHEN testing all navigation scenarios, THE Navigation System SHALL work correctly for both guest and authenticated users
2. WHEN testing page refresh, THE Navigation System SHALL maintain the correct URL and page state
3. WHEN testing browser back/forward buttons, THE Navigation System SHALL navigate correctly through history
4. WHEN testing direct URL access, THE Navigation System SHALL load the correct page without errors
5. THE Navigation System SHALL maintain all existing features including active state highlighting, mobile menu, and admin routes
