# Design Document

## Overview

This document outlines the comprehensive security architecture for the Tripay payment integration system. The design focuses on preventing unauthorized topup transactions, protecting sensitive account data, and ensuring all payment callbacks are legitimate through multiple layers of security validation.

### Current State Analysis

**Existing Implementation:**
- Tripay callback handler in `supabase/functions/tripay-callback/index.ts`
- Payment creation in `supabase/functions/tripay-create-payment/index.ts`
- Database tables: `transactions`, `users`, `product_accounts`, `open_payments`
- Basic signature validation using HMAC SHA-256
- Idempotency check using audit_logs

**Security Gaps Identified:**
1. No IP whitelist validation for callbacks
2. Account data stored in plaintext in `product_accounts.account_data` (JSONB)
3. No rate limiting on endpoints
4. Missing comprehensive audit logging
5. No role-based access control for sensitive operations
6. Potential for race conditions in balance updates
7. No encryption for sensitive data at rest

## Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Layer 1: Network Security                 │
│  - IP Whitelist Validation                                   │
│  - Rate Limiting (Cloudflare/Supabase)                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                Layer 2: Cryptographic Validation             │
│  - HMAC SHA-256 Signature Verification                       │
│  - Timestamp Validation (prevent replay attacks)             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              Layer 3: Transaction Integrity                  │
│  - Database Record Matching                                  │
│  - Amount Verification (DB only, not from callback)          │
│  - Idempotency Check                                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                Layer 4: Access Control                       │
│  - JWT/Supabase Auth Validation                              │
│  - Role-Based Access Control (RBAC)                          │
│  - RLS Policies                                              │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                Layer 5: Data Protection                      │
│  - AES-256-GCM Encryption for Account Data                   │
│  - Secure Key Management                                     │
│  - Audit Logging                                             │
└─────────────────────────────────────────────────────────────┘
```

### System Components


**1. Callback Handler (Enhanced)**
- Location: `supabase/functions/tripay-callback/index.ts`
- Responsibilities:
  - IP whitelist validation
  - Signature verification
  - Transaction matching
  - Idempotent processing
  - Audit logging

**2. Payment Creation Service (Enhanced)**
- Location: `supabase/functions/tripay-create-payment/index.ts`
- Responsibilities:
  - User authentication
  - Rate limiting check
  - Transaction creation
  - Signature generation

**3. Encryption Service (New)**
- Location: `supabase/functions/_shared/encryption.ts`
- Responsibilities:
  - AES-256-GCM encryption/decryption
  - Key derivation
  - Secure random IV generation

**4. Security Middleware (New)**
- Location: `supabase/functions/_shared/security.ts`
- Responsibilities:
  - IP validation
  - Rate limiting
  - Request sanitization
  - XSS/SQL injection prevention

**5. Audit Service (Enhanced)**
- Location: `supabase/functions/_shared/audit.ts`
- Responsibilities:
  - Comprehensive event logging
  - Security incident tracking
  - Anomaly detection

## Components and Interfaces

### 1. Callback Handler Enhancement

**Interface:**
```typescript
interface CallbackRequest {
  headers: {
    'X-Callback-Signature': string;
    'X-Forwarded-For'?: string;
  };
  body: TripayCallbackPayload;
}

interface TripayCallbackPayload {
  reference: string;
  merchant_ref: string;
  payment_method: string;
  amount: number;
  amount_received: number;
  status: 'PAID' | 'UNPAID' | 'EXPIRED' | 'FAILED';
  paid_at?: string;
  // ... other fields
}

