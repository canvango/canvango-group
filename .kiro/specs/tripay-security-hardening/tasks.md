# Implementation Plan

## Phase 1: Critical Security Foundation

- [x] 1. Create security infrastructure and shared utilities


  - Create `supabase/functions/_shared/security.ts` with IP validation, signature verification, and input sanitization utilities
  - Create `supabase/functions/_shared/audit.ts` with comprehensive security event logging functions
  - Create `supabase/functions/_shared/constants.ts` with Tripay IP whitelist and security configuration
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 9.1, 9.2, 9.3, 9.4_

- [x] 2. Create security_events database table


  - [x] 2.1 Create migration file for security_events table


    - Write migration SQL to create security_events table with columns: id, event_type, severity, source_ip, user_id, endpoint, details (JSONB), created_at
    - Add indexes on event_type, severity, and created_at for query performance
    - Add RLS policies: only admins can view security events
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 2.2 Enhance audit_logs table with new action types


    - Write migration to add new CHECK constraint with security-related action types: CALLBACK_RECEIVED, CALLBACK_SIGNATURE_FAIL, CALLBACK_IP_FAIL, RATE_LIMIT_EXCEEDED, UNAUTHORIZED_ACCESS, ENCRYPTION_KEY_ACCESS
    - Ensure backward compatibility with existing action types
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 3. Enhance Tripay callback handler with security validations


  - [x] 3.1 Add IP whitelist validation to callback handler


    - Implement IP extraction from headers (X-Forwarded-For, X-Real-IP)
    - Implement CIDR range validation for Tripay IPs (103.140.36-39.0/24)
    - Add feature flag ENABLE_IP_VALIDATION (default: false for monitoring mode)
    - Log IP validation results to security_events (warning mode initially)
    - _Requirements: 1.4, 1.5, 9.1, 9.2_
  
  - [x] 3.2 Enhance signature verification with security logging

    - Add detailed logging for signature verification process (expected vs received)
    - Log signature failures to security_events with severity 'high'
    - Implement constant-time comparison for signature verification
    - Add counter for repeated signature failures from same IP
    - _Requirements: 1.1, 1.2, 1.3, 9.1, 9.2_
  
  - [x] 3.3 Implement transaction matching and amount verification

    - Query transaction from database using merchant_ref
    - Verify user_id matches between callback and database record
    - Verify payment_method matches between callback and database record
    - Verify transaction status is valid for processing
    - Use amount from database record ONLY (never from callback payload)
    - Log any mismatches to security_events with severity 'critical'
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4_
  
  - [x] 3.4 Enhance idempotency protection

    - Check security_events table for previous CALLBACK_RECEIVED events with same reference
    - Return 200 OK immediately if already processed (no balance update)
    - Log idempotency check results
    - Add database constraint to prevent duplicate processing
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 3.5 Add comprehensive audit logging to callback handler

    - Log every callback attempt (success and failure) to security_events
    - Log transaction matching results
    - Log balance update operations
    - Include full callback payload in audit log (for forensics)
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_


## Phase 2: Data Protection and Encryption

- [x] 4. Implement encryption service for account data


  - [x] 4.1 Create encryption utility module



    - Create `supabase/functions/_shared/encryption.ts` with AES-256-GCM implementation
    - Implement encrypt() function: generate random IV, encrypt plaintext, return ciphertext + IV + auth tag
    - Implement decrypt() function: verify auth tag, decrypt ciphertext, return plaintext
    - Add error handling for invalid ciphertext or corrupted data
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 4.2 Add encryption key management


    - Add ENCRYPTION_MASTER_KEY to Supabase secrets (not environment variables)
    - Implement key derivation function for generating encryption keys
    - Add key rotation mechanism (support multiple key versions)
    - Ensure encryption keys are never logged or exposed in errors
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  
  - [x] 4.3 Update product_accounts data access to support encryption


    - Modify account data read operations to detect encrypted vs plaintext format
    - If encrypted format detected, decrypt before returning to caller
    - If plaintext format detected, return as-is (backward compatibility)
    - Add error handling for decryption failures
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 4.4 Update product_accounts data write operations to use encryption


    - Modify all account data write operations to encrypt before storing
    - Store encrypted data in format: {encrypted: true, version: 1, data: {ciphertext, iv, tag}}
    - Ensure new accounts are always encrypted
    - Add validation to prevent storing plaintext in new records
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 4.5 Create background migration job for existing account data


    - Create Edge Function to migrate plaintext accounts to encrypted format
    - Process accounts in batches of 100 per hour to avoid load spikes
    - Log migration progress to audit_logs
    - Add retry mechanism for failed encryptions
    - Verify data integrity after migration (decrypt and compare)
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 5. Implement RLS policies for encrypted account data access



  - [x] 5.1 Create superadmin-only access policy for product_accounts


    - Create RLS policy: only users with role='superadmin' can SELECT from product_accounts
    - Remove or restrict existing admin access policies
    - Test that admins cannot access encrypted account data
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.4_
  
  - [x] 5.2 Create user access policy for purchased accounts only

    - Create RLS policy: users can SELECT product_accounts only if assigned_to_transaction_id matches their transaction
    - Ensure users can only see their own purchased accounts
    - Test that users cannot access other users' accounts
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 5.3 Add audit logging for all account data access

    - Log every SELECT operation on product_accounts to audit_logs
    - Include user_id, account_id, and timestamp
    - Log encryption key access attempts to security_events
    - Alert admin if non-superadmin attempts to access encrypted data
    - _Requirements: 5.5, 6.4, 6.5, 9.1, 9.4_


