# Requirements Document

## Introduction

Aplikasi Canvango Group perlu memastikan semua fitur yang memerlukan database dan authentication terintegrasi sepenuhnya dengan Supabase. Saat ini, frontend sudah menggunakan Supabase Auth, namun backend masih menggunakan PostgreSQL connection pool langsung dan memiliki controller auth yang duplikat. Requirement ini bertujuan untuk memastikan konsistensi integrasi Supabase di seluruh aplikasi.

## Glossary

- **Supabase**: Backend-as-a-Service platform yang menyediakan PostgreSQL database, authentication, dan real-time subscriptions
- **Supabase Client**: JavaScript client library untuk berinteraksi dengan Supabase services
- **Backend System**: Express.js server yang menangani business logic dan API endpoints
- **Frontend System**: React application yang berinteraksi dengan users
- **Database Connection Pool**: PostgreSQL connection pool yang digunakan untuk query database
- **Auth Controller**: Backend controller yang menangani authentication endpoints
- **Data Models**: TypeScript classes yang merepresentasikan database tables dan operations

## Requirements

### Requirement 1: Backend Database Integration

**User Story:** Sebagai developer, saya ingin backend menggunakan Supabase client untuk semua database operations, sehingga dapat memanfaatkan fitur-fitur Supabase seperti Row Level Security dan real-time subscriptions.

#### Acceptance Criteria

1. WHEN Backend System initializes database connection, THE Backend System SHALL use Supabase client instead of raw PostgreSQL connection pool
2. WHEN Backend System performs database queries, THE Backend System SHALL use Supabase client methods (select, insert, update, delete)
3. WHERE database configuration exists, THE Backend System SHALL configure Supabase client with project URL and service role key
4. THE Backend System SHALL maintain backward compatibility with existing API endpoints
5. THE Backend System SHALL handle Supabase client errors appropriately and return meaningful error messages

### Requirement 2: Remove Duplicate Authentication Logic

**User Story:** Sebagai developer, saya ingin menghapus duplicate authentication logic di backend, sehingga authentication hanya ditangani oleh Supabase Auth dan menghindari konflik.

#### Acceptance Criteria

1. THE Backend System SHALL remove auth.controller.ts file that handles register and login endpoints
2. THE Backend System SHALL remove auth.routes.ts file that defines authentication routes
3. THE Backend System SHALL verify authentication using Supabase JWT tokens instead of custom JWT
4. WHEN Frontend System sends requests with Supabase auth token, THE Backend System SHALL validate token using Supabase client
5. THE Backend System SHALL maintain authorization middleware for role-based access control

### Requirement 3: Update Data Models to Use Supabase Client

**User Story:** Sebagai developer, saya ingin semua data models menggunakan Supabase client, sehingga dapat memanfaatkan type safety dan auto-generated types dari Supabase.

#### Acceptance Criteria

1. WHEN User Model performs database operations, THE User Model SHALL use Supabase client methods
2. WHEN Transaction Model performs database operations, THE Transaction Model SHALL use Supabase client methods
3. WHEN Claim Model performs database operations, THE Claim Model SHALL use Supabase client methods
4. WHEN Tutorial Model performs database operations, THE Tutorial Model SHALL use Supabase client methods
5. WHEN TopUp Model performs database operations, THE TopUp Model SHALL use Supabase client methods
6. WHEN SystemSettings Model performs database operations, THE SystemSettings Model SHALL use Supabase client methods
7. WHEN AdminAuditLog Model performs database operations, THE AdminAuditLog Model SHALL use Supabase client methods

### Requirement 4: Update Authentication Middleware

**User Story:** Sebagai developer, saya ingin authentication middleware menggunakan Supabase untuk validasi token, sehingga konsisten dengan frontend authentication.

#### Acceptance Criteria

1. WHEN Backend System receives request with Authorization header, THE Backend System SHALL extract Supabase JWT token
2. WHEN Backend System validates token, THE Backend System SHALL use Supabase client to verify token authenticity
3. IF token is invalid or expired, THEN THE Backend System SHALL return 401 Unauthorized response
4. WHEN token is valid, THE Backend System SHALL extract user information from token and attach to request object
5. THE Backend System SHALL maintain role-based authorization checks after authentication

### Requirement 5: Environment Configuration

**User Story:** Sebagai developer, saya ingin backend memiliki environment variables yang benar untuk Supabase, sehingga dapat terhubung ke Supabase project dengan aman.

#### Acceptance Criteria

1. THE Backend System SHALL require SUPABASE_URL environment variable for Supabase project URL
2. THE Backend System SHALL require SUPABASE_SERVICE_ROLE_KEY environment variable for server-side operations
3. THE Backend System SHALL validate presence of required Supabase environment variables on startup
4. IF required environment variables are missing, THEN THE Backend System SHALL log error and exit gracefully
5. THE Backend System SHALL use service role key only in backend and never expose it to frontend

### Requirement 6: Database Migration Compatibility

**User Story:** Sebagai developer, saya ingin memastikan database migrations tetap kompatibel dengan Supabase, sehingga schema changes dapat diterapkan dengan benar.

#### Acceptance Criteria

1. THE Backend System SHALL maintain existing SQL migration files for database schema
2. WHEN Backend System runs migrations, THE Backend System SHALL execute migrations using Supabase client or direct PostgreSQL connection
3. THE Backend System SHALL verify all tables exist in Supabase database after migration
4. THE Backend System SHALL document migration process for Supabase environment
5. THE Backend System SHALL support running migrations both locally and in Supabase hosted database

### Requirement 7: Testing and Validation

**User Story:** Sebagai developer, saya ingin memiliki tests yang memvalidasi integrasi Supabase, sehingga dapat memastikan semua fitur bekerja dengan benar.

#### Acceptance Criteria

1. THE Backend System SHALL update existing model tests to work with Supabase client
2. WHEN tests run, THE Backend System SHALL use test database or mock Supabase client
3. THE Backend System SHALL verify all CRUD operations work correctly with Supabase client
4. THE Backend System SHALL test authentication middleware with valid and invalid Supabase tokens
5. THE Backend System SHALL document testing approach for Supabase integration

### Requirement 8: Documentation Updates

**User Story:** Sebagai developer, saya ingin dokumentasi yang jelas tentang integrasi Supabase, sehingga team members lain dapat memahami dan maintain kode dengan mudah.

#### Acceptance Criteria

1. THE Backend System SHALL update README.md with Supabase setup instructions
2. THE Backend System SHALL document required environment variables for Supabase
3. THE Backend System SHALL provide examples of using Supabase client in models
4. THE Backend System SHALL document authentication flow with Supabase
5. THE Backend System SHALL update API documentation to reflect Supabase integration
