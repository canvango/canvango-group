# Requirements Document

## Introduction

This document outlines the requirements for fixing the blank screen issue that occurred after completing the project-consolidation spec. The root causes are: (1) duplicate context providers causing conflicts, (2) routing structure is incorrect - all routes including login/register are inside MemberArea which requires authentication, and (3) MemberAreaLayout returns null for non-authenticated users.

## Glossary

- **Context Provider**: React component that provides state and functions to child components via Context API
- **MemberAreaLayout**: The main layout component that wraps all member area pages
- **Guest Access**: Ability to view certain pages without authentication
- **Blank Screen**: Application displays nothing due to rendering issues
- **Provider Duplication**: Same context provider wrapped multiple times in component tree

## Requirements

### Requirement 1: Remove Duplicate Context Providers

**User Story:** As a developer, I want to eliminate duplicate context providers, so that the application renders correctly without conflicts.

#### Acceptance Criteria

1. WHEN analyzing component tree, THE System SHALL identify all duplicate provider instances
2. WHEN removing duplicates, THE System SHALL keep providers only in main.tsx
3. WHEN updating MemberArea.tsx, THE System SHALL remove AuthProvider, UIProvider, and ToastProvider wrappers
4. WHEN verifying changes, THE System SHALL ensure QueryClientProvider remains in MemberArea.tsx
5. WHERE providers are removed, THE System SHALL verify child components still have access to contexts

### Requirement 2: Fix MemberAreaLayout for Guest Access

**User Story:** As a user, I want to access public pages without authentication, so that I can browse products and information before logging in.

#### Acceptance Criteria

1. WHEN user is not authenticated, THE MemberAreaLayout SHALL render layout with limited navigation
2. WHEN displaying header for guests, THE System SHALL show login/register buttons instead of profile menu
3. WHEN rendering sidebar for guests, THE System SHALL hide balance and protected menu items
4. WHERE guest access is allowed, THE System SHALL display public pages (Dashboard, BMAccounts, PersonalAccounts, API, Tutorial)
5. IF user tries to access protected pages, THEN THE System SHALL redirect to login page

### Requirement 3: Update Header Component for Guest Mode

**User Story:** As a guest user, I want to see appropriate navigation options, so that I can login or register.

#### Acceptance Criteria

1. WHEN user is not authenticated, THE Header SHALL display "Login" and "Register" buttons
2. WHEN user is authenticated, THE Header SHALL display profile dropdown with logout option
3. WHEN guest clicks login button, THE System SHALL navigate to login page
4. WHEN guest clicks register button, THE System SHALL navigate to register page
5. WHERE mobile menu is shown, THE System SHALL adapt buttons for mobile layout

### Requirement 4: Update Sidebar Component for Guest Mode

**User Story:** As a guest user, I want to see only public menu items, so that I'm not confused by inaccessible features.

#### Acceptance Criteria

1. WHEN user is not authenticated, THE Sidebar SHALL hide balance display
2. WHEN rendering menu items for guests, THE System SHALL show only public pages
3. WHEN user is authenticated, THE Sidebar SHALL show all menu items based on role
4. WHERE admin menu exists, THE System SHALL hide it from non-admin users
5. IF sidebar is opened by guest, THEN THE System SHALL display guest-appropriate content

### Requirement 5: Restructure Routing Architecture

**User Story:** As a developer, I want proper routing structure, so that auth pages and member pages are separated correctly.

#### Acceptance Criteria

1. WHEN restructuring routes, THE System SHALL move auth routes (login, register) to main.tsx level
2. WHEN defining auth routes, THE System SHALL wrap them with GuestRoute component
3. WHEN user accesses root path without auth, THE System SHALL redirect to login page
4. WHEN authenticated user accesses login/register, THE System SHALL redirect to dashboard
5. WHERE member routes exist, THE System SHALL keep them inside MemberArea component with proper layout

### Requirement 6: Implement Conditional Layout Rendering

**User Story:** As a developer, I want MemberAreaLayout to handle both guest and authenticated users, so that the application doesn't show blank screen.

#### Acceptance Criteria

1. WHEN user is not authenticated, THE MemberAreaLayout SHALL render simplified layout for guest pages
2. WHEN user is authenticated, THE MemberAreaLayout SHALL render full layout with sidebar and profile
3. WHEN rendering for guests, THE System SHALL show login/register buttons in header
4. WHERE guest-accessible pages exist, THE System SHALL render them without requiring authentication
5. IF user tries to access protected route as guest, THEN THE System SHALL redirect to login page

### Requirement 7: Verify Application Renders Correctly

**User Story:** As a user, I want the application to display without blank screens, so that I can use all features.

#### Acceptance Criteria

1. WHEN starting dev server, THE System SHALL render login page or dashboard based on auth state
2. WHEN navigating between pages, THE System SHALL display content without blank screens
3. WHEN logging in, THE System SHALL update UI to show authenticated layout
4. WHEN logging out, THE System SHALL update UI to show guest layout
5. WHERE errors occur, THE System SHALL display error messages instead of blank screen

### Requirement 8: Test All User Flows

**User Story:** As a developer, I want to verify all user flows work correctly, so that users have a smooth experience.

#### Acceptance Criteria

1. WHEN testing guest flow, THE System SHALL allow browsing public pages
2. WHEN testing registration flow, THE System SHALL create account and login user
3. WHEN testing login flow, THE System SHALL authenticate and show dashboard
4. WHEN testing protected pages, THE System SHALL enforce authentication
5. WHERE logout is triggered, THE System SHALL clear session and return to guest mode