interface CallbackResponse {
  success: boolean;
  message?: string;
}
```

**Security Flow:**
1. Extract source IP from headers
2. Validate IP against Tripay whitelist
3. Extract raw body for signature verification
4. Compute HMAC SHA-256 signature
5. Compare signatures (constant-time comparison)
6. Check idempotency (audit_logs)
7. Query transaction from database
8. Verify transaction details match
9. Update transaction status
10. Log to audit_logs


### 2. IP Whitelist Validation

**Tripay Official IP Addresses:**
```typescript
const TRIPAY_IP_WHITELIST = [
  '103.140.36.0/24',    // 103.140.36.0 - 103.140.36.255
  '103.140.37.0/24',    // 103.140.37.0 - 103.140.37.255
  '103.140.38.0/24',    // 103.140.38.0 - 103.140.38.255
  '103.140.39.0/24',    // 103.140.39.0 - 103.140.39.255
];
```

**Implementation:**
```typescript
function isValidTripayIP(ip: string): boolean {
  // Parse CIDR ranges
  // Check if IP falls within any range
  // Return true if valid, false otherwise
}
```

**Edge Cases:**
- Handle IPv6 addresses
- Handle proxy headers (X-Forwarded-For, X-Real-IP)
- Allow localhost for development/testing

### 3. Encryption Service

**Algorithm:** AES-256-GCM (Galois/Counter Mode)
- Provides both confidentiality and authenticity
- Authenticated encryption prevents tampering
- 256-bit key for maximum security

**Key Management:**
```typescript
interface EncryptionConfig {
  masterKey: string; // From environment variable
  algorithm: 'aes-256-gcm';
  ivLength: 12; // 96 bits for GCM
  tagLength: 16; // 128 bits authentication tag
}
```

**Encryption Flow:**
```typescript
interface EncryptedData {
  ciphertext: string; // Base64 encoded
  iv: string;         // Base64 encoded
  tag: string;        // Base64 encoded authentication tag
}

function encrypt(plaintext: string): EncryptedData {
  // Generate random IV
  // Encrypt using AES-256-GCM
  // Return ciphertext, IV, and auth tag
}

function decrypt(encrypted: EncryptedData): string {
  // Verify authentication tag
  // Decrypt using AES-256-GCM
  // Return plaintext
}
```

**Storage Format in Database:**
```json
{
  "encrypted": true,
  "data": {
    "ciphertext": "base64_encoded_ciphertext",
    "iv": "base64_encoded_iv",
    "tag": "base64_encoded_tag"
  }
}
```


### 4. Rate Limiting Strategy

**Endpoint-Specific Limits:**

| Endpoint | Limit | Window | Action on Exceed |
|----------|-------|--------|------------------|
| `/tripay-callback` | 100 req | 1 min | 429 + Log incident |
| `/tripay-create-payment` | 10 req | 1 min | 429 + Log incident |
| Login endpoints | 5 req | 15 min | 429 + Temporary ban |
| Account data access | 20 req | 1 min | 429 + Alert admin |

**Implementation Options:**

**Option A: Supabase Edge Function with Deno KV**
```typescript
interface RateLimitConfig {
  key: string;      // IP or user_id
  limit: number;    // Max requests
  window: number;   // Time window in seconds
}

async function checkRateLimit(config: RateLimitConfig): Promise<boolean> {
  const kv = await Deno.openKv();
  const key = ['rate_limit', config.key];
  const entry = await kv.get(key);
  
  if (!entry.value) {
    await kv.set(key, 1, { expireIn: config.window * 1000 });
    return true;
  }
  
  if (entry.value >= config.limit) {
    return false;
  }
  
  await kv.set(key, entry.value + 1, { expireIn: config.window * 1000 });
  return true;
}
```

**Option B: Database-based Rate Limiting**
- Create `rate_limits` table
- Track requests per IP/user
- Clean up expired entries periodically

**Recommendation:** Use Deno KV for better performance and automatic expiration.

### 5. Role-Based Access Control (RBAC)

**Role Hierarchy:**
```
superadmin (full access)
    ↓
admin (manage users, products, transactions)
    ↓
member (own data only)
    ↓
guest (read-only, limited)
```

**Permission Matrix:**

| Resource | Guest | Member | Admin | Superadmin |
|----------|-------|--------|-------|------------|
| View products | ✓ | ✓ | ✓ | ✓ |
| Purchase products | ✗ | ✓ | ✓ | ✓ |
| View own transactions | ✗ | ✓ | ✓ | ✓ |
| View all transactions | ✗ | ✗ | ✓ | ✓ |
| Access account data | ✗ | Own only | ✗ | ✓ |
| Manage users | ✗ | ✗ | ✓ | ✓ |
| View encryption keys | ✗ | ✗ | ✗ | ✓ |

**Implementation:**
```typescript
enum UserRole {
  GUEST = 'guest',
  MEMBER = 'member',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin'
}

