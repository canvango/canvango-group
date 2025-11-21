# Implementation Plan: Supabase Full Integration

## Overview

This implementation plan breaks down the Supabase integration into discrete, manageable tasks. Each task builds on previous ones to ensure a smooth migration from direct PostgreSQL connection to Supabase client.

## Tasks

- [x] 1. Setup Supabase Client Configuration






  - Create Supabase client singleton with service role key
  - Add environment variable validation on startup
  - Generate TypeScript types from Supabase schema
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 1.1 Create Supabase client configuration file



  - Write `canvango-app/backend/src/config/supabase.ts` with singleton pattern
  - Implement `getSupabaseClient()` function that returns typed Supabase client
  - Add error handling for missing environment variables
  - _Requirements: 5.1, 5.2, 5.3_


- [x] 1.2 Add Supabase environment variables


  - Update `canvango-app/backend/.env` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
  - Update `canvango-app/backend/.env.example` with Supabase variable templates
  - Add validation in `canvango-app/backend/src/index.ts` to check required variables on startup
  - _Requirements: 5.1, 5.2, 5.3, 5.4_


- [x] 1.3 Generate TypeScript types from Supabase schema




  - Run Supabase CLI command to generate types: `npx supabase gen types typescript`
  - Save generated types to `canvango-app/backend/src/types/database.types.ts`
  - Update Supabase client configuration to use generated types
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 2. Update Authentication Middleware





  - Refactor auth middleware to validate Supabase JWT tokens
  - Remove custom JWT verification logic
  - Update request interface to include Supabase user info
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 2.1 Refactor authentication middleware


  - Update `canvango-app/backend/src/middleware/auth.middleware.ts` to use Supabase `getUser()` method
  - Extract user ID and email from Supabase auth user
  - Fetch user role from database using Supabase client
  - Handle cases where user exists in Supabase Auth but not in users table
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 2.2 Update role middleware for compatibility


  - Verify `canvango-app/backend/src/middleware/role.middleware.ts` works with updated auth middleware
  - Ensure role checks use user info from Supabase token
  - Test admin, member, and guest role authorization
  - _Requirements: 4.5_

- [x] 3. Remove Duplicate Authentication Logic





  - Delete auth controller and routes that conflict with Supabase Auth
  - Update main server file to remove auth routes
  - Verify no other files reference deleted auth endpoints
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 3.1 Remove auth controller and routes


  - Delete `canvango-app/backend/src/controllers/auth.controller.ts`
  - Delete `canvango-app/backend/src/routes/auth.routes.ts`
  - Remove auth routes import and usage from `canvango-app/backend/src/index.ts`
  - _Requirements: 2.1, 2.2_


- [x] 3.2 Verify no references to deleted auth endpoints


  - Search codebase for imports of deleted auth controller
  - Check for any API calls to `/api/auth/register` or `/api/auth/login` in backend
  - Update any documentation that references old auth endpoints
  - _Requirements: 2.3_

-

- [x] 4. Refactor User Model to Use Supabase Client


  - Replace PostgreSQL pool queries with Supabase client methods
  - Update all CRUD operations to use Supabase syntax
  - Remove password hashing logic (handled by Supabase Auth)
  - _Requirements: 3.1, 1.1, 1.2_

- [x] 4.1 Update User model basic operations


  - Refactor `findById()`, `findByEmail()`, `findByUsername()` methods in `canvango-app/backend/src/models/User.model.ts`
  - Replace `pool.query()` with Supabase `.from().select().eq().single()`
  - Handle Supabase error codes (PGRST116 for no rows)
  - _Requirements: 3.1, 1.1_

- [x] 4.2 Update User model create and update operations


  - Refactor `create()` method to use Supabase `.insert()`
  - Refactor `update()` method to use Supabase `.update()`
  - Remove password hashing from create method (Supabase Auth handles this)
  - Update method signatures to accept Supabase auth user ID
  - _Requirements: 3.1, 1.1_

- [x] 4.3 Update User model query operations


  - Refactor `findAll()` method to use Supabase query builder
  - Implement filtering with `.eq()`, `.or()`, `.ilike()`
  - Implement pagination with `.range()` and `.limit()`
  - Refactor `count()` method to use Supabase count option
  - _Requirements: 3.1, 1.1_

- [x] 4.4 Update User model balance operations


  - Create PostgreSQL function `update_user_balance` for atomic balance updates
  - Refactor `updateBalance()` method to use Supabase RPC call
  - Add error handling for insufficient balance
  - _Requirements: 3.1, 1.1, 6.2_

-

- [x] 5. Refactor Transaction Model to Use Supabase Client



  - Replace PostgreSQL pool queries with Supabase client methods
  - Update all CRUD operations and statistics methods
  - Implement proper error handling for Supabase errors
  - _Requirements: 3.2, 1.1, 1.2_


