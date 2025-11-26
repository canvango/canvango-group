# Cloudflare Turnstile - Testing Guide

## 🧪 Testing Strategy

### Test Levels
1. **Unit Tests** - Component & hook behavior
2. **Integration Tests** - Form submission flow
3. **E2E Tests** - Complete user journey
4. **Manual Tests** - Real-world scenarios

## 🔬 Manual Testing

### Test Case 1: Login Form with Turnstile

**Prerequisites:**
- Turnstile keys configured
- Dev server running
- Browser: Chrome/Firefox/Safari

**Steps:**
1. Navigate to `/login`
2. Observe Turnstile widget appears
3. Wait for auto-verification (2-3 seconds)
4. Widget shows "✓ Verified"
5. Enter username: `testuser`
6. Enter password: `testpass123`
7. Click "Masuk" button
8. Verify login successful

**Expected Results:**
- ✅ Widget appears below password field
- ✅ Widget auto-verifies without user action
- ✅ Button disabled until verification complete
- ✅ Button enabled after verification
- ✅ Login proceeds normally
- ✅ No console errors

**Test Data:**
```
Username: testuser
Password: testpass123
```

---

### Test Case 2: Register Form with Turnstile

**Steps:**
1. Navigate to `/register`
2. Observe Turnstile widget
3. Fill form:
   - Username: `newuser`
   - Full Name: `New User`
   - Email: `newuser@test.com`
   - Phone: `081234567890`
   - Password: `password123`
4. Wait for Turnstile verification
5. Click "Daftar" button
6. Verify registration successful

**Expected Results:**
- ✅ Widget appears before submit button
- ✅ All form validations work
- ✅ Turnstile verification completes
- ✅ Registration proceeds
- ✅ Redirect to dashboard

---

### Test Case 3: Forgot Password with Turnstile

**Steps:**
1. Navigate to `/forgot-password`
2. Observe Turnstile widget
3. Enter email: `test@example.com`
4. Wait for verification
5. Click "Kirim Link Reset"
6. Verify success message

**Expected Results:**
- ✅ Widget appears
- ✅ Email validation works
- ✅ Turnstile verifies
- ✅ Email sent successfully
- ✅ Success screen shows

---

### Test Case 4: Turnstile Disabled (No Keys)

**Prerequisites:**
- Remove `VITE_TURNSTILE_SITE_KEY` from `.env`
- Restart dev server

**Steps:**
1. Navigate to `/login`
2. Observe NO Turnstile widget
3. Enter credentials
4. Click "Masuk"
5. Verify login works normally

**Expected Results:**
- ✅ No widget appears
- ✅ Form works without Turnstile
- ✅ Login successful
- ✅ No errors in console

---

### Test Case 5: Network Error Handling

**Steps:**
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Navigate to `/login`
4. Try to submit form
5. Observe error handling

**Expected Results:**
- ✅ Error message shows
- ✅ Widget resets
- ✅ User can retry
- ✅ No app crash

---

### Test Case 6: Token Expiration

**Steps:**
1. Navigate to `/login`
2. Wait for Turnstile verification
3. Wait 5+ minutes (token expires)
4. Try to submit form
5. Observe widget behavior

**Expected Results:**
- ✅ Widget detects expiration
- ✅ Widget auto-resets
- ✅ New verification starts
- ✅ User can continue

---

### Test Case 7: Multiple Form Submissions

**Steps:**
1. Navigate to `/login`
2. Enter wrong credentials
3. Submit form
4. Observe error
5. Correct credentials
6. Submit again
7. Verify login works

**Expected Results:**
- ✅ First submission fails (wrong creds)
- ✅ Widget resets after error
- ✅ Second verification works
- ✅ Second submission succeeds

---

### Test Case 8: Mobile Responsive

**Devices to Test:**
- iPhone 12/13/14
- Samsung Galaxy S21/S22
- iPad
- Android Tablet

**Steps:**
1. Open on mobile device
2. Navigate to `/login`
3. Observe widget rendering
4. Complete login flow

**Expected Results:**
- ✅ Widget fits screen width
- ✅ Touch interactions work
- ✅ No horizontal scroll
- ✅ Buttons accessible

---

### Test Case 9: Browser Compatibility

**Browsers:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

**Steps:**
1. Test login flow in each browser
2. Verify widget appearance
3. Check console for errors

**Expected Results:**
- ✅ Works in all browsers
- ✅ Consistent appearance
- ✅ No browser-specific errors

---

### Test Case 10: Accessibility

**Tools:**
- Screen reader (NVDA/JAWS)
- Keyboard only navigation

**Steps:**
1. Navigate to `/login` with keyboard
2. Tab through form fields
3. Verify widget is focusable
4. Test with screen reader

**Expected Results:**
- ✅ Widget is keyboard accessible
- ✅ Screen reader announces widget
- ✅ Tab order is logical
- ✅ ARIA labels present

---

## 🤖 Automated Testing

### Unit Test: TurnstileWidget Component