function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string
): boolean {
  // Check permission matrix
  // Return true if allowed
}
```


## Data Models

### 1. Enhanced Transactions Table

**No schema changes needed** - existing fields are sufficient:
- `tripay_reference` - Tripay's unique reference
- `tripay_merchant_ref` - Our transaction ID
- `amount` - Amount from our database (source of truth)
- `tripay_amount` - Amount from callback (for verification only)
- `tripay_callback_data` - Full callback payload for audit

**Key Principle:** Always use `amount` from database for balance updates, never from callback.

### 2. Enhanced Audit Logs Table

**Current schema is adequate**, but we'll add new action types:

```sql
-- New action types for security events
ALTER TABLE audit_logs 
  DROP CONSTRAINT IF EXISTS audit_logs_action_check;

ALTER TABLE audit_logs 
  ADD CONSTRAINT audit_logs_action_check 
  CHECK (action IN (
    'CREATE', 'UPDATE', 'DELETE', 'VIEW',
    'APPROVE', 'REJECT', 'REFUND', 'EXPORT',
    'CALLBACK_RECEIVED',      -- New
    'CALLBACK_SIGNATURE_FAIL', -- New
    'CALLBACK_IP_FAIL',        -- New
    'RATE_LIMIT_EXCEEDED',     -- New
    'UNAUTHORIZED_ACCESS',     -- New
    'ENCRYPTION_KEY_ACCESS'    -- New
  ));
```

### 3. Security Events Table (New)

```sql
CREATE TABLE security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source_ip VARCHAR(45),
  user_id UUID REFERENCES auth.users(id),
  endpoint VARCHAR(255),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_created_at ON security_events(created_at DESC);
```

### 4. Rate Limit Tracking (Using Deno KV)

**No database table needed** - use Deno KV for performance:

```typescript
// Key structure: ['rate_limit', endpoint, identifier]
// Value: { count: number, resetAt: number }
```

### 5. Encrypted Account Data Structure

**Current:** `product_accounts.account_data` (JSONB, plaintext)

**Enhanced:**
```typescript
interface EncryptedAccountData {
  encrypted: true;
  version: 1; // For future encryption algorithm changes
  data: {
    ciphertext: string;
    iv: string;
    tag: string;
  };
}

interface DecryptedAccountData {
  email?: string;
  password?: string;
  [key: string]: any; // Dynamic fields based on product
}
```


## Error Handling

### Security Error Responses

**Principle:** Never expose internal details in error messages to prevent information leakage.

**Error Categories:**

1. **Authentication Errors (401)**
   - Generic message: "Unauthorized"
   - Log detailed reason internally
   - Examples: Invalid signature, missing token

2. **Authorization Errors (403)**
   - Generic message: "Forbidden"
   - Log user ID and attempted action
   - Examples: Insufficient role, IP not whitelisted

3. **Rate Limit Errors (429)**
   - Message: "Too many requests. Please try again later."
   - Include Retry-After header
   - Log IP and endpoint

4. **Validation Errors (400)**
   - Message: "Invalid request"
   - Do NOT expose which field failed
   - Log full validation details

5. **Server Errors (500)**
   - Message: "Internal server error"
   - Log full error stack
   - Alert admin for critical errors

**Error Logging Strategy:**

```typescript
interface SecurityError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context: {
    ip?: string;
    userId?: string;
    endpoint?: string;
    details?: any;
  };
}

