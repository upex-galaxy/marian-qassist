---
id: EPIC-QASSIST-001
jira_id: null
title: User Authentication & Onboarding
priority: P0 (Critical)
business_value: High
estimated_story_points: 13
status: To Do
---

# EPIC-QASSIST-001: User Authentication & Onboarding

## Description

Implement a complete user authentication system with email/password registration, secure login, password reset functionality, and an intuitive onboarding tutorial. This epic establishes the foundation for all user-specific features in QAssist, ensuring secure access control and a smooth first-time user experience.

## Business Value

**Critical foundation for MVP:** Without authentication, no other features can function properly. This epic directly impacts:
- **User Acquisition:** Smooth signup flow reduces friction (target: <2 min to first login)
- **Security:** Proper auth prevents unauthorized access to user data
- **Retention:** Guided onboarding increases activation rate (target: 60% completion)
- **Data Ownership:** Each user has isolated workspace with their test cases

**Success Metrics:**
- Signup completion rate: ≥70%
- Onboarding tutorial completion: ≥60%
- Time to first login: <2 minutes
- Password reset success rate: ≥95%

## Scope

### In Scope
✅ **User Registration:**
- Email + password signup
- Email verification (optional for MVP, required for production)
- Terms of service consent
- Password strength validation

✅ **User Login:**
- Email/password authentication
- Session management (JWT tokens, 7-day expiry)
- "Remember me" functionality
- Rate limiting (prevent brute force)

✅ **Password Management:**
- Forgot password flow
- Email with reset link (1-hour expiration)
- Password reset confirmation
- Automatic session revocation on password change

✅ **User Profile:**
- View/edit name, email, avatar
- Upload profile picture (max 2MB)
- Email change requires re-verification

✅ **Onboarding Tutorial:**
- 5-step guided walkthrough:
  1. Connect Jira (required)
  2. Import first User Story (required)
  3. Create first Test Case (required)
  4. Attach evidence (optional)
  5. Export PDF (optional)
- Progress tracking
- Skip/resume functionality
- Completion celebration (confetti animation)

### Out of Scope (Post-MVP)
❌ Social login (Google, GitHub, Microsoft)
❌ Two-factor authentication (2FA)
❌ Magic link login (passwordless)
❌ Account deletion (GDPR right to erasure)
❌ Multi-tenancy (team workspaces)
❌ SSO/SAML for enterprise

## Acceptance Criteria (Epic-level)

- [ ] User can sign up with email/password in <2 minutes
- [ ] User receives email verification (or auto-verified for MVP)
- [ ] User can log in with credentials and access dashboard
- [ ] User can reset password via email within 5 minutes
- [ ] User can update profile (name, email, avatar)
- [ ] User sees onboarding tutorial on first login
- [ ] ≥60% of users complete required onboarding steps
- [ ] All auth endpoints have rate limiting (max 5 attempts per 15 min)
- [ ] Passwords hashed with bcrypt (salt rounds: 10)
- [ ] Session tokens expire after 7 days of inactivity
- [ ] Zero P0 security vulnerabilities (SQL injection, XSS, CSRF)

## Dependencies

### Technical Pre-requisites
- **Supabase project configured** (database + auth)
- **Email service configured** (SMTP or Supabase email)
- **Frontend UI components** (Input, Button, Form)
- **React Hook Form + Zod** for form validation

### External Dependencies
- **Supabase Auth API** (email/password provider)
- **Email delivery service** (Supabase Email or SendGrid)

### Blocking Dependencies
- None (this is the first epic to implement)

### Dependent Epics
All other epics depend on this one completing:
- EPIC-002: Jira Integration (needs OAuth, requires user accounts)
- EPIC-003: Test Case Studio (needs user_id for data ownership)
- EPIC-004: Evidence Management (needs authenticated uploads)
- EPIC-007: Subscription (needs user accounts for payments)

## User Stories