```typescript
// src/shared/components/__tests__/TurnstileWidget.test.tsx
import { render, screen } from '@testing-library/react';
import { TurnstileWidget } from '../TurnstileWidget';

describe('TurnstileWidget', () => {
  it('renders when site key is configured', () => {
    process.env.VITE_TURNSTILE_SITE_KEY = 'test-key';
    const onSuccess = jest.fn();
    
    render(<TurnstileWidget onSuccess={onSuccess} />);
    
    // Widget should render
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
  
  it('does not render when site key is missing', () => {
    delete process.env.VITE_TURNSTILE_SITE_KEY;
    const onSuccess = jest.fn();
    
    const { container } = render(<TurnstileWidget onSuccess={onSuccess} />);
    
    // Widget should not render
    expect(container.firstChild).toBeNull();
  });
});
```

### Unit Test: useTurnstile Hook

```typescript
// src/shared/hooks/__tests__/useTurnstile.test.ts
import { renderHook, act } from '@testing-library/react';
import { useTurnstile } from '../useTurnstile';

describe('useTurnstile', () => {
  it('sets token correctly', () => {
    const { result } = renderHook(() => useTurnstile());
    
    act(() => {
      result.current.setToken('test-token');
    });
    
    expect(result.current.token).toBe('test-token');
  });
  
  it('verifies token with backend', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ success: true })
      })
    );
    
    const { result } = renderHook(() => useTurnstile());
    
    act(() => {
      result.current.setToken('test-token');
    });
    
    let isVerified;
    await act(async () => {
      isVerified = await result.current.verifyToken();
    });
    
    expect(isVerified).toBe(true);
    expect(result.current.isVerified).toBe(true);
  });
});
```

### Integration Test: Login Flow

```typescript
// src/features/member-area/components/auth/__tests__/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '../LoginForm';

describe('LoginForm with Turnstile', () => {
  it('disables submit button until Turnstile verifies', async () => {
    process.env.VITE_TURNSTILE_SITE_KEY = 'test-key';
    
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /masuk/i });
    
    // Button should be disabled initially
    expect(submitButton).toBeDisabled();
    
    // Simulate Turnstile success
    const widget = screen.getByRole('status');
    fireEvent.success(widget, { token: 'test-token' });
    
    // Button should be enabled after verification
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
```

---

## 📊 Test Results Template

### Test Execution Report

**Date:** _______________  
**Tester:** _______________  
**Environment:** Development / Staging / Production

| Test Case | Status | Notes |
|-----------|--------|-------|
| TC1: Login Form | ⬜ Pass / ⬜ Fail | |
| TC2: Register Form | ⬜ Pass / ⬜ Fail | |
| TC3: Forgot Password | ⬜ Pass / ⬜ Fail | |
| TC4: Turnstile Disabled | ⬜ Pass / ⬜ Fail | |
| TC5: Network Error | ⬜ Pass / ⬜ Fail | |
| TC6: Token Expiration | ⬜ Pass / ⬜ Fail | |
| TC7: Multiple Submissions | ⬜ Pass / ⬜ Fail | |
| TC8: Mobile Responsive | ⬜ Pass / ⬜ Fail | |
| TC9: Browser Compatibility | ⬜ Pass / ⬜ Fail | |
| TC10: Accessibility | ⬜ Pass / ⬜ Fail | |

**Overall Status:** ⬜ Pass / ⬜ Fail

**Issues Found:**
1. _______________
2. _______________
3. _______________

**Recommendations:**
1. _______________
2. _______________
3. _______________

---

## 🔍 Performance Testing

### Metrics to Monitor

1. **Widget Load Time**
   - Target: < 1 second
   - Measure: Time from page load to widget ready

2. **Verification Time**
   - Target: < 2 seconds
   - Measure: Time from widget ready to verified

3. **API Response Time**
   - Target: < 500ms
   - Measure: `/api/verify-turnstile` response time

4. **Form Submission Time**
   - Target: < 3 seconds total
   - Measure: Click submit to redirect

### Performance Test Script

```javascript
// Run in browser console
console.time('Widget Load');
// Wait for widget to appear
console.timeEnd('Widget Load');

console.time('Verification');
// Wait for verification
console.timeEnd('Verification');

console.time('Form Submit');
// Submit form
console.timeEnd('Form Submit');
```

---

## 🐛 Bug Report Template

**Title:** _______________

**Severity:** Critical / High / Medium / Low

**Environment:**
- Browser: _______________
- OS: _______________
- Device: _______________

**Steps to Reproduce:**
1. _______________
2. _______________
3. _______________

**Expected Result:**
_______________

**Actual Result:**
_______________

**Screenshots:**
[Attach screenshots]

**Console Errors:**
```
[Paste console errors]
```

**Additional Notes:**
_______________

---

## ✅ Testing Checklist

### Before Release
- [ ] All manual tests passed
- [ ] Automated tests passing
- [ ] Performance metrics acceptable
- [ ] No critical bugs
- [ ] Documentation updated
- [ ] Team trained

### After Release
- [ ] Monitor production logs
- [ ] Check analytics
- [ ] Gather user feedback
- [ ] Fix any issues
- [ ] Update documentation

---

**Testing is complete when all test cases pass and no critical issues remain.**

**Happy Testing! 🧪**