async function logSecurityError(error: SecurityError): Promise<void> {
  // Log to security_events table
  // If severity is 'critical', send alert to admin
  // If repeated from same IP, consider blocking
}
```

### Callback-Specific Error Handling

**Scenario 1: Invalid Signature**
```typescript
// Response: 403 Forbidden
// Log: Full signature details, IP, payload hash
// Action: Increment failed attempts counter
```

**Scenario 2: IP Not Whitelisted**
```typescript
// Response: 403 Forbidden
// Log: Source IP, attempted payload
// Action: Alert admin if repeated attempts
```

**Scenario 3: Transaction Not Found**
```typescript
// Response: 404 Not Found
// Log: Reference number, merchant_ref
// Action: Check for potential spoofing attempt
```

**Scenario 4: Already Processed (Idempotency)**
```typescript
// Response: 200 OK (success)
// Log: Reference number, original processing time
// Action: No balance update
```


## Testing Strategy

### 1. Unit Tests

**Encryption Service:**
- Test encryption/decryption round-trip
- Test with various data sizes
- Test authentication tag verification
- Test key derivation

**IP Validation:**
- Test valid Tripay IPs
- Test invalid IPs
- Test CIDR range parsing
- Test IPv6 handling

**Signature Verification:**
- Test valid signatures
- Test invalid signatures
- Test timing attack resistance

**Rate Limiting:**
- Test limit enforcement
- Test window expiration
- Test concurrent requests

### 2. Integration Tests

**Callback Flow:**
1. Create test transaction
2. Send valid callback with correct signature
3. Verify transaction updated
4. Verify balance updated correctly
5. Verify audit log created

**Idempotency:**
1. Send same callback twice
2. Verify balance only updated once
3. Verify second call returns 200 OK

**Security Validation:**
1. Send callback with invalid signature → 403
2. Send callback from invalid IP → 403
3. Send callback for non-existent transaction → 404
4. Send callback with mismatched amount → reject

### 3. Security Tests

**Penetration Testing Scenarios:**

1. **Signature Spoofing**
   - Attempt to forge signature
   - Verify rejection

2. **Replay Attack**
   - Resend old valid callback
   - Verify idempotency protection

3. **Amount Manipulation**
   - Send callback with inflated amount
   - Verify database amount is used

4. **SQL Injection**
   - Send malicious payloads in fields
   - Verify sanitization

5. **XSS Attempts**
   - Send script tags in customer_name
   - Verify escaping

6. **Rate Limit Bypass**
   - Send requests from multiple IPs
   - Verify per-user limits still apply

### 4. Load Testing

**Callback Endpoint:**
- 100 concurrent callbacks
- Verify all processed correctly
- Verify no race conditions
- Verify rate limiting works

**Encryption Performance:**
- Encrypt/decrypt 1000 accounts
- Measure latency
- Verify no memory leaks


## Security Considerations

### 1. Cryptographic Security

**Key Management:**
- Master encryption key stored in Supabase secrets (not in code)
- Key rotation strategy: Generate new key, re-encrypt all data
- Never log encryption keys
- Use secure random number generator for IVs

**Signature Verification:**
- Use constant-time comparison to prevent timing attacks
- Verify signature before any processing
- Use raw request body for signature (not parsed JSON)

### 2. Access Control

**Principle of Least Privilege:**
- Users can only access their own data
- Admins cannot access encrypted account data
- Only superadmin can access encryption keys
- Service role used only in Edge Functions

**RLS Policies:**
```sql
-- Users can only view their own transactions
CREATE POLICY "Users view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only superadmin can view all account data
CREATE POLICY "Superadmin view all accounts"
  ON product_accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'superadmin'
    )
  );