## Phase 3: Access Control and Rate Limiting

- [x] 6. Implement rate limiting infrastructure


  - [x] 6.1 Create rate limiting utility with Deno KV


    - Create `supabase/functions/_shared/rateLimit.ts` with Deno KV-based rate limiting
    - Implement checkRateLimit() function: track requests per key (IP or user_id) within time window
    - Implement getRateLimitConfig() function: return limits based on endpoint
    - Add automatic cleanup of expired rate limit entries
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 6.2 Add rate limiting to callback endpoint


    - Apply rate limit: 100 requests per minute from Tripay IPs
    - Add feature flag ENABLE_CALLBACK_RATE_LIMIT (default: false for monitoring)
    - Log rate limit violations to security_events
    - Return 429 status with Retry-After header when limit exceeded
    - _Requirements: 7.1, 7.4, 7.5_
  
  - [x] 6.3 Add rate limiting to payment creation endpoint


    - Apply rate limit: 10 requests per minute per authenticated user
    - Add feature flag ENABLE_PAYMENT_RATE_LIMIT (default: false for monitoring)
    - Log rate limit violations to security_events
    - Return 429 status with clear error message
    - _Requirements: 7.1, 7.3, 7.5_
  
  - [x] 6.4 Add rate limiting to authentication endpoints

    - Apply rate limit: 5 login attempts per 15 minutes per IP
    - Implement temporary ban after exceeding limit
    - Log all rate limit violations to security_events with severity 'medium'
    - Add CAPTCHA requirement after 3 failed attempts
    - _Requirements: 7.1, 7.2, 7.5_

- [x] 7. Enhance role-based access control (RBAC)

  - [x] 7.1 Create RBAC utility module


    - Create `supabase/functions/_shared/rbac.ts` with permission checking functions
    - Define permission matrix for all resources and actions
    - Implement hasPermission() function: check if user role has permission for resource/action
    - Implement requireRole() middleware: reject requests if user lacks required role
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 7.2 Add role validation to sensitive endpoints

    - Add role check to payment creation: require 'member' or higher
    - Add role check to transaction viewing: users see own only, admins see all
    - Add role check to account data access: superadmin only
    - Add role check to settings management: admin or superadmin only
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 7.3 Enhance RLS policies with role-based rules

    - Update transactions RLS: users can view own, admins can view all
    - Update users RLS: users can update own profile, admins can manage all
    - Update product_accounts RLS: superadmin only for full access
    - Update system_settings RLS: admin and superadmin only
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_


## Phase 4: Input Validation and Attack Prevention

- [x] 8. Implement comprehensive input validation and sanitization

  - [x] 8.1 Create input validation utility module

    - Create `supabase/functions/_shared/validation.ts` with validation functions
    - Implement sanitizeInput() function: remove SQL injection patterns, XSS scripts, and malicious code
    - Implement validateTransactionData() function: validate all transaction fields against schema
    - Implement validateCallbackPayload() function: validate Tripay callback structure and data types
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 8.2 Add input sanitization to callback handler

    - Sanitize all string fields in callback payload before processing
    - Validate numeric fields are within expected ranges
    - Validate enum fields (status, payment_method) against allowed values
    - Reject callback if validation fails, log to security_events
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 8.3 Add input sanitization to payment creation

    - Sanitize customer_name, customer_email, customer_phone before storing
    - Validate amount is positive and within reasonable range
    - Validate payment_method is in allowed list
    - Validate order_items structure and content
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 8.4 Add CORS and security headers

    - Configure CORS to reject browser-based requests to callback endpoint
    - Add Content-Security-Policy headers to prevent XSS
    - Add X-Content-Type-Options: nosniff header
    - Add X-Frame-Options: DENY header
    - _Requirements: 8.1, 8.3, 8.5_

