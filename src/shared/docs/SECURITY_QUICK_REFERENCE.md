# Security Quick Reference

Quick reference for security utilities and components.

## CSRF Protection

```typescript
import { getCSRFToken, refreshCSRFToken, clearCSRFToken } from '@/shared/utils';

// Get token (auto-generated if not exists)
const token = getCSRFToken();

// Generate new token
const newToken = refreshCSRFToken();

// Clear token
clearCSRFToken();
```

**Note:** CSRF tokens are automatically included in POST/PUT/PATCH/DELETE requests.

## XSS Prevention

### Sanitization Functions

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

const safe = sanitizeInput(userInput);
const safeUrl = sanitizeUrl(url);
const safeEmail = sanitizeEmail(email);
const safePhone = sanitizePhone(phone);
const safeNumber = sanitizeNumber(value);
const escaped = escapeHtml(text);
const plain = stripHtmlTags(html);
```

### SafeContent Component

```tsx
import { SafeContent } from '@/shared/components';

// Text
<SafeContent content={text} type="text" />

// URL
<SafeContent content={url} type="url" />

// Email
<SafeContent content={email} type="email" />

// Phone
<SafeContent content={phone} type="phone" />

// HTML (use with caution)
<SafeContent content={html} type="html" dangerouslyRenderHtml />
```

### useSafeContent Hook

```tsx
import { useSafeContent } from '@/shared/hooks/useSafeContent';

const safeText = useSafeContent(userInput, { 
  type: 'text',
  stripHtml: true 
});
```

## Rate Limiting

### useRateLimit Hook

```tsx
import { useRateLimit } from '@/shared/hooks/useRateLimit';

const { 
  rateLimitInfo, 
  isExceeded, 
  isApproaching,
  updateFromHeaders,
  handleRateLimitError
} = useRateLimit({
  endpoint: '/api/products',
  onExceeded: () => toast.error('Rate limit exceeded'),
  onApproaching: () => toast.warning('Approaching limit')
});
```

### RateLimitIndicator Component

```tsx
import { RateLimitIndicator } from '@/shared/components';

<RateLimitIndicator 
  rateLimitInfo={rateLimitInfo}
  position="top"
  detailed
/>
```

### RateLimitBadge Component

```tsx
import { RateLimitBadge } from '@/shared/components';

<RateLimitBadge rateLimitInfo={rateLimitInfo} />
```

## Common Patterns

### Form Sanitization

```tsx
const handleSubmit = (data) => {
  const sanitized = {
    name: sanitizeInput(data.name),
    email: sanitizeEmail(data.email),
    phone: sanitizePhone(data.phone),
    message: sanitizeInput(data.message)
  };
  await apiClient.post('/api/contact', sanitized);
};
```

### Display User Content

```tsx
<SafeContent 
  content={userComment} 
  type="text"
  stripHtml
/>
```

### API Call with Rate Limit

```tsx
const { updateFromHeaders, handleRateLimitError } = useRateLimit();

try {
  const response = await apiClient.get('/api/data');
  updateFromHeaders(response.headers);
} catch (error) {
  handleRateLimitError(error);
}
```

## Security Checklist

- ✅ Sanitize all user input
- ✅ Use SafeContent for user-generated content
- ✅ Validate URLs before using in links
- ✅ Never use dangerouslySetInnerHTML without sanitization
- ✅ Monitor rate limits
- ✅ Handle security errors gracefully
- ✅ Test with malicious input

## Need More Info?

See [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md) for detailed documentation.