- [STORY-QASSIST-001](./stories/STORY-QASSIST-001-signup/story.md): Sign up with email and password (2 pts)
- [STORY-QASSIST-002](./stories/STORY-QASSIST-002-login/story.md): Login with credentials (2 pts)
- [STORY-QASSIST-003](./stories/STORY-QASSIST-003-password-reset/story.md): Password reset flow via email (3 pts)
- [STORY-QASSIST-004](./stories/STORY-QASSIST-004-onboarding-tutorial/story.md): Guided onboarding tutorial (3 pts)
- [STORY-QASSIST-005](./stories/STORY-QASSIST-005-profile-management/story.md): Manage profile settings (3 pts)

**Total Story Points:** 13

## Technical Notes

### Authentication Strategy
- Use **Supabase Auth** for user management (faster than building custom)
- Store user metadata in `users` table (extends Supabase auth.users)
- Session tokens: JWT with 7-day expiration
- Refresh tokens: 30-day expiration (Supabase handles automatically)

### Database Schema
```sql
-- Extends Supabase auth.users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  storage_used_bytes BIGINT DEFAULT 0,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.user_onboarding (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  step_connect_jira BOOLEAN DEFAULT false,
  step_import_story BOOLEAN DEFAULT false,
  step_create_test_case BOOLEAN DEFAULT false,
  step_attach_evidence BOOLEAN DEFAULT false,
  step_export_pdf BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Security Considerations
- **Password Requirements:** Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- **Rate Limiting:** Max 5 failed login attempts per IP per 15 minutes
- **Email Verification:** Optional for MVP, required for production
- **CSRF Protection:** Enabled by default in Supabase
- **SQL Injection:** Use parameterized queries (Supabase client handles this)
- **XSS Protection:** Sanitize all user inputs in profile fields

### UI/UX Guidelines
- **Signup form:** Name, Email, Password, Confirm Password, Terms checkbox
- **Login form:** Email, Password, "Forgot password?" link, "Remember me" checkbox
- **Password reset:** Email input → Confirmation message → Email with link → New password form
- **Onboarding:** Modal overlay with step-by-step progress bar
- **Profile:** Avatar upload with drag-and-drop, crop functionality

## Testing Strategy

### Unit Tests
- Password validation logic
- Email format validation
- Session token generation/expiration

### Integration Tests
- Full signup flow (form → API → database → email)
- Login flow (credentials → session token → redirect)
- Password reset flow (request → email → reset → login)
- Onboarding progress tracking

### E2E Tests (Playwright)
- User can sign up and see dashboard
- User can log out and log back in
- User can reset password and log in with new password
- User completes onboarding tutorial

### Security Tests
- Password strength enforcement
- Rate limiting on login endpoint
- CSRF token validation
- SQL injection attempts blocked

## Timeline

**Sprint:** 1-2 (Weeks 1-4)
**Estimated Effort:** 13 story points (~2 weeks for 1 developer)

**Breakdown:**
- Week 1: Stories 1-2 (signup + login) - 4 pts
- Week 2: Stories 3-5 (password reset + onboarding + profile) - 9 pts

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Email deliverability issues | High | Medium | Use Supabase Email (reliable), test with real emails |
| Onboarding completion <60% | Medium | Medium | User testing before launch, simplify steps |
| Rate limiting too aggressive | Low | Low | Make configurable, monitor false positives |
| Password reset link expires too fast | Low | Low | 1-hour expiration (industry standard) |

## Definition of Done

- [ ] All 5 user stories completed and tested
- [ ] Code review approved by Tech Lead
- [ ] Unit tests coverage ≥80%
- [ ] Integration tests passing
- [ ] E2E tests passing (signup, login, password reset, onboarding)
- [ ] Security audit completed (no P0 vulnerabilities)
- [ ] Documentation updated (API docs, user guide)
- [ ] Deployed to staging and verified
- [ ] Product Owner acceptance
