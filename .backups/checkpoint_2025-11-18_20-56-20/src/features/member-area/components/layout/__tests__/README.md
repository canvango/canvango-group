# Navigation Tests

## Overview

This directory contains tests for the navigation URL duplication fix. The tests verify that:
1. All menu items use correct absolute paths with `/member/` prefix
2. Path normalization works correctly
3. No URL duplication occurs during navigation
4. Active state highlighting works correctly

## Test Files

### Sidebar.navigation.test.tsx
Tests for the Sidebar component navigation behavior:
- Admin menu path correctness
- Sequential navigation without duplication
- Main menu, account menu, and service menu paths
- Active state highlighting
- Guest user navigation
- Mobile sidebar behavior
- Path normalization

### useNavigation.test.ts (Planned)
Tests for the useNavigation hook:
- Path normalization logic
- Query parameter handling
- Active path detection
- Sequential navigation

## Running Tests

```bash
# Run all navigation tests
npm test -- Sidebar.navigation.test

# Run with coverage
npm test -- --coverage Sidebar.navigation.test

# Run in watch mode
npm test -- --watch Sidebar.navigation.test
```

## Manual Testing

For comprehensive testing, also perform manual testing using the checklist in:
`.kiro/specs/fix-navigation-url-duplication/verification-checklist.md`

## Test Requirements

The tests verify the following requirements from the spec:
- Requirement 1.1: Navigate without URL duplication
- Requirement 1.2: Construct URLs with exactly one occurrence of each path segment
- Requirement 1.3: Maintain clean URLs across navigations
- Requirement 2.1: Consistent path format with leading slashes
- Requirement 2.3: Use absolute paths starting with `/member/`
- Requirement 4.1-4.5: Correct navigation for all menu items

## Known Issues

- Jest ESM configuration may require additional setup
- Some tests may need to be run with `--experimental-vm-modules` flag
- Mock setup for react-router-dom may need adjustment based on version

## Future Improvements

- Add integration tests with actual routing
- Add E2E tests with Playwright or Cypress
- Add performance tests for navigation speed
- Add accessibility tests for keyboard navigation