```

### 3. Data Protection

**Encryption at Rest:**
- All account credentials encrypted with AES-256-GCM
- Encryption keys never stored in database
- IV and auth tag stored with ciphertext

**Encryption in Transit:**
- All API calls use HTTPS
- TLS 1.3 minimum
- Certificate pinning for mobile apps (future)

**Data Minimization:**
- Only store necessary account fields
- Delete old transactions after retention period
- Anonymize logs after 90 days

### 4. Audit and Monitoring

**Comprehensive Logging:**
- All callback attempts (success and failure)
- All authentication failures
- All rate limit violations
- All encryption key access

**Alerting:**
- Critical: Multiple signature failures from same IP
- High: Unauthorized access attempts
- Medium: Rate limit exceeded
- Low: Normal operations

**Log Retention:**
- Security events: 1 year
- Audit logs: 1 year
- Transaction logs: Indefinite
- Rate limit logs: 30 days


### 5. Attack Prevention

**SQL Injection:**
- Use parameterized queries only
- Never concatenate user input into SQL
- Supabase client handles this automatically

**XSS (Cross-Site Scripting):**
- Sanitize all user input before storage
- Escape output in frontend
- Use Content Security Policy headers

**CSRF (Cross-Site Request Forgery):**
- Verify Origin header
- Use SameSite cookies
- Require authentication token

**Replay Attacks:**
- Idempotency check using reference number
- Timestamp validation (reject old callbacks)
- One-time use tokens for sensitive operations

**Brute Force:**
- Rate limiting on login endpoints
- Account lockout after failed attempts
- CAPTCHA after multiple failures

**DDoS Protection:**
- Cloudflare in front of Supabase
- Rate limiting per IP
- Automatic IP blocking for abuse

## Implementation Phases

### Phase 1: Critical Security (Week 1)
1. Enhance callback signature verification
2. Implement IP whitelist validation
3. Add comprehensive audit logging
4. Implement idempotency protection
5. Create security_events table

### Phase 2: Data Protection (Week 2)
1. Implement encryption service
2. Migrate existing account data to encrypted format
3. Update RLS policies for encrypted data access
4. Add encryption key rotation mechanism

### Phase 3: Access Control (Week 3)
1. Implement rate limiting with Deno KV
2. Enhance RBAC with permission matrix
3. Add role-based RLS policies
4. Implement audit logging for all sensitive operations

### Phase 4: Monitoring & Testing (Week 4)
1. Set up security event monitoring
2. Implement alerting system
3. Write comprehensive tests
4. Perform security audit
5. Load testing and optimization

## Deployment Strategy

### Pre-Deployment Checklist
- [ ] All environment variables configured
- [ ] Encryption keys generated and stored securely
- [ ] IP whitelist configured
- [ ] Rate limits configured
- [ ] RLS policies tested
- [ ] Backup of existing data
- [ ] Rollback plan prepared

### Deployment Steps
1. Deploy security_events table migration
2. Deploy encryption service (no data migration yet)
3. Deploy enhanced callback handler
4. Test with sandbox Tripay account
5. Migrate account data to encrypted format (batch process)
6. Deploy rate limiting
7. Monitor for 24 hours
8. Switch to production

### Rollback Plan
- Keep old callback handler as backup
- Encryption service can decrypt old format
- Rate limiting can be disabled via environment variable
- Database migrations have rollback scripts

## Monitoring and Maintenance

### Daily Monitoring
- Check security_events for critical alerts
- Review failed callback attempts
- Monitor rate limit violations
- Check encryption service health

### Weekly Review
- Analyze security trends
- Review audit logs for anomalies
- Update IP whitelist if needed
- Performance optimization

### Monthly Tasks
- Security audit
- Update dependencies
- Review and rotate encryption keys
- Clean up old logs

### Quarterly Tasks
- Penetration testing
- Security training for team
- Review and update security policies
- Disaster recovery drill

## Backward Compatibility Strategy

### Prinsip: Zero Downtime, Gradual Migration

**Tujuan:** Implementasi security enhancement tanpa merusak fitur yang sudah berjalan.

### 1. Callback Handler - Backward Compatible

**Current Flow (Tetap Berjalan):**
```
Callback → Signature Check → Update Transaction → Update Balance
```

**Enhanced Flow (Tambahan, Tidak Mengganti):**
```
Callback → IP Check (Warning Only) → Signature Check → 
Transaction Match → Update Transaction → Update Balance → Audit Log
```

**Implementation Strategy:**
- IP validation: Mode "warning" dulu (log saja, tidak reject)
- Setelah 1 minggu monitoring, baru aktifkan "enforce" mode
- Signature verification: Sudah ada, hanya ditingkatkan logging
- Transaction matching: Sudah ada, tidak ada perubahan

**Kode Lama Tetap Berjalan:**
```typescript
// OLD CODE - TETAP BERJALAN
if (calculatedSignature !== callbackSignature) {
  return new Response('Invalid signature', { status: 401 });
}