- [x] 9. Implement merchant reporting separation

  - [x] 9.1 Add merchant_report field to transactions table

    - Create migration to add merchant_report JSONB column to transactions table
    - Store amount_received from callback in merchant_report field
    - Ensure merchant_report is never used for balance calculations
    - Add comment to clarify field is for reporting only
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 9.2 Update callback handler to populate merchant_report

    - Extract amount_received, fee_merchant, fee_customer from callback
    - Store in merchant_report field as JSONB object
    - Verify balance update uses amount from database, not merchant_report
    - Add validation to ensure merchant_report doesn't affect user balance
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [x] 9.3 Create merchant reporting query functions

    - Create database function to calculate total fees from merchant_report
    - Create database function to generate merchant revenue reports
    - Ensure reporting functions only use merchant_report field
    - Add RLS policy: only admins can access merchant reports
    - _Requirements: 10.1, 10.3, 10.5_


## Phase 5: Monitoring, Testing, and Documentation

- [x] 10. Implement security monitoring and alerting

  - [x] 10.1 Create security monitoring dashboard queries

    - Create database view for recent security events grouped by severity
    - Create database view for callback success rate over time
    - Create database view for rate limit violations by endpoint
    - Create database view for failed authentication attempts by IP
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 10.2 Create alerting mechanism for critical events

    - Create Edge Function to check for critical security events every 5 minutes
    - Send alert to admin if signature validation fails more than 3 times from same IP
    - Send alert if callback success rate drops below 95%
    - Send alert if unauthorized access attempts exceed threshold
    - _Requirements: 9.1, 9.2, 9.4_
  
  - [x] 10.3 Create security audit report generator

    - Create Edge Function to generate daily security audit report
    - Include: callback success rate, security events summary, rate limit violations, encryption status
    - Store reports in audit_logs table
    - Send summary email to admin
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 11. Write comprehensive tests for security features

  - [x] 11.1 Write unit tests for encryption service

    - Test encryption/decryption round-trip with various data sizes
    - Test authentication tag verification (reject tampered data)
    - Test key derivation and IV generation
    - Test error handling for invalid ciphertext
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 11.2 Write unit tests for IP validation

    - Test valid Tripay IPs from all CIDR ranges
    - Test invalid IPs are rejected
    - Test CIDR range parsing and matching
    - Test proxy header extraction (X-Forwarded-For)
    - _Requirements: 1.4, 1.5_
  
  - [x] 11.3 Write unit tests for signature verification

    - Test valid signatures are accepted
    - Test invalid signatures are rejected
    - Test constant-time comparison (timing attack resistance)
    - Test signature generation matches Tripay format
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 11.4 Write integration tests for callback flow

    - Test complete callback flow: IP check → signature → transaction match → balance update
    - Test idempotency: same callback twice only updates balance once
    - Test invalid signature callback is rejected with 403
    - Test invalid IP callback is rejected with 403
    - Test transaction not found returns 404
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [x] 11.5 Write security penetration tests

    - Test signature spoofing attempts are rejected
    - Test replay attack protection (old callback rejected)
    - Test amount manipulation (callback amount ignored, database amount used)
    - Test SQL injection attempts are sanitized
    - Test XSS attempts are escaped
    - Test rate limit bypass attempts fail
    - _Requirements: 2.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 12. Create deployment and rollback procedures

  - [x] 12.1 Create deployment checklist and scripts

    - Write pre-deployment checklist: backup database, test staging, prepare rollback
    - Create deployment script with feature flags (all disabled initially)
    - Create health check script to verify callback endpoint
    - Create monitoring script to track deployment metrics
    - _Requirements: All requirements_
  
  - [x] 12.2 Create rollback procedures and scripts

    - Write rollback script to disable all feature flags
    - Create database rollback migrations for each phase
    - Document rollback triggers (callback success < 95%, balance errors > 0)
    - Test rollback procedures in staging environment
    - _Requirements: All requirements_
  
  - [x] 12.3 Create gradual enablement plan

    - Document phase 1: Enable IP validation in warning mode (1 week)
    - Document phase 2: Enable encryption for new accounts (1 week)
    - Document phase 3: Enable rate limiting in monitoring mode (1 week)
    - Document phase 4: Full enforcement of all security features
    - _Requirements: All requirements_

- [x] 13. Create comprehensive documentation


  - [x] 13.1 Document security architecture and design decisions

    - Write architecture overview with security layers diagram
    - Document encryption algorithm choice and key management
    - Document rate limiting strategy and limits per endpoint
    - Document RBAC permission matrix
    - _Requirements: All requirements_
  
  - [x] 13.2 Create operational runbooks

    - Write runbook for responding to security incidents
    - Write runbook for investigating callback failures
    - Write runbook for rotating encryption keys
    - Write runbook for adjusting rate limits
    - _Requirements: 6.2, 7.5, 9.1, 9.2, 9.4_
  
  - [x] 13.3 Create developer guide for security features

    - Document how to add new encrypted fields
    - Document how to add rate limiting to new endpoints
    - Document how to add new security event types
    - Document how to test security features locally
    - _Requirements: 6.1, 6.2, 6.3, 7.1, 9.1_
