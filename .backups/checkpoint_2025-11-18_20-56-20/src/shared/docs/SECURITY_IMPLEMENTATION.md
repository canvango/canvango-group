# Security Implementation Guide

This document provides a comprehensive guide to the security measures implemented in the Member Area Content Framework.

## Overview

The application implements multiple layers of security protection:

1. **CSRF Protection** - Prevents Cross-Site Request Forgery attacks
2. **XSS Prevention** - Protects against Cross-Site Scripting attacks
3. **Rate Limiting** - Monitors and displays API rate limit status

## 1. CSRF Protection

### What is CSRF?

Cross-Site Request Forgery (CSRF) is an attack that forces authenticated users to submit unwanted requests to a web application. Our implementation protects against this by using CSRF tokens.

### Implementation

#### Token Generation

```typescript
import { getCSRFToken, refreshCSRFToken } from '@/shared/utils/csrf';

// Get current token (generates if not exists)
const token = getCSRFToken();

// Generate new token
const newToken = refreshCSRFToken();
```

#### Automatic Token Inclusion

The API client automatically includes CSRF tokens in all state-changing requests (POST, PUT, PATCH, DELETE):

```typescript
// In src/features/member-area/services/api.ts
// CSRF token is automatically added to request headers
apiClient.post('/api/endpoint', data);
// Header: X-CSRF-Token: <token>
```

#### Token Management

Tokens are:
- Generated on login
- Stored in sessionStorage
- Cleared on logout
- Automatically included in API requests

### Usage

No manual intervention required - CSRF protection is automatic. However, you can manually manage tokens if needed:

```typescript
import { 
  getCSRFToken, 
  setCSRFToken, 
  clearCSRFToken,
  getCSRFHeaders 
} from '@/shared/utils';

// Get token
const token = getCSRFToken();

// Set custom token
setCSRFToken('custom-token');

// Clear token
clearCSRFToken();

// Get headers for manual requests
const headers = getCSRFHeaders();
// { 'X-CSRF-Token': 'token-value' }
```

## 2. XSS Prevention

### What is XSS?

Cross-Site Scripting (XSS) allows attackers to inject malicious scripts into web pages. Our implementation provides multiple layers of protection.

### React's Built-in Protection

React automatically escapes content in JSX, providing baseline XSS protection:

```tsx
// Safe - React escapes the content
<div>{userInput}</div>
```

### Additional Protection Utilities

#### Sanitization Functions

```typescript
import {
  sanitizeInput,
  sanitizeUrl,
  sanitizeEmail,
  sanitizePhone,
  sanitizeNumber,
  escapeHtml,
  stripHtmlTags
} from '@/shared/utils';

// Sanitize general text input
const safe = sanitizeInput(userInput);

// Sanitize URL (blocks javascript:, data:, etc.)
const safeUrl = sanitizeUrl(url);

// Sanitize email
const safeEmail = sanitizeEmail(email);

// Sanitize phone number
const safePhone = sanitizePhone(phone);

// Sanitize numeric input
const safeNumber = sanitizeNumber(value);

// Escape HTML entities
const escaped = escapeHtml(text);

// Strip all HTML tags
const plain = stripHtmlTags(html);
```

#### SafeContent Component

Use the `SafeContent` component to safely display user-generated content:

```tsx
import { SafeContent } from '@/shared/components';

// Display sanitized text
<SafeContent content={userInput} type="text" />

// Display sanitized URL as link
<SafeContent content={url} type="url" />

// Display sanitized email as mailto link
<SafeContent content={email} type="email" />

// Display sanitized phone as tel link
<SafeContent content={phone} type="phone" />

// Strip HTML tags
<SafeContent content={richText} type="text" stripHtml />
```

#### useSafeContent Hook

For programmatic sanitization in components:

```tsx
import { useSafeContent } from '@/shared/hooks/useSafeContent';

function MyComponent({ userInput }) {
  const safeText = useSafeContent(userInput, { 
    type: 'text',
    stripHtml: true 
  });
  
  return <div>{safeText}</div>;
}
```