// NEW CODE - TAMBAHAN SAJA
// Log IP untuk monitoring (tidak reject)
const sourceIP = getSourceIP(req);
if (!isValidTripayIP(sourceIP)) {
  await logSecurityEvent({
    type: 'CALLBACK_IP_WARNING',
    severity: 'medium',
    ip: sourceIP,
    message: 'Callback from non-whitelisted IP (warning only)'
  });
  // TIDAK REJECT - tetap lanjut proses
}
```

### 2. Encryption - Gradual Migration

**Strategy: Support Both Formats**

```typescript
// Encryption service dapat handle 2 format:
// 1. Old format (plaintext JSONB) - untuk data lama
// 2. New format (encrypted) - untuk data baru

function getAccountData(accountId: string): DecryptedAccountData {
  const raw = await db.getAccount(accountId);
  
  // Check if already encrypted
  if (raw.account_data.encrypted === true) {
    return decrypt(raw.account_data);
  }
  
  // Old format - return as is
  return raw.account_data;
}

function saveAccountData(accountId: string, data: any): void {
  // Always save in new encrypted format
  const encrypted = encrypt(data);
  await db.updateAccount(accountId, encrypted);
}
```

**Migration Plan:**
1. Deploy encryption service (read both formats)
2. New accounts automatically encrypted
3. Background job: Encrypt old accounts (batch 100/hour)
4. Monitor for 1 week
5. After all migrated, remove old format support

**No Breaking Changes:**
- Existing accounts tetap bisa dibaca
- New accounts langsung encrypted
- Migration gradual, tidak sekaligus


### 3. Rate Limiting - Soft Launch

**Strategy: Monitor First, Enforce Later**

**Phase 1: Monitoring Only (Week 1-2)**
```typescript
const rateLimitExceeded = await checkRateLimit(config);
if (rateLimitExceeded) {
  // LOG ONLY - tidak reject
  await logSecurityEvent({
    type: 'RATE_LIMIT_EXCEEDED',
    severity: 'low',
    message: 'Rate limit would be exceeded (monitoring mode)'
  });
  // TETAP LANJUT - tidak return error
}
```

**Phase 2: Soft Enforcement (Week 3)**
```typescript
// Hanya enforce untuk endpoint non-critical
if (endpoint === '/tripay-create-payment' && rateLimitExceeded) {
  return new Response('Too many requests', { status: 429 });
}
// Callback tetap tidak di-limit untuk avoid payment issues
```

**Phase 3: Full Enforcement (Week 4+)**
```typescript
// Setelah yakin tidak ada false positive
if (rateLimitExceeded) {
  return new Response('Too many requests', { status: 429 });
}
```

**Benefit:**
- Tidak ada user yang tiba-tiba kena block
- Bisa adjust limit berdasarkan real usage
- Monitoring dulu sebelum enforce

### 4. Database Changes - Non-Breaking

**New Tables Only (No Alter Existing):**
```sql
-- NEW TABLE - tidak mengubah yang lama
CREATE TABLE security_events (...);

-- NEW CONSTRAINT - hanya tambah opsi baru
ALTER TABLE audit_logs 
  ADD CONSTRAINT audit_logs_action_check 
  CHECK (action IN (
    -- OLD VALUES (tetap ada)
    'CREATE', 'UPDATE', 'DELETE', 'VIEW',
    -- NEW VALUES (tambahan)
    'CALLBACK_RECEIVED', 'CALLBACK_SIGNATURE_FAIL'
  ));
```

**No Column Drops:**
- Tidak ada `DROP COLUMN`
- Tidak ada `ALTER COLUMN` yang breaking
- Hanya `ADD COLUMN` dengan default values

**RLS Policies - Additive Only:**
```sql
-- Tidak drop policy lama
-- Hanya tambah policy baru yang lebih ketat
CREATE POLICY "Superadmin access encrypted data"
  ON product_accounts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'superadmin'
    )
  );
