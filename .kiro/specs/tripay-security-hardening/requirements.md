# Requirements Document

## Introduction

This document outlines the security requirements for hardening the Tripay payment integration system. The system must prevent unauthorized topup transactions, protect sensitive account data, and ensure all payment callbacks are legitimate and properly validated. The implementation will focus on cryptographic validation, access control, data encryption, and idempotent transaction processing.

## Glossary

- **Payment System**: The Tripay payment gateway integration that handles topup transactions
- **Callback Handler**: The server-side endpoint that receives payment notifications from Tripay
- **Transaction Record**: The internal database record storing transaction details including reference, amount, user_id, and status
- **Signature Validation**: HMAC SHA-256 cryptographic verification using Tripay's private key
- **Account Data**: Sensitive Facebook/Business Manager account credentials stored in the database
- **Idempotent Processing**: Ensuring a callback is processed exactly once, preventing duplicate balance updates
- **Rate Limiter**: Mechanism to restrict the number of requests from a single source within a time window
- **Session Token**: JWT or Supabase Auth token used to authenticate user requests
- **Role-Based Access Control (RBAC)**: Permission system distinguishing between user, admin, and superadmin roles

## Requirements

### Requirement 1: Callback Authentication and Validation

**User Story:** As a system administrator, I want all Tripay callbacks to be cryptographically validated, so that only legitimate payment notifications are processed.

#### Acceptance Criteria

1. WHEN a callback request is received, THE Callback Handler SHALL extract the signature from the request headers
2. WHEN the signature is extracted, THE Callback Handler SHALL compute the expected HMAC SHA-256 hash using the Tripay private key and request body
3. IF the computed signature does not match the provided signature, THEN THE Callback Handler SHALL reject the request with HTTP 403 status
4. WHEN the signature is valid, THE Callback Handler SHALL verify the source IP address against Tripay's official IP whitelist
5. IF the source IP is not in the whitelist, THEN THE Callback Handler SHALL reject the request with HTTP 403 status

### Requirement 2: Transaction Amount Integrity

**User Story:** As a system administrator, I want the topup amount to be determined solely from internal database records, so that attackers cannot manipulate payment amounts through callback payloads.

#### Acceptance Criteria

1. WHEN a valid callback is received, THE Callback Handler SHALL extract the transaction reference from the callback payload
2. WHEN the reference is extracted, THE Callback Handler SHALL query the Transaction Record from the internal database using the reference
3. IF no Transaction Record exists for the reference, THEN THE Callback Handler SHALL reject the callback and log the incident
4. WHEN the Transaction Record is found, THE Callback Handler SHALL use the amount stored in the Transaction Record for balance updates
5. THE Callback Handler SHALL NOT use the amount_received or any amount field from the callback payload for balance calculations

### Requirement 3: Transaction Matching and Verification

**User Story:** As a system administrator, I want all callback data to be cross-verified with internal transaction records, so that only matching and legitimate transactions are processed.

#### Acceptance Criteria

1. WHEN a Transaction Record is retrieved, THE Callback Handler SHALL verify that the user_id in the callback matches the user_id in the Transaction Record
2. WHEN verifying transaction details, THE Callback Handler SHALL verify that the payment method in the callback matches the payment method in the Transaction Record
3. WHEN verifying transaction details, THE Callback Handler SHALL verify that the transaction status in the callback is "PAID"
4. IF any verification check fails, THEN THE Callback Handler SHALL reject the callback and log the mismatch details
5. WHEN all verifications pass, THE Callback Handler SHALL proceed to update the user balance

### Requirement 4: Idempotent Transaction Processing

**User Story:** As a system administrator, I want each payment callback to be processed exactly once, so that duplicate callbacks do not result in multiple balance credits.

#### Acceptance Criteria

1. WHEN a callback is validated, THE Callback Handler SHALL check if the Transaction Record status is already "completed"
2. IF the Transaction Record status is "completed", THEN THE Callback Handler SHALL return HTTP 200 without processing the callback again
3. WHEN processing a new callback, THE Callback Handler SHALL update the Transaction Record status to "completed" within a database transaction
4. WHEN updating the user balance, THE Callback Handler SHALL use an atomic database operation to prevent race conditions
5. IF the database transaction fails, THEN THE Callback Handler SHALL rollback all changes and return an error status

### Requirement 5: API Endpoint Protection