#### Sanitize Multiple Fields

```tsx
import { useSafeObject } from '@/shared/hooks/useSafeContent';

function UserProfile({ userData }) {
  const safeData = useSafeObject(userData, {
    email: 'email',
    phone: 'phone',
    website: 'url',
    bio: 'text'
  });
  
  return (
    <div>
      <p>Email: {safeData.email}</p>
      <p>Phone: {safeData.phone}</p>
      <a href={safeData.website}>Website</a>
      <p>{safeData.bio}</p>
    </div>
  );
}
```

### Dangerous Content Detection

```typescript
import { containsDangerousContent, assertSafeContent } from '@/shared/utils';

// Check if content is dangerous
if (containsDangerousContent(userInput)) {
  console.warn('Dangerous content detected');
}

// Assert content is safe (throws error if not)
try {
  assertSafeContent(userInput, 'User bio');
} catch (error) {
  console.error(error.message);
}
```

### Using dangerouslySetInnerHTML Safely

**⚠️ Warning:** Only use `dangerouslySetInnerHTML` when absolutely necessary and with trusted content.

```tsx
import { useSafeHtml } from '@/shared/hooks/useSafeContent';

function RichTextDisplay({ html }) {
  const safeHtml = useSafeHtml(html);
  
  if (!safeHtml) return null;
  
  return <div dangerouslySetInnerHTML={safeHtml} />;
}
```

Or use the SafeContent component:

```tsx
<SafeContent 
  content={richText} 
  type="html" 
  dangerouslyRenderHtml 
/>
```

### Best Practices

1. **Always sanitize user input** before displaying
2. **Never use dangerouslySetInnerHTML** unless absolutely necessary
3. **Use SafeContent component** for user-generated content
4. **Validate URLs** before using in href or src attributes
5. **Escape HTML entities** when displaying raw text
6. **Strip HTML tags** when only plain text is needed

## 3. Rate Limiting

### What is Rate Limiting?

Rate limiting prevents abuse by restricting the number of API requests a user can make within a time period.

### Implementation

#### Automatic Tracking

The API client automatically tracks rate limit information from response headers:

```typescript
// Rate limit headers are automatically parsed and cached
// X-RateLimit-Limit: 1000
// X-RateLimit-Remaining: 750
// X-RateLimit-Reset: 1640000000
```

#### useRateLimit Hook

Track rate limits for specific endpoints:

```tsx
import { useRateLimit } from '@/shared/hooks/useRateLimit';

function ProductList() {
  const { 
    rateLimitInfo, 
    isExceeded, 
    isApproaching,
    updateFromHeaders 
  } = useRateLimit({
    endpoint: '/api/products',
    onExceeded: () => {
      toast.error('Rate limit exceeded. Please try again later.');
    },
    onApproaching: () => {
      toast.warning('Approaching rate limit. Please slow down.');
    }
  });
  
  // Use in API calls
  const fetchProducts = async () => {
    const response = await apiClient.get('/api/products');
    updateFromHeaders(response.headers);
    return response.data;
  };
  
  return (
    <div>
      {isApproaching && (
        <div className="alert alert-warning">
          Approaching rate limit
        </div>
      )}
      {/* ... */}
    </div>
  );
}
```

#### RateLimitIndicator Component

Display rate limit status to users:

```tsx
import { RateLimitIndicator } from '@/shared/components';

function APIPage() {
  const { rateLimitInfo } = useRateLimit({ endpoint: '/api' });
  
  return (
    <div>
      <RateLimitIndicator 
        rateLimitInfo={rateLimitInfo}
        position="top"
        detailed
      />
      {/* ... */}
    </div>
  );
}
```

#### RateLimitBadge Component

Show compact rate limit status:

```tsx
import { RateLimitBadge } from '@/shared/components';

function Header() {
  const { rateLimitInfo } = useGlobalRateLimit();
  
  return (
    <header>
      <RateLimitBadge rateLimitInfo={rateLimitInfo} />
    </header>
  );
}
```