```

### 5. Testing Strategy - Safe Deployment

**Step 1: Sandbox Testing**
- Test semua perubahan di Tripay sandbox
- Verify callback masih berjalan
- Verify balance update correct

**Step 2: Canary Deployment**
- Deploy ke 10% traffic dulu
- Monitor error rate
- Rollback jika ada issue

**Step 3: Gradual Rollout**
- 10% → 25% → 50% → 100%
- Monitor setiap step
- Pause jika ada anomali

**Step 4: Rollback Plan**
```typescript
// Feature flags untuk easy rollback
const ENABLE_IP_VALIDATION = Deno.env.get('ENABLE_IP_VALIDATION') === 'true';
const ENABLE_RATE_LIMITING = Deno.env.get('ENABLE_RATE_LIMITING') === 'true';
const ENABLE_ENCRYPTION = Deno.env.get('ENABLE_ENCRYPTION') === 'true';

// Bisa disable via environment variable tanpa redeploy
if (ENABLE_IP_VALIDATION && !isValidIP(ip)) {
  return reject();
}
```


### 6. Risk Mitigation

**Potential Issues & Solutions:**

| Risk | Impact | Mitigation | Rollback |
|------|--------|------------|----------|
| IP validation blocks valid callback | HIGH | Start with warning mode, monitor 1 week | Disable via env var |
| Encryption breaks account access | HIGH | Support both formats, gradual migration | Keep old format reader |
| Rate limiting blocks legitimate users | MEDIUM | Monitor first, adjust limits | Disable via env var |
| Signature verification too strict | HIGH | Already working, just add logging | No change to logic |
| Database migration fails | MEDIUM | Test on staging, backup before migrate | Rollback script ready |

**Monitoring During Deployment:**

```typescript
// Real-time monitoring dashboard
interface DeploymentMetrics {
  callbackSuccessRate: number;      // Should stay ~100%
  callbackLatency: number;           // Should not increase
  encryptionErrors: number;          // Should be 0
  rateLimitFalsePositives: number;   // Should be 0
  balanceUpdateAccuracy: number;     // Should be 100%
}

// Alert if any metric degrades
if (metrics.callbackSuccessRate < 99.5) {
  alert('CRITICAL: Callback success rate dropped!');
  // Auto-rollback if below 95%
}
```

### 7. Deployment Checklist - Safety First

**Pre-Deployment:**
- [ ] Backup database (full dump)
- [ ] Test all changes in staging
- [ ] Verify Tripay sandbox callbacks work
- [ ] Prepare rollback scripts
- [ ] Set all feature flags to "monitoring only"
- [ ] Alert team about deployment

**During Deployment:**
- [ ] Deploy database migrations first
- [ ] Deploy Edge Functions with feature flags OFF
- [ ] Verify health checks pass
- [ ] Enable monitoring mode (log only)
- [ ] Monitor for 1 hour
- [ ] Gradually enable features one by one

**Post-Deployment:**
- [ ] Monitor callback success rate (should be 100%)
- [ ] Check security_events for anomalies
- [ ] Verify balance updates still correct
- [ ] Test purchase flow end-to-end
- [ ] Monitor for 24 hours before next phase

**Rollback Triggers:**
- Callback success rate < 95%
- Balance update errors > 0
- User complaints about blocked access
- Any critical security event

### Summary: Zero Risk Implementation

**Guarantee: Fitur yang sudah berjalan TIDAK akan rusak karena:**

1. **Backward Compatible Code**
   - Support old and new formats
   - Additive changes only
   - No breaking changes

2. **Feature Flags**
   - Can disable any feature instantly
   - No redeploy needed for rollback
   - Gradual enablement

3. **Monitoring First**
   - Log before enforce
   - Adjust based on real data
   - No surprise blocks

4. **Gradual Migration**
   - Encrypt new data first
   - Migrate old data slowly
   - Always readable

5. **Comprehensive Testing**
   - Sandbox testing
   - Staging testing
   - Canary deployment
   - Easy rollback

**Result: Security enhancement tanpa downtime atau breaking changes.**