- [x] 5.1 Update Transaction model basic operations

  - Refactor `findById()`, `findByUserId()` methods in `canvango-app/backend/src/models/Transaction.model.ts`
  - Replace `pool.query()` with Supabase client methods
  - Update filtering and pagination logic
  - _Requirements: 3.2, 1.1_


- [x] 5.2 Update Transaction model create and update operations

  - Refactor `create()` method to use Supabase `.insert()`
  - Refactor `update()` and `updateStatus()` methods to use Supabase `.update()`
  - Refactor `delete()` method to use Supabase `.delete()`
  - _Requirements: 3.2, 1.1_



- [x] 5.3 Update Transaction model statistics operations










  - Refactor `getStatistics()` method to use Supabase aggregation queries
  - Consider creating PostgreSQL function for complex statistics
  - Update `count()` method to use Supabase count option
  - _Requirements: 3.2, 1.1_

- [x] 6. Refactor Claim Model to Use Supabase Client




  - Replace PostgreSQL pool queries with Supabase client methods
  - Update all CRUD operations for claims
  - Implement proper error handling
  - _Requirements: 3.3, 1.1, 1.2_

- [x] 6.1 Update Claim model operations


  - Refactor all methods in `canvango-app/backend/src/models/Claim.model.ts`
  - Replace `pool.query()` with Supabase client methods
  - Update filtering, pagination, and status update logic
  - _Requirements: 3.3, 1.1_
-

- [x] 7. Refactor Tutorial Model to Use Supabase Client




  - Replace PostgreSQL pool queries with Supabase client methods
  - Update all CRUD operations for tutorials
  - Implement view count increment with RPC
  - _Requirements: 3.4, 1.1, 1.2_


- [x] 7.1 Update Tutorial model operations

  - Refactor all methods in `canvango-app/backend/src/models/Tutorial.model.ts`
  - Replace `pool.query()` with Supabase client methods
  - Create RPC function for incrementing view count atomically
  - _Requirements: 3.4, 1.1_


- [x] 8. Refactor TopUp Model to Use Supabase Client



  - Replace PostgreSQL pool queries with Supabase client methods
  - Update all CRUD operations for top-ups
  - Implement proper error handling
  - _Requirements: 3.5, 1.1, 1.2_

- [x] 8.1 Update TopUp model operations


  - Refactor all methods in `canvango-app/backend/src/models/TopUp.model.ts`
  - Replace `pool.query()` with Supabase client methods
  - Update filtering and status update logic
  - _Requirements: 3.5, 1.1_
-

- [x] 9. Refactor SystemSettings Model to Use Supabase Client




  - Replace PostgreSQL pool queries with Supabase client methods
  - Update all CRUD operations for system settings
  - Implement proper error handling
  - _Requirements: 3.6, 1.1, 1.2_


- [x] 9.1 Update SystemSettings model operations

  - Refactor all methods in `canvango-app/backend/src/models/SystemSettings.model.ts`
  - Replace `pool.query()` with Supabase client methods
  - Update get and set operations for settings
  - _Requirements: 3.6, 1.1_
-

- [x] 10. Refactor AdminAuditLog Model to Use Supabase Client




  - Replace PostgreSQL pool queries with Supabase client methods
  - Update all CRUD operations for audit logs
  - Implement proper error handling
  - _Requirements: 3.7, 1.1, 1.2_


- [x] 10.1 Update AdminAuditLog model operations

  - Refactor all methods in `canvango-app/backend/src/models/AdminAuditLog.model.ts`
  - Replace `pool.query()` with Supabase client methods
  - Update filtering and pagination logic
  - _Requirements: 3.7, 1.1_
-

- [x] 11. Create Database Functions for Complex Operations



  - Create PostgreSQL functions for atomic operations
  - Deploy functions to Supabase database
  - Update models to use RPC calls
  - _Requirements: 6.1, 6.2, 6.3_


- [x] 11.1 Create update_user_balance function

  - Write SQL function in `canvango-app/backend/src/database/functions/update_user_balance.sql`
  - Implement atomic balance update with validation
  - Add error handling for insufficient balance
  - Deploy function to Supabase via migration or SQL editor
  - _Requirements: 6.2_


- [x] 11.2 Create increment_tutorial_views function

  - Write SQL function in `canvango-app/backend/src/database/functions/increment_tutorial_views.sql`
  - Implement atomic view count increment
  - Deploy function to Supabase
  - _Requirements: 6.2_



- [x] 11.3 Document database functions


  - Create documentation file `canvango-app/backend/DATABASE_FUNCTIONS.md`
  - Document each RPC function with parameters and return types
  - Provide usage examples
  - _Requirements: 8.3_
-

- [x] 12. Update Database Configuration




  - Keep existing database.ts for migrations
  - Update migration script to work with Supabase
  - Document migration process
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_


- [x] 12.1 Update migration script compatibility

  - Verify `canvango-app/backend/src/database/migrate.ts` works with Supabase PostgreSQL
  - Update connection logic to support both local and Supabase databases
  - Test running migrations against Supabase database
  - _Requirements: 6.2, 6.3_


