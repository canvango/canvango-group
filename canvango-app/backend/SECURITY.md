# Security Features Documentation

This document outlines the security features implemented in the Canvango Group backend application.

## Overview

The application implements multiple layers of security to protect against common web vulnerabilities and attacks.

## Implemented Security Features

### 1. Rate Limiting

**Purpose**: Prevent brute force attacks and API abuse

**Implementation**:
- Login endpoint: Limited to 5 attempts per 15 minutes per IP address
- General API: Limited to 100 requests per 15 minutes per IP address

**Files**:
- `src/middleware/rateLimit.middleware.ts`

**Usage**:
```typescript
import { loginRateLimiter } from './middleware/rateLimit.middleware.js';
router.post('/login', loginRateLimiter, login);
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit."
  }
}
```

### 2. CORS Configuration

**Purpose**: Control which domains can access the API

**Implementation**:
- Whitelist-based origin validation
- Configurable via environment variables
- Supports credentials (cookies)
- Proper preflight handling

**Files**:
- `src/config/cors.config.ts`

**Configuration**:
```env
# Development (default)
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Production
CORS_ALLOWED_ORIGINS=https://canvango.com,https://www.canvango.com
```

**Features**:
- Automatic environment-based configuration
- Allows requests with no origin (mobile apps, Postman)
- Logs blocked CORS requests
- Supports multiple HTTP methods
- Exposes necessary headers

### 3. Input Sanitization

**Purpose**: Prevent XSS and injection attacks

**Implementation**:

#### XSS Prevention
- Removes `<script>` tags and content
- Strips event handlers (onclick, onerror, etc.)
- Removes `javascript:` protocol
- Filters dangerous HTML tags (iframe, object, embed, etc.)
- Sanitizes body, query, and params

#### NoSQL Injection Prevention
- Removes `$` and `.` from object keys
- Uses express-mongo-sanitize middleware

#### SQL Injection Prevention
- Validates input for SQL keywords and patterns
- Blocks common SQL injection attempts
- Returns 400 error for suspicious input

**Files**:
- `src/middleware/sanitize.middleware.ts`

**Blocked Patterns**:
- SQL keywords: SELECT, INSERT, UPDATE, DELETE, DROP, etc.
- SQL operators: --, ;, /*, */
- SQL functions: xp_, sp_

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Input mengandung karakter yang tidak diizinkan."
  }
}
```

### 4. HTTPS Enforcement

**Purpose**: Ensure all communications are encrypted

**Implementation**:
- Automatic HTTP to HTTPS redirect in production
- Strict-Transport-Security (HSTS) header
- Checks x-forwarded-proto for proxy/load balancer support

**Files**:
- `src/middleware/https.middleware.ts`

**Features**:
- Only active in production environment
- 301 permanent redirect for HTTP requests
- HSTS with 1-year max-age
- Includes subdomains in HSTS
- Preload-ready

**HSTS Header**:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 5. Helmet Security Headers

**Purpose**: Set various HTTP headers for security

**Implementation**:
- Uses helmet middleware
- Sets Content-Security-Policy
- Prevents clickjacking (X-Frame-Options)
- Disables X-Powered-By header
- Sets X-Content-Type-Options
- Sets X-XSS-Protection

**Headers Set**:
- `X-DNS-Prefetch-Control: off`
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security: max-age=15552000; includeSubDomains`
- `X-Download-Options: noopen`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 0`

### 6. Request Size Limiting

**Purpose**: Prevent DoS attacks via large payloads

**Implementation**:
```typescript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

## Security Middleware Order

The middleware is applied in the following order (important for proper security):

1. HTTPS Enforcement
2. Helmet (Security Headers)
3. CORS
4. Body Parsers (with size limits)
5. Cookie Parser
6. NoSQL Injection Prevention
7. XSS Prevention
8. SQL Injection Prevention
9. Rate Limiting (on specific routes)
10. Authentication
11. Authorization

## Environment Variables

```env
# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Node Environment
NODE_ENV=production  # Enables HTTPS enforcement and production CORS
```

## Best Practices

### For Developers

1. **Always use parameterized queries** for database operations
2. **Never trust user input** - always validate and sanitize
3. **Use HTTPS in production** - never disable HTTPS enforcement
4. **Keep dependencies updated** - regularly run `npm audit`
5. **Use environment variables** for sensitive configuration
6. **Log security events** - monitor for suspicious activity

### For Deployment

1. **Set NODE_ENV=production** in production environment
2. **Configure CORS_ALLOWED_ORIGINS** with actual domain(s)
3. **Use HTTPS certificates** from trusted CA
4. **Enable HSTS preloading** after testing
5. **Monitor rate limit violations** for potential attacks
6. **Set up Web Application Firewall (WAF)** if available

## Testing Security Features

### Test Rate Limiting
**Note**: Authentication is now handled by Supabase Auth. Rate limiting for auth is managed at the Supabase level.

```bash
# Test general API rate limiting (100 requests per 15 minutes)
for i in {1..101}; do
  curl -X GET http://localhost:5000/api/tutorials \
    -H "Content-Type: application/json"
done
```

### Test CORS
```bash
# Request from unauthorized origin
curl -X GET http://localhost:5000/api/users/me \
  -H "Origin: https://evil.com" \
  -H "Authorization: Bearer <supabase-jwt-token>"
```

### Test XSS Prevention
```bash
# Try to inject script in user profile update
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <supabase-jwt-token>" \
  -d '{"full_name":"<script>alert(1)</script>"}'
```

### Test SQL Injection Prevention
```bash
# Try SQL injection in search query
curl -X GET "http://localhost:5000/api/tutorials?search=test' OR 1=1--" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <supabase-jwt-token>"
```

## Security Checklist

- [x] Rate limiting on authentication endpoints
- [x] CORS whitelist configuration
- [x] XSS prevention via input sanitization
- [x] NoSQL injection prevention
- [x] SQL injection prevention
- [x] HTTPS enforcement in production
- [x] Security headers via Helmet
- [x] Request size limiting
- [x] HTTP-only cookies for tokens
- [x] Password hashing with bcrypt
- [x] JWT token expiration
- [ ] Two-factor authentication (future enhancement)
- [ ] API key authentication (future enhancement)
- [ ] IP whitelisting for admin routes (future enhancement)

## Reporting Security Issues

If you discover a security vulnerability, please email security@canvango.com instead of using the issue tracker.

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
