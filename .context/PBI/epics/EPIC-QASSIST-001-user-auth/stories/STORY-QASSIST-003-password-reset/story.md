---
id: STORY-QASSIST-003
jira_id: null
epic_id: EPIC-QASSIST-001
title: As a user who forgot my password, I want to reset it via email, so that I can regain access to my account
priority: High
story_points: 3
assignee: null
status: To Do
---

# STORY-QASSIST-003: Password reset flow via email

## Description

Implement a secure password reset flow that allows users to recover their accounts when they forget their password. The flow should send a time-limited reset link via email, allow users to set a new password, and automatically revoke all existing sessions for security.

## Acceptance Criteria (Gherkin format)

### Scenario 1: Request password reset with valid email
- **Given:** I am on the "Forgot Password" page
- **When:** I enter my registered email address ("user@example.com")
- **Then:** I see a success message "If this email is registered, you'll receive a password reset link shortly"
- **And:** A password reset email is sent to my inbox within 2 minutes
- **And:** The email contains a reset link valid for 1 hour
- **And:** Previous reset tokens for my account are invalidated

### Scenario 2: Request password reset with non-existent email
- **Given:** I am on the "Forgot Password" page
- **When:** I enter an email that doesn't exist in the system
- **Then:** I see the same success message (to prevent user enumeration)
- **And:** No email is sent
- **And:** The attempt is logged for security monitoring

### Scenario 3: Click reset link and set new password
- **Given:** I received a password reset email
- **When:** I click the reset link within 1 hour
- **Then:** I am redirected to the "Reset Password" page
- **And:** The page displays "Reset password for [email]"
- **And:** I see fields for "New Password" and "Confirm Password"
- **When:** I enter a strong password and confirm it
- **Then:** My password is updated in the database
- **And:** All my existing sessions are revoked (forced re-login everywhere)
- **And:** I see a success message "Password reset successfully. Please log in with your new password."
- **And:** I am redirected to the login page

### Scenario 4: Reset link expires after 1 hour
- **Given:** I received a password reset email
- **When:** I click the reset link after 1 hour has passed
- **Then:** I see an error message "This reset link has expired. Please request a new one."
- **And:** I see a button "Request new link" that redirects to forgot password page
- **And:** The expired token cannot be used to reset password

### Scenario 5: Reset link is single-use
- **Given:** I used a reset link to change my password successfully
- **When:** I try to use the same reset link again
- **Then:** I see an error message "This reset link has already been used."
- **And:** I am redirected to the login page

### Scenario 6: Rate limiting on reset requests
- **Given:** I am on the "Forgot Password" page
- **When:** I request password reset 4 times within 1 hour for the same email
- **Then:** I see an error message "Too many reset requests. Please wait 1 hour before trying again."
- **And:** No additional emails are sent

## Technical Notes

### API Endpoints

#### 1. Request Password Reset
```typescript
POST /api/auth/forgot-password
Request Body:
{
  email: string; // max 254 chars
}

Response (200 OK):
{
  message: "If this email is registered, you'll receive a password reset link shortly"
}

Errors:
429 Too Many Requests: { error_code: "RATE_LIMIT_EXCEEDED", retry_after: 3600 }
500 Internal Server Error: { error_code: "SERVER_ERROR" }
```

#### 2. Validate Reset Token
```typescript
GET /api/auth/reset-password?token={reset_token}
Response (200 OK):
{
  valid: true,
  email: string; // email associated with token
}

Errors:
400 Bad Request: { error_code: "INVALID_TOKEN" | "EXPIRED_TOKEN" | "TOKEN_USED" }
```

#### 3. Reset Password
```typescript
POST /api/auth/reset-password
Request Body:
{
  token: string; // UUID v4
  new_password: string; // min 8 chars, max 128 chars
}

Response (200 OK):
{
  message: "Password updated successfully"
}

Errors:
400 Bad Request: { error_code: "INVALID_TOKEN" | "EXPIRED_TOKEN" | "WEAK_PASSWORD" }
500 Internal Server Error: { error_code: "SERVER_ERROR" }
```

### Password Reset Flow
1. **User requests reset:**
   - Lookup user by email (case-insensitive)
   - Generate reset token (UUID v4)
   - Store token in `password_reset_tokens` table with 1-hour expiration
   - Invalidate any previous tokens for this user
   - Send email with reset link

2. **Email template:**
   - Subject: "Reset your QAssist password"
   - Body:
     ```
     Hi [Name],

     You requested to reset your password. Click the link below to create a new password:

     [Reset Password Button] → https://qassist.io/reset-password?token={token}

     This link expires in 1 hour.

     If you didn't request this, please ignore this email.

     — QAssist Team
     ```

3. **User clicks link:**
   - Validate token exists and not expired
   - Show reset password form
   - On submit: Hash new password with bcrypt
   - Update `users` table with new password hash
   - Invalidate reset token
   - Revoke all user sessions (delete from `sessions` table)
   - Redirect to login page

### Database Schema
```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_reset_tokens_expires ON password_reset_tokens(expires_at);
```

### Rate Limiting
- Max 3 reset requests per email per hour
- Implemented using counter in database or Redis
- Prevents email bombing attacks

### Security Considerations
- **Generic success messages:** Don't reveal if email exists
- **Token format:** UUID v4 (128-bit randomness)
- **Token expiration:** 1 hour (industry standard)
- **Single-use tokens:** Mark as used after password reset
- **Session revocation:** Force re-login on all devices
- **Email validation:** Verify email format before querying database
- **Timing attacks:** Use constant-time comparison for tokens

## UI/UX Requirements

### Page 1: Forgot Password
- **URL:** `/forgot-password`
- **Fields:**
  - Email input (required)
- **Submit button:** "Send Reset Link"
- **Success message:** "Check your email for reset instructions"
- **Link:** "Back to login"

### Page 2: Reset Password
- **URL:** `/reset-password?token={token}`
- **Fields:**
  - New Password (required, with strength indicator)
  - Confirm Password (required)
- **Submit button:** "Reset Password"
- **Success message:** "Password reset successfully!"
- **Auto-redirect:** To login page after 2 seconds

### Email Design
- Clean, branded template
- Prominent "Reset Password" button
- Clear expiration notice (1 hour)
- Security reminder: "If you didn't request this, ignore this email"
- Footer: Contact support link

### Error States
- Expired token: Show message + "Request new link" button
- Used token: Show message + redirect to login
- Invalid token: Show message + redirect to forgot password
- Server error: Show generic error + retry button

## Definition of Done

- [ ] Forgot password API endpoint implemented
- [ ] Reset password API endpoint implemented
- [ ] Password reset email template created
- [ ] Email sending functional (Supabase Email or SMTP)
- [ ] Reset tokens generated and stored securely
- [ ] 1-hour expiration enforced
- [ ] Single-use tokens (marked as used after reset)
- [ ] All sessions revoked on password change
- [ ] Rate limiting implemented (3 requests per hour)
- [ ] Unit tests written (token generation, expiration logic)
- [ ] Integration tests passing (full reset flow)
- [ ] E2E test passing (Playwright: request → email → reset → login)
- [ ] Email deliverability tested (check spam folders)
- [ ] Accessibility: Form keyboard-navigable
- [ ] Mobile responsive
- [ ] Code review approved
- [ ] Deployed to staging and verified