- [x] 12.2 Update seed script compatibility

  - Verify `canvango-app/backend/src/database/seed.ts` works with Supabase
  - Update to use Supabase client for seeding data
  - Test seeding against Supabase database
  - _Requirements: 6.2, 6.3_

- [x] 13. Update Tests for Supabase Integration





  - Update unit tests to mock Supabase client
  - Update integration tests to use Supabase
  - Verify all tests pass
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_


- [x] 13.1 Update User model tests

  - Update `canvango-app/backend/src/__tests__/models/User.model.test.ts`
  - Mock Supabase client methods
  - Test all User model operations
  - _Requirements: 7.1, 7.2, 7.3_


- [x] 13.2 Update Transaction model tests

  - Update `canvango-app/backend/src/__tests__/models/Transaction.model.test.ts`
  - Mock Supabase client methods
  - Test all Transaction model operations
  - _Requirements: 7.1, 7.2, 7.3_


- [x] 13.3 Update authentication middleware tests

  - Create or update tests for auth middleware
  - Test Supabase token validation
  - Test error cases (invalid token, expired token, missing token)
  - _Requirements: 7.4_
-

- [x] 14. Update Documentation




  - Update README with Supabase setup instructions
  - Update DATABASE.md with Supabase information
  - Update API documentation
  - Create migration guide
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_


- [x] 14.1 Update README.md

  - Add Supabase setup section to `canvango-app/README.md`
  - Document required environment variables
  - Add instructions for getting Supabase credentials
  - Document type generation command
  - _Requirements: 8.1, 8.2_


- [x] 14.2 Update DATABASE.md

  - Update `canvango-app/backend/DATABASE.md` with Supabase connection info
  - Document how to run migrations against Supabase
  - Add section on database functions (RPC)
  - Update troubleshooting section
  - _Requirements: 8.1, 8.2, 8.3_


- [x] 14.3 Create Supabase migration guide

  - Create `canvango-app/backend/SUPABASE_MIGRATION.md`
  - Document step-by-step migration process
  - Include rollback instructions
  - Add troubleshooting tips
  - _Requirements: 8.1, 8.2, 8.3, 8.4_


- [x] 14.4 Update API documentation

  - Update `canvango-app/API_DOCUMENTATION.md` with authentication changes
  - Document that auth now uses Supabase tokens
  - Update error codes for Supabase-specific errors
  - Add examples of Authorization header format
  - _Requirements: 8.4, 8.5_
- [x] 15. Testing and Validation




- [ ] 15. Testing and Validation

  - Test all API endpoints with Supabase integration
  - Verify authentication flow works end-to-end
  - Test all CRUD operations
  - Verify error handling
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 15.1 Test authentication flow


  - Test register flow (frontend Supabase Auth)
  - Test login flow (frontend Supabase Auth)
  - Test API requests with Supabase JWT token
  - Verify backend validates tokens correctly
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 15.2 Test user management endpoints


  - Test GET /api/users/profile
  - Test PUT /api/users/profile
  - Test admin user management endpoints
  - Verify role-based authorization works
  - _Requirements: 3.1, 4.5_

- [x] 15.3 Test transaction endpoints


  - Test creating transactions
  - Test fetching transaction history
  - Test transaction statistics
  - Verify data integrity
  - _Requirements: 3.2_

- [x] 15.4 Test other feature endpoints



  - Test claim management endpoints
  - Test tutorial endpoints
  - Test top-up endpoints
  - Test system settings endpoints
  - Test admin audit log endpoints
  - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 16. Cleanup and Optimization




  - Remove unused database.ts pool exports
  - Optimize Supabase queries
  - Add caching where appropriate
  - Final code review
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 16.1 Remove old database connection code


  - Keep `canvango-app/backend/src/config/database.ts` only for migrations
  - Remove pool exports from models
  - Update imports throughout codebase
  - _Requirements: 1.1, 1.2_

- [x] 16.2 Optimize Supabase queries


  - Review all Supabase queries for efficiency
  - Add `.select()` with specific columns where possible
  - Ensure proper use of indexes
  - Add query performance logging
  - _Requirements: 1.4_

- [x] 16.3 Add caching layer


  - Implement simple in-memory cache for frequently accessed data
  - Cache user profiles, system settings
  - Add cache invalidation logic
  - _Requirements: 1.4_


-

- [x] 16.4 Final verification and cleanup





  - Run full test suite
  - Verify all endpoints work correctly
  - Check for any console errors or warnings
  - Remove any commented-out old code
  - Update version number in package.json
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

## Notes

- All tasks are required for comprehensive Supabase integration
- Each task includes specific file paths to modify
- Requirements are referenced for traceability
- Tasks should be executed in order as they build on each other
- Testing should be done after each major section (auth, models, etc.)
