---
id: STORY-QASSIST-002
jira_id: null
epic_id: EPIC-QASSIST-001
title: As a registered user, I want to log in with my credentials, so that I can access my workspace
priority: High
story_points: 2
assignee: null
status: To Do
---

# STORY-QASSIST-002: Login with credentials

## Description

Implement a secure login flow that allows registered users to authenticate using their email and password. The login process should be fast (<5 seconds), secure (rate limiting, session management), and provide seamless access to the user's dashboard with all their projects and test cases.

## Acceptance Criteria (Gherkin format)

### Scenario 1: Successful login with valid credentials
- **Given:** I am a registered user on the login page
- **When:** I enter my correct email ("user@example.com") and password ("MyPass123")
- **Then:** I am authenticated successfully
- **And:** A session token is generated and stored in cookies/localStorage
- **And:** I am redirected to my dashboard (/projects)
- **And:** I see a welcome message "Welcome back, [Name]!"
- **And:** My last_login timestamp is updated in the database

### Scenario 2: Login fails with incorrect password
- **Given:** I am on the login page
- **When:** I enter a valid email but incorrect password
- **Then:** I see an error message "Invalid email or password"
- **And:** I remain on the login page
- **And:** Failed login attempt is logged (for rate limiting)
- **And:** No session token is generated

### Scenario 3: Login fails with non-existent email
- **Given:** I am on the login page
- **When:** I enter an email that doesn't exist in the system ("nonexistent@example.com")
- **Then:** I see an error message "Invalid email or password" (same as wrong password to prevent user enumeration)
- **And:** I remain on the login page
- **And:** Failed attempt is logged

### Scenario 4: "Remember me" checkbox creates longer session
- **Given:** I am on the login page
- **When:** I check the "Remember me" checkbox and log in successfully
- **Then:** My session token has 30-day expiration (instead of 7 days)
- **And:** I stay logged in even after closing the browser

### Scenario 5: Rate limiting after failed attempts
- **Given:** I am on the login page
- **When:** I enter wrong credentials 5 times within 15 minutes
- **Then:** I see an error message "Too many failed attempts. Please try again in 15 minutes or reset your password."
- **And:** The login form is temporarily disabled
- **And:** I see a link to "Forgot password?" prominently

### Scenario 6: Redirect to intended page after login
- **Given:** I attempt to access a protected page (/projects) while logged out
- **When:** I am redirected to login page and successfully authenticate
- **Then:** I am redirected back to the originally requested page (/projects)
- **And:** Not to the default dashboard

## Technical Notes

### API Endpoint
```typescript
POST /api/auth/login
Request Body:
{
  email: string; // max 254 chars
  password: string; // max 128 chars
  remember_me: boolean; // optional, default false
}

Response (200 OK):
{
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    subscription_tier: "free" | "pro";
  };
  session_token: string;
  expires_at: string; // ISO timestamp
}

Errors:
401 Unauthorized: { error_code: "INVALID_CREDENTIALS" }
403 Forbidden: { error_code: "ACCOUNT_SUSPENDED" }
429 Too Many Requests: { error_code: "RATE_LIMIT_EXCEEDED", retry_after: 900 } // seconds
500 Internal Server Error: { error_code: "SERVER_ERROR" }
```

### Authentication Flow
1. Validate email format (client-side + server-side)
2. Query database for user by email (case-insensitive)
3. Verify password against bcrypt hash
4. Check account status (active, suspended, deleted)
5. Generate JWT session token:
   - Payload: `{ user_id, email, subscription_tier, exp }`
   - Expiration: 7 days (default) or 30 days (remember_me)
6. Update `last_login` timestamp in database
7. Log login event (IP address, user agent, timestamp)
8. Return user object + session token

### Session Management
- **Storage:** HTTP-only cookie (more secure) OR localStorage (easier for MVP)
- **Token format:** JWT signed with secret key
- **Expiration:** 7 days (default), 30 days (remember_me)
- **Refresh:** Auto-refresh if token expires within 24 hours
- **Revocation:** On password change, logout, account suspension

### Rate Limiting
- Max 5 failed login attempts per IP per 15 minutes
- Counter resets after successful login OR 15 minutes
- Blocked IPs can bypass by resetting password
- Logging: Store failed attempts in `auth_logs` table

### Security Considerations
- **Password comparison:** Use bcrypt.compare() (timing-safe)
- **Generic error messages:** Don't reveal if email exists
- **Session token:** Store in HTTP-only cookie (prevent XSS)
- **HTTPS only:** Enforce secure flag on cookies (production)
- **CSRF protection:** Validate CSRF token on state-changing requests

## UI/UX Requirements

### Form Fields
1. **Email** (required):
   - Placeholder: "name@example.com"
   - Autofocus on page load
   - Autocomplete: "email"

2. **Password** (required):
   - Type: password
   - Show/hide toggle (eye icon)
   - Autocomplete: "current-password"

3. **Remember me** (optional):
   - Checkbox: "Keep me signed in for 30 days"
   - Unchecked by default

4. **Forgot password link**:
   - Text: "Forgot your password?"
   - Links to /reset-password
   - Positioned to the right of password label

### Submit Button
- Text: "Sign In"
- Loading state: "Signing in..." with spinner
- Disabled during API call
- Enter key triggers submit

### Additional Links
- "Don't have an account? [Sign up](#)"
- "Having trouble? [Contact support](#)"

### Success State
- Show success toast: "Welcome back!"
- Redirect to dashboard after 500ms

### Error States
- Show error toast for generic errors
- Inline error message below password field for invalid credentials
- After 3 failed attempts: Show CAPTCHA (optional for MVP)
- After 5 failed attempts: Show rate limit message + link to password reset

## Definition of Done

- [ ] Login API endpoint implemented and tested
- [ ] Password verification with bcrypt working
- [ ] Session token generation functional
- [ ] Remember me checkbox extends session expiration
- [ ] Rate limiting implemented (5 attempts per 15 min)
- [ ] Redirect to intended page after login
- [ ] Last login timestamp updated on successful login
- [ ] Failed login attempts logged
- [ ] Unit tests written (authentication logic)
- [ ] Integration tests passing (login flow)
- [ ] E2E test passing (Playwright: login → dashboard)
- [ ] Accessibility: Keyboard navigation, screen reader labels
- [ ] Mobile responsive
- [ ] Code review approved
- [ ] Deployed to staging and verified
