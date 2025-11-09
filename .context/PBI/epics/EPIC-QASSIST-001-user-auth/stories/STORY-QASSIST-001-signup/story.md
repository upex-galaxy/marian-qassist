---
id: STORY-QASSIST-001
jira_id: null
epic_id: EPIC-QASSIST-001
title: As a new user, I want to sign up with email and password, so that I can create my QAssist account
priority: High
story_points: 2
assignee: null
status: To Do
---

# STORY-QASSIST-001: Sign up with email and password

## Description

Implement a user registration flow that allows new users to create an account using their email address and a secure password. The signup process should be quick (<2 minutes), secure (password validation, rate limiting), and provide immediate access to the application after successful registration.

## Acceptance Criteria (Gherkin format)

### Scenario 1: Successful signup with valid credentials
- **Given:** I am a new user visiting the signup page
- **When:** I enter a valid email ("user@example.com"), a strong password ("MyPass123"), and accept terms of service
- **Then:** My account is created in the database
- **And:** I receive a success message "Account created successfully!"
- **And:** I am redirected to the onboarding tutorial page
- **And:** A session token is generated and stored

### Scenario 2: Signup fails with existing email
- **Given:** I am on the signup page
- **When:** I enter an email that already exists in the system ("existing@example.com")
- **Then:** I see an error message "Email already registered. Please log in."
- **And:** No new account is created
- **And:** I see a link to the login page

### Scenario 3: Signup fails with weak password
- **Given:** I am on the signup page
- **When:** I enter a password that doesn't meet requirements ("weak")
- **Then:** I see an error message "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number"
- **And:** The signup button remains disabled
- **And:** Password strength indicator shows "Weak" in red

### Scenario 4: Signup fails without accepting terms
- **Given:** I am on the signup page
- **When:** I fill in valid credentials but don't check the "I agree to Terms of Service" checkbox
- **Then:** The signup button is disabled
- **And:** I see a tooltip "Please accept the Terms of Service to continue"

### Scenario 5: Rate limiting prevents abuse
- **Given:** I am on the signup page
- **When:** I attempt to sign up 6 times within 1 hour from the same IP address
- **Then:** I see an error message "Too many signup attempts. Please try again in 1 hour."
- **And:** The signup form is temporarily disabled

## Technical Notes

### API Endpoint
```typescript
POST /api/auth/signup
Request Body:
{
  email: string; // RFC 5321 format, max 254 chars
  password: string; // min 8 chars, max 128 chars
  name: string; // optional, max 100 chars
  consent_terms: boolean; // must be true
}

Response (201 Created):
{
  user: {
    id: string;
    email: string;
    name: string | null;
    created_at: string;
  };
  session_token: string;
}

Errors:
400 Bad Request: { error_code: "INVALID_EMAIL" | "WEAK_PASSWORD" | "EMAIL_EXISTS" | "TERMS_NOT_ACCEPTED" }
429 Too Many Requests: { error_code: "RATE_LIMIT_EXCEEDED" }
500 Internal Server Error: { error_code: "SERVER_ERROR" }
```

### Password Validation Rules
- Minimum 8 characters
- Maximum 128 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- Optional: Special characters allowed but not required

### Database Operations
1. Check if email exists (case-insensitive)
2. Hash password with bcrypt (salt rounds: 10)
3. Insert user record in `auth.users` table (Supabase)
4. Create extended user profile in `public.users` table
5. Generate JWT session token (7-day expiration)

### Rate Limiting
- Max 5 signup attempts per IP address per hour
- Implemented using Supabase Edge Functions or Vercel middleware
- Reset counter after 1 hour

### Security Considerations
- Password hashed with bcrypt before storage (never store plaintext)
- Email verification optional for MVP (can send verification email but not enforce)
- CSRF protection enabled (Supabase handles this)
- SQL injection prevented by parameterized queries
- XSS prevention: sanitize name input

## UI/UX Requirements

### Form Fields
1. **Name** (optional):
   - Placeholder: "John Doe"
   - Max length: 100 characters
   - Validation: Letters, spaces, hyphens only

2. **Email** (required):
   - Placeholder: "name@example.com"
   - Validation: RFC 5321 format
   - Auto-trim whitespace

3. **Password** (required):
   - Type: password (hidden by default)
   - Show/hide password toggle (eye icon)
   - Real-time strength indicator (Weak/Medium/Strong)
   - Requirements checklist below field:
     - ✓ At least 8 characters
     - ✓ One uppercase letter
     - ✓ One lowercase letter
     - ✓ One number

4. **Confirm Password** (required):
   - Type: password
   - Validation: Must match password field
   - Error shown only on blur

5. **Terms of Service** (required):
   - Checkbox: "I agree to the [Terms of Service](#) and [Privacy Policy](#)"
   - Links open in new tab
   - Must be checked to enable signup button

### Submit Button
- Text: "Create Account"
- Disabled states:
  - Form is empty
  - Validation errors present
  - Terms not accepted
  - Loading (API call in progress)
- Loading state: Show spinner + "Creating account..."

### Success State
- Show success toast: "Account created successfully! 🎉"
- Auto-redirect to onboarding page after 1 second

### Error States
- Show error toast for server errors
- Inline validation errors below each field
- Email exists: Show link to login page

## Definition of Done

- [ ] Signup API endpoint implemented and tested
- [ ] Form validation working (client-side + server-side)
- [ ] Password strength indicator functional
- [ ] Rate limiting implemented and tested
- [ ] bcrypt password hashing working
- [ ] User record created in database on successful signup
- [ ] Session token generated and stored
- [ ] Redirect to onboarding page after signup
- [ ] Unit tests written (password validation, email format)
- [ ] Integration tests passing (full signup flow)
- [ ] E2E test passing (Playwright: signup → dashboard)
- [ ] Accessibility: Form keyboard-navigable, screen reader compatible
- [ ] Mobile responsive (tested on 320px width)
- [ ] Code review approved
- [ ] Deployed to staging and verified