#### Handle Rate Limit Errors

```tsx
import { useRateLimit } from '@/shared/hooks/useRateLimit';

function MyComponent() {
  const { handleRateLimitError } = useRateLimit({
    onExceeded: () => {
      toast.error('Too many requests. Please wait.');
    }
  });
  
  const fetchData = async () => {
    try {
      const response = await apiClient.get('/api/data');
      return response.data;
    } catch (error) {
      handleRateLimitError(error);
      throw error;
    }
  };
}
```

### Rate Limit Utilities

```typescript
import {
  parseRateLimitHeaders,
  calculateRateLimitStatus,
  isRateLimitError,
  getRetryAfter
} from '@/shared/utils';

// Parse headers
const info = parseRateLimitHeaders(headers);

// Calculate status
const status = calculateRateLimitStatus(info);
console.log(status.usagePercentage); // 75
console.log(status.isApproaching); // true
console.log(status.level); // 'warning'

// Check if error is rate limit
if (isRateLimitError(error)) {
  const retryAfter = getRetryAfter(error.response.headers);
  console.log(`Retry after ${retryAfter}ms`);
}
```

### API Stats Display

The API Documentation page automatically shows rate limit warnings:

```tsx
import { APIStatsCards } from '@/features/member-area/components/api';

function APIDocumentation() {
  const stats = {
    hitLimit: 1000,
    currentHits: 850, // 85% - shows warning
    uptime: 99.9,
    averageLatency: 120
  };
  
  return <APIStatsCards stats={stats} />;
  // Shows warning banner when usage >= 75%
}
```

## Security Checklist

### For Developers

- [ ] Always sanitize user input before display
- [ ] Use SafeContent component for user-generated content
- [ ] Never use dangerouslySetInnerHTML without sanitization
- [ ] Validate and sanitize URLs before using in links
- [ ] Use CSRF tokens for all state-changing operations
- [ ] Monitor rate limits and handle errors gracefully
- [ ] Test with malicious input patterns
- [ ] Review code for XSS vulnerabilities
- [ ] Implement proper error handling
- [ ] Log security events in production

### For Testing

- [ ] Test with script injection attempts
- [ ] Test with malicious URLs (javascript:, data:)
- [ ] Test CSRF protection on forms
- [ ] Test rate limiting behavior
- [ ] Test with special characters and HTML entities
- [ ] Test with very long inputs
- [ ] Test with null/undefined values
- [ ] Test error handling for security failures

## Common Patterns

### Form Input Sanitization

```tsx
import { sanitizeInput } from '@/shared/utils';

function ContactForm() {
  const handleSubmit = (data) => {
    const sanitized = {
      name: sanitizeInput(data.name),
      email: sanitizeEmail(data.email),
      phone: sanitizePhone(data.phone),
      message: sanitizeInput(data.message)
    };
    
    // Submit sanitized data
    await apiClient.post('/api/contact', sanitized);
  };
}
```

### Display User Content

```tsx
import { SafeContent } from '@/shared/components';

function UserComment({ comment }) {
  return (
    <div className="comment">
      <SafeContent 
        content={comment.text} 
        type="text"
        stripHtml
      />
    </div>
  );
}
```

### API Call with Rate Limit Tracking

```tsx
import { useRateLimit } from '@/shared/hooks/useRateLimit';

function DataFetcher() {
  const { updateFromHeaders, handleRateLimitError } = useRateLimit({
    endpoint: '/api/data',
    onApproaching: () => console.warn('Slow down!')
  });
  
  const fetchData = async () => {
    try {
      const response = await apiClient.get('/api/data');
      updateFromHeaders(response.headers);
      return response.data;
    } catch (error) {
      handleRateLimitError(error);
      throw error;
    }
  };
}
```

## Additional Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [React Security Best Practices](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)

## Support

For security concerns or questions, please contact the development team or refer to the main documentation.