**User Story:** As a system administrator, I want all sensitive API endpoints to require authentication, so that unauthorized users cannot access or manipulate transaction data.

#### Acceptance Criteria

1. WHEN a request is made to a sensitive endpoint, THE Payment System SHALL verify the presence of a valid Session Token
2. IF no Session Token is present or the token is invalid, THEN THE Payment System SHALL reject the request with HTTP 401 status
3. WHEN a Session Token is validated, THE Payment System SHALL extract the user role from the token
4. WHEN processing role-restricted operations, THE Payment System SHALL verify the user has the required role (user, admin, or superadmin)
5. IF the user role is insufficient, THEN THE Payment System SHALL reject the request with HTTP 403 status

### Requirement 6: Account Data Encryption

**User Story:** As a system administrator, I want all Facebook/Business Manager account credentials to be encrypted at rest, so that database breaches do not expose sensitive account information.

#### Acceptance Criteria

1. WHEN storing Account Data, THE Payment System SHALL encrypt the credentials using AES-256-GCM encryption
2. WHEN encrypting Account Data, THE Payment System SHALL use a unique encryption key stored securely in environment variables
3. WHEN retrieving Account Data, THE Payment System SHALL decrypt the credentials only for authorized requests
4. THE Payment System SHALL NOT expose Account Data through any API endpoint without superadmin authentication
5. WHEN logging or error reporting, THE Payment System SHALL NOT include plaintext Account Data in logs

### Requirement 7: Rate Limiting and Abuse Prevention

**User Story:** As a system administrator, I want rate limiting on authentication and transaction endpoints, so that brute force attacks and API abuse are prevented.

#### Acceptance Criteria

1. WHEN a request is made to the login endpoint, THE Payment System SHALL track the number of requests from the source IP address
2. IF the number of login requests exceeds 5 attempts within 15 minutes, THEN THE Payment System SHALL reject subsequent requests with HTTP 429 status
3. WHEN a request is made to transaction creation endpoints, THE Payment System SHALL limit requests to 10 per minute per authenticated user
4. WHEN a request is made to the callback endpoint, THE Payment System SHALL limit requests to 100 per minute from Tripay IP addresses
5. WHEN rate limits are exceeded, THE Payment System SHALL log the incident with source IP and timestamp

### Requirement 8: Secure Callback Endpoint Implementation

**User Story:** As a system administrator, I want the callback endpoint to be implemented as a server-side function, so that it cannot be bypassed or manipulated through client-side code.

#### Acceptance Criteria

1. THE Callback Handler SHALL be implemented as a Supabase Edge Function or server-side API route
2. THE Callback Handler SHALL NOT be accessible through client-side JavaScript code
3. WHEN the callback endpoint is deployed, THE Payment System SHALL configure CORS to reject browser-based requests
4. THE Callback Handler SHALL validate all input parameters and sanitize data to prevent SQL injection
5. THE Callback Handler SHALL validate all input parameters and sanitize data to prevent XSS attacks

### Requirement 9: Audit Logging and Monitoring

**User Story:** As a system administrator, I want comprehensive logging of all security events, so that suspicious activities can be detected and investigated.

#### Acceptance Criteria

1. WHEN a callback signature validation fails, THE Callback Handler SHALL log the event with timestamp, source IP, and signature details
2. WHEN a transaction mismatch is detected, THE Callback Handler SHALL log the event with transaction reference and mismatch details
3. WHEN rate limits are exceeded, THE Payment System SHALL log the event with source IP and endpoint details
4. WHEN unauthorized access attempts occur, THE Payment System SHALL log the event with user identifier and requested resource
5. THE Payment System SHALL store audit logs in a separate database table with read-only access for non-superadmin users

### Requirement 10: Merchant Reporting Separation

**User Story:** As a system administrator, I want merchant fee information to be tracked separately from user balance calculations, so that reporting data does not affect user credits.

#### Acceptance Criteria

1. WHEN a callback is processed, THE Callback Handler SHALL store the amount_received value in a separate merchant_report field
2. THE Callback Handler SHALL NOT use the amount_received value for user balance calculations
3. WHEN generating merchant reports, THE Payment System SHALL use the merchant_report field for fee analysis
4. WHEN updating user balance, THE Payment System SHALL use only the amount field from the Transaction Record
5. THE Payment System SHALL maintain a clear separation between merchant reporting data and user balance data in the database schema
