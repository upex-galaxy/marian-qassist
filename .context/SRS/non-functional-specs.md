# QAssist - Non-Functional Requirements (NFRs)

## Tech Stack

- **Frontend:** Next.js 15 (App Router, React Server Components)
- **Backend:** Next.js API Routes + Supabase Edge Functions
- **Database:** PostgreSQL via Supabase (with Row Level Security)
- **Authentication:** Supabase Auth (JWT-based)
- **Storage:** Supabase Storage (S3-compatible)
- **Hosting:** Vercel (Edge Network, Serverless Functions)
- **CI/CD:** GitHub Actions
- **Monitoring:** Vercel Analytics + Sentry (error tracking)

---

## 1. Performance Requirements

### 1.1 Page Load Time
- **Metric:** Largest Contentful Paint (LCP)
- **Target:** < 2.0 seconds (95th percentile)
- **Measurement:** Vercel Analytics, Lighthouse CI
- **Critical Pages:**
  - Landing page: < 1.5s
  - Dashboard (authenticated): < 2.5s
  - Test Case editor: < 2.0s
- **Optimization Strategies:**
  - Next.js Image optimization (automatic WebP conversion)
  - Code splitting per route
  - Lazy loading for heavy components (Test Case editor, PDF viewer)
  - Prefetch critical API data with React Server Components

### 1.2 API Response Time
- **Metric:** Server response time (Time to First Byte - TTFB)
- **Target:**
  - GET requests: < 300ms (p95)
  - POST/PUT requests: < 500ms (p95)
  - Complex operations (Jira sync, PDF export): < 3 seconds (p95)
- **Database Queries:**
  - Simple SELECT queries: < 50ms
  - Complex joins (User Stories + Test Cases): < 150ms
  - Full-text search: < 200ms
- **Rate Limits:**
  - Authenticated users: 100 requests/minute
  - Public endpoints: 20 requests/minute per IP
  - Jira sync: 10 syncs/hour per user (prevent API abuse)

### 1.3 Time to Interactive (TTI)
- **Target:** < 3.5 seconds (95th percentile)
- **Measurement:** Lighthouse, Web Vitals
- **Strategies:**
  - Minimize JavaScript bundle size (target: < 200KB initial load)
  - Defer non-critical scripts
  - Use React Suspense for streaming UI

### 1.4 Concurrent Users
- **MVP Phase (Months 1-6):**
  - Simultaneous users: 100 concurrent
  - Database connections: 20 pooled connections (Supabase default)
  - Vercel serverless concurrency: 100 executions
- **Growth Phase (Months 7-12):**
  - Simultaneous users: 500 concurrent
  - Database connections: 50 pooled (upgrade Supabase plan)
  - Vercel concurrency: 1000 executions
- **Load Testing:**
  - Simulate 100 concurrent users with k6 or Artillery
  - Test critical flows: Login, Jira sync, Test Case creation
  - Target: 0% error rate under expected load

### 1.5 Offline Performance
- **Local Operations:** Instant (<50ms)
  - Test Case creation/editing
  - Evidence attachment (local file save)
  - Search/filter within cached data
- **Sync Queue Processing:** Background, non-blocking
  - Process 10 operations/second when online
  - Max queue size: 1000 operations (prevent memory overflow)

### 1.6 Storage Performance
- **File Upload Speed:**
  - Screenshots (< 5MB): < 3 seconds
  - Videos (< 50MB): < 30 seconds
  - Parallel uploads: Max 3 simultaneous
- **File Download Speed:**
  - Thumbnail generation: < 500ms per image
  - Full PDF export: < 10 seconds for 50 Test Cases
  - ZIP export: < 2 minutes for 500MB project

---

## 2. Security Requirements

### 2.1 Authentication
- **Method:** Supabase Auth (JWT-based)
- **Token Lifetime:**
  - Access token: 1 hour (short-lived)
  - Refresh token: 7 days (stored in httpOnly cookie)
- **Token Storage:**
  - Client: httpOnly, Secure, SameSite=Strict cookies
  - Server: Never log tokens, never expose in URLs
- **Session Management:**
  - Automatic token refresh before expiration
  - Revoke all sessions on password change
  - Max 5 active sessions per user (device limit)
- **Multi-Factor Authentication (MFA):** Future (Phase 2)
  - Optional TOTP-based MFA for Pro users

### 2.2 Authorization
- **Model:** Role-Based Access Control (RBAC) + Row Level Security (RLS)
- **Roles:**
  - `user` (default): Access own projects, Test Cases, evidence
  - `admin`: Access metrics dashboard, user management (internal only)
- **PostgreSQL RLS Policies:**
  - `projects`: Users can only SELECT/UPDATE/DELETE their own projects
  - `test_cases`: Users can only access Test Cases in their projects
  - `attachments`: Users can only access evidence linked to their Test Cases
- **API Authorization:**
  - All API routes verify JWT token via middleware
  - Check user ownership before mutations (CREATE/UPDATE/DELETE)
  - Admin routes protected by role check

### 2.3 Data Encryption
- **At Rest:**
  - Database: Supabase automatic encryption (AES-256)
  - Storage: Supabase Storage encryption (server-side)
  - Sensitive fields (Jira OAuth tokens): Additional application-level encryption using AES-256-GCM
- **In Transit:**
  - HTTPS enforced on all endpoints (TLS 1.3)
  - HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - Certificate: Automatic via Vercel (Let's Encrypt)
- **Secrets Management:**
  - Environment variables via Vercel (encrypted at rest)
  - Never commit secrets to Git (enforced by pre-commit hook)
  - Rotate API keys quarterly

### 2.4 Input Validation
- **Server-Side (Primary):**
  - Zod schema validation on all API routes
  - SQL injection prevention: Parameterized queries only (Supabase client)
  - XSS prevention: HTML sanitization via DOMPurify before storage
  - File upload validation: MIME type + file signature check
- **Client-Side (UX):**
  - React Hook Form validation for forms
  - Real-time feedback on invalid inputs
  - File type/size validation before upload

### 2.5 Password Policy
- **Requirements:**
  - Minimum length: 8 characters
  - Complexity: At least 1 uppercase, 1 lowercase, 1 number
  - Optional: 1 special character (recommended but not enforced in MVP)
  - No common passwords: Check against top 10,000 common passwords list
- **Storage:**
  - Hashed with bcrypt (Supabase default, cost factor 10)
  - Never store plaintext passwords
  - Never send passwords in API responses
- **Reset Flow:**
  - Reset token expires in 1 hour
  - One-time use tokens (invalidated after reset)
  - Rate limit: Max 3 reset requests per email per hour

### 2.6 Session Management
- **Token Expiration:**
  - Access token: 1 hour
  - Refresh token: 7 days
  - Remember me: Extend refresh token to 30 days (opt-in)
- **Refresh Strategy:**
  - Automatic refresh 5 minutes before expiration
  - Silent refresh (no user interruption)
  - Fallback: Redirect to login if refresh fails
- **Logout:**
  - Revoke refresh token in database
  - Clear all client-side cookies
  - Invalidate session immediately

### 2.7 OWASP Top 10 Mitigations

| Vulnerability | Mitigation |
|---------------|------------|
| **A01: Broken Access Control** | RLS policies, ownership checks in API routes |
| **A02: Cryptographic Failures** | TLS 1.3, AES-256 encryption, bcrypt for passwords |
| **A03: Injection** | Parameterized queries, input validation with Zod |
| **A04: Insecure Design** | Threat modeling, security reviews in design phase |
| **A05: Security Misconfiguration** | Secure headers (CSP, HSTS), environment variable validation |
| **A06: Vulnerable Components** | Dependabot alerts, automated dependency updates |
| **A07: Identification/Auth Failures** | Supabase Auth, JWT tokens, MFA (future) |
| **A08: Software/Data Integrity** | Signed releases, checksums for file uploads |
| **A09: Logging/Monitoring Failures** | Sentry error tracking, Vercel logs, audit logs |
| **A10: SSRF** | Validate URLs, whitelist Jira domains only |

### 2.8 Security Headers
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.atlassian.net
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## 3. Scalability Requirements

### 3.1 Database Scalability
- **PostgreSQL Configuration:**
  - Supabase managed PostgreSQL (automatic backups, replication)
  - Connection pooling: Supabase Pooler (PgBouncer) - transaction mode
  - Max connections: 20 (Free), 50 (Pro Supabase plan)
- **Indexing Strategy:**
  - Primary keys: UUID v4 (indexed by default)
  - Foreign keys: Indexed for JOIN performance
  - Full-text search: GIN index on `test_cases.content` and `user_stories.description`
  - Composite index: `(project_id, created_at)` for sorting
- **Query Optimization:**
  - Use `SELECT` with specific columns (avoid `SELECT *`)
  - Pagination: Cursor-based (keyset pagination) for large datasets
  - Avoid N+1 queries: Use eager loading with JOIN or `IN` clause
- **Data Retention:**
  - Soft delete for User Stories/Test Cases (retain 90 days before hard delete)
  - Audit logs retained for 1 year (compliance)
  - Automatic archival of projects inactive >180 days

### 3.2 CDN & Edge Caching
- **Vercel Edge Network:**
  - Global CDN with 100+ edge locations
  - Automatic static asset caching (images, CSS, JS)
  - Edge Functions for auth checks (reduce latency)
- **Cache Strategy:**
  - **Static assets:** `Cache-Control: public, max-age=31536000, immutable`
  - **API responses (public):** `Cache-Control: public, max-age=300` (5 min)
  - **API responses (authenticated):** `Cache-Control: private, max-age=60` (1 min)
  - **ISR (Incremental Static Regeneration):**
    - Landing page: Revalidate every 1 hour
    - Blog/docs: Revalidate on-demand (webhook from CMS)
- **Cache Invalidation:**
  - Purge cache on data mutations (e.g., Test Case updated → invalidate project cache)
  - Versioned static assets (hash in filename prevents stale cache)

### 3.3 Horizontal Scaling
- **Stateless Architecture:**
  - Next.js API routes are stateless (no in-memory session storage)
  - Session state in JWT token or database
  - File uploads stream directly to Supabase Storage (no local disk dependency)
- **Serverless Functions:**
  - Vercel Serverless Functions auto-scale based on demand
  - Max execution time: 10 seconds (Hobby), 60 seconds (Pro)
  - Cold start optimization: < 300ms (use Edge Functions for hot paths)
- **Database Connection Pooling:**
  - Supabase Pooler prevents connection exhaustion
  - Connection pool size adjusts based on Supabase plan
  - Monitor connection usage via Supabase dashboard

### 3.4 Rate Limiting & Throttling
- **API Rate Limits:**
  - Authenticated users: 100 req/min (per user)
  - Public endpoints: 20 req/min (per IP)
  - Jira sync: 10 syncs/hour (prevent API quota exhaustion)
  - PDF export: 5 exports/hour (CPU-intensive operation)
- **Implementation:**
  - Upstash Redis for distributed rate limiting (Vercel Edge compatible)
  - Return `429 Too Many Requests` with `Retry-After` header
  - Show user-friendly message: "Rate limit reached. Try again in 5 minutes."
- **DDoS Protection:**
  - Vercel WAF (Web Application Firewall) enabled
  - Cloudflare in front of Vercel (future, if needed)

### 3.5 Background Jobs
- **Use Cases:**
  - Jira auto-sync (every 15 min for Pro users)
  - PDF export generation (offload to background)
  - Email sending (welcome, password reset, notifications)
- **Implementation:**
  - Vercel Cron Jobs (for scheduled tasks)
  - Supabase Edge Functions with pg_cron (alternative)
  - Queue system: Inngest or Trigger.dev (future, if needed)
- **Job Monitoring:**
  - Log job execution (start time, end time, result)
  - Alert on failures (Sentry integration)
  - Retry logic: 3 attempts with exponential backoff

---

## 4. Accessibility Requirements

### 4.1 WCAG 2.1 Level AA Compliance
- **Target:** Full compliance with WCAG 2.1 Level AA
- **Testing:** Automated (axe-core, Lighthouse) + Manual (screen reader testing)
- **Priority Areas:**
  - Form inputs (proper labels, error messages)
  - Navigation (keyboard-only navigation)
  - Color contrast (4.5:1 minimum for text)
  - Focus indicators (visible on all interactive elements)

### 4.2 Keyboard Navigation
- **Requirements:**
  - All functionality accessible via keyboard only (no mouse required)
  - Logical tab order (follows visual layout)
  - Skip links: "Skip to main content" on every page
  - Keyboard shortcuts:
    - `Cmd/Ctrl + K`: Quick project switcher
    - `Cmd/Ctrl + N`: New Test Case
    - `Cmd/Ctrl + S`: Save (explicit feedback)
    - `Esc`: Close modals/dropdowns
- **Focus Management:**
  - Focus trapped in modals (prevent tabbing out)
  - Focus returns to trigger element when modal closed
  - Focus indicators: 2px solid outline (high contrast)

### 4.3 Screen Reader Support
- **ARIA Labels:**
  - All icon-only buttons: `aria-label` (e.g., "Close modal")
  - Form inputs: `aria-describedby` for error messages
  - Loading states: `aria-live="polite"` for status updates
  - Tables: `<th>` with `scope` attribute for data tables
- **Semantic HTML:**
  - Use `<button>` for actions, `<a>` for navigation
  - Use `<nav>`, `<main>`, `<aside>` for landmarks
  - Use `<fieldset>` and `<legend>` for form groups
- **Screen Reader Testing:**
  - Test with NVDA (Windows), VoiceOver (macOS), TalkBack (Android)
  - All critical flows tested (signup, login, create Test Case)

### 4.4 Color Contrast
- **Text Contrast:**
  - Normal text (< 18pt): 4.5:1 minimum
  - Large text (≥ 18pt): 3:1 minimum
  - UI components (buttons, inputs): 3:1 minimum
- **Color Palette:**
  - Primary: `#2563eb` (blue) - contrast with white: 6.3:1 ✓
  - Success: `#16a34a` (green) - contrast with white: 4.7:1 ✓
  - Error: `#dc2626` (red) - contrast with white: 5.5:1 ✓
  - Text: `#1f2937` (dark gray) - contrast with white: 15.3:1 ✓
- **No Color-Only Information:**
  - Error states use icons + text (not just red border)
  - Charts include patterns + colors (not color-blind only)

### 4.5 Focus Indicators
- **Visible Focus:**
  - All interactive elements show focus ring
  - Focus ring: 2px solid `#2563eb` with 2px offset
  - Never remove `:focus` styles globally (`outline: none` forbidden)
- **Custom Focus Styles:**
  - Match design system (e.g., rounded corners on buttons)
  - High contrast mode support (Windows high contrast themes)

### 4.6 Responsive Text
- **Font Sizes:**
  - Base: 16px (1rem)
  - Minimum: 14px (0.875rem) for secondary text
  - Maximum zoom: 200% without breaking layout
- **Line Height:**
  - Body text: 1.5 (24px for 16px font)
  - Headings: 1.2
- **Text Spacing:**
  - User can increase spacing via browser settings without breaking UI
  - No fixed heights on text containers

---

## 5. Browser Support Requirements

### 5.1 Desktop Browsers
| Browser | Minimum Version | Support Level |
|---------|-----------------|---------------|
| Chrome | Last 2 major versions (124+) | Full support |
| Firefox | Last 2 major versions (125+) | Full support |
| Safari | Last 2 major versions (17+) | Full support |
| Edge | Last 2 major versions (124+) | Full support |

**Notes:**
- Next.js 15 automatically polyfills for supported browsers
- ES2020+ features used (nullish coalescing, optional chaining)
- No IE11 support (discontinued by Microsoft)

### 5.2 Mobile Browsers
| Browser | Minimum Version | Support Level |
|---------|-----------------|---------------|
| iOS Safari | iOS 16+ (last 2 major versions) | Full support |
| Android Chrome | Android 12+ (last 2 major versions) | Full support |
| Samsung Internet | Last 2 major versions | Best effort |

**Mobile Considerations:**
- Touch targets: Minimum 44x44px (Apple HIG), 48x48px (Material Design)
- Viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- Responsive design: Mobile-first approach (320px to 1920px)
- No Flash, no Java applets (deprecated)

### 5.3 Progressive Enhancement
- **Core Functionality:**
  - Works without JavaScript (basic HTML forms for critical paths)
  - Enhanced experience with JavaScript enabled
- **Graceful Degradation:**
  - Rich text editor: Falls back to `<textarea>` if unsupported
  - Drag-and-drop: Falls back to file input `<input type="file">`
  - Service Worker: Optional (offline mode works without)

### 5.4 Feature Detection
- **Use Feature Detection (Not Browser Detection):**
  - Check for `File API` before drag-and-drop upload
  - Check for `IndexedDB` before offline storage
  - Check for `WebP` support before image optimization
- **Polyfills:**
  - Automatic via Next.js browserslist config
  - Custom polyfills loaded conditionally via `@babel/preset-env`

---

## 6. Reliability Requirements

### 6.1 Uptime
- **Target:** 99.9% uptime (8.76 hours downtime/year max)
- **SLA:** No formal SLA for MVP (best-effort)
- **Monitoring:**
  - Vercel uptime monitoring (status.vercel.com)
  - Supabase uptime monitoring (status.supabase.com)
  - Pingdom/UptimeRobot for external checks (every 5 min)
- **Status Page:**
  - Public status page via Statuspage.io or similar
  - Subscribe to incident notifications
  - Historical uptime data visible to users

### 6.2 Error Rate
- **Target:** < 1% of total requests result in 5xx errors
- **Measurement:**
  - Vercel Analytics: Track error rate per API route
  - Sentry: Track unhandled exceptions in frontend and backend
- **Acceptable Error Rates by Endpoint:**
  - Critical (auth, payment): < 0.1% error rate
  - High priority (Jira sync, Test Case CRUD): < 0.5% error rate
  - Low priority (analytics, exports): < 2% error rate

### 6.3 Recovery Time Objective (RTO)
- **Target:** < 5 minutes for critical incidents
- **Incident Severity Levels:**
  - **P0 (Critical):** Complete outage, auth down, data loss
    - Response time: < 5 minutes
    - Resolution time: < 30 minutes
  - **P1 (High):** Major feature broken (Jira sync, Test Case editor)
    - Response time: < 15 minutes
    - Resolution time: < 2 hours
  - **P2 (Medium):** Minor feature broken (PDF export, search)
    - Response time: < 1 hour
    - Resolution time: < 8 hours
  - **P3 (Low):** Cosmetic issues, minor bugs
    - Response time: < 24 hours
    - Resolution time: < 1 week

### 6.4 Recovery Point Objective (RPO)
- **Target:** < 1 hour data loss maximum
- **Backup Strategy:**
  - **Database:** Supabase automatic daily backups (retained 7 days)
  - **Point-in-time recovery:** Available up to 7 days ago (Supabase Pro)
  - **Evidence files:** Supabase Storage versioning (optional, not enabled by default)
- **Disaster Recovery:**
  - Database snapshots exported weekly to S3 (encrypted)
  - Code in Git (GitHub) with protected main branch
  - Infrastructure as code (Vercel config, Supabase migrations)

### 6.5 Error Handling & Resilience
- **API Errors:**
  - All errors return consistent format: `{ error_code, message, details }`
  - User-friendly messages (no stack traces in production)
  - Retry logic for transient failures (network, rate limits)
- **Circuit Breaker Pattern:**
  - Jira API: Stop syncing after 5 consecutive failures, retry after 5 min
  - Supabase: Fallback to cached data if database unreachable
- **Graceful Degradation:**
  - Jira sync down: Show banner, allow local-only work
  - Storage full: Prompt to upgrade or delete old files
  - PDF export fails: Offer CSV export as alternative

---

## 7. Maintainability Requirements

### 7.1 Code Coverage
- **Target:** ≥ 80% code coverage for unit tests
- **Measurement:** Istanbul/nyc via Vitest or Jest
- **Coverage by Layer:**
  - API routes (business logic): ≥ 85%
  - React components: ≥ 70% (focus on critical paths)
  - Utility functions: ≥ 90%
- **Testing Strategy:**
  - Unit tests: Vitest (for utils, hooks, components)
  - Integration tests: Playwright or Cypress (for critical user flows)
  - E2E tests: Playwright (for signup, Jira sync, Test Case creation)
- **CI Enforcement:**
  - Block PRs if coverage drops below 80%
  - Show coverage diff in PR comments (via Codecov or Coveralls)

### 7.2 Documentation
- **Required Documentation:**
  - **README.md:** Project overview, setup instructions, tech stack
  - **CONTRIBUTING.md:** How to contribute, code standards, PR process
  - **API Documentation:** OpenAPI/Swagger spec for all API routes
  - **Architecture Diagrams:** System architecture, database schema (ERD)
  - **Runbooks:** Deployment process, rollback procedures, incident response
- **Code Documentation:**
  - JSDoc comments for all public functions
  - Complex logic explained with inline comments
  - TypeScript types as documentation (self-documenting code)
- **User Documentation:**
  - In-app tooltips and onboarding
  - Help center (future): FAQ, tutorials, video guides
  - Changelog: Document all features, fixes, breaking changes

### 7.3 Linting & Code Standards
- **ESLint Configuration:**
  - Extends: `next/core-web-vitals`, `eslint:recommended`
  - Plugins: `@typescript-eslint`, `eslint-plugin-react-hooks`
  - Rules: Enforce consistent style (single quotes, 2-space indent, etc.)
- **Prettier Configuration:**
  - Single quotes, trailing commas, 2-space indent
  - Auto-format on save (VSCode/Cursor settings)
  - Pre-commit hook: Format all staged files (Husky + lint-staged)
- **Pre-Commit Hooks:**
  - ESLint check (fail on errors, warn on warnings)
  - Prettier format
  - TypeScript type check
  - Unit tests (fast tests only, < 10 seconds)
- **CI Checks:**
  - Linting, type checking, tests run on every PR
  - Block merge if checks fail

### 7.4 TypeScript Strict Mode
- **Configuration:**
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "strictFunctionTypes": true,
      "strictBindCallApply": true,
      "strictPropertyInitialization": true,
      "noImplicitThis": true,
      "alwaysStrict": true
    }
  }
  ```
- **Type Safety:**
  - No `any` types (use `unknown` or proper types)
  - All API responses typed with Zod schemas
  - Supabase queries typed with generated types (from schema)
- **Type Generation:**
  - Supabase CLI: `supabase gen types typescript --local > types/supabase.ts`
  - Run after each migration to keep types in sync

### 7.5 Dependency Management
- **Strategy:**
  - Lock file committed (package-lock.json or pnpm-lock.yaml)
  - Exact versions for critical dependencies (e.g., `"next": "15.0.0"`)
  - Caret (^) for minor updates (e.g., `"react": "^18.3.0"`)
- **Updates:**
  - Dependabot enabled (GitHub) - weekly PRs for dependency updates
  - Security updates applied within 48 hours
  - Major version upgrades: Test thoroughly, create migration guide
- **Audit:**
  - Run `npm audit` or `pnpm audit` weekly
  - Fix high/critical vulnerabilities immediately
  - Document accepted risks for low/moderate vulnerabilities

### 7.6 Monitoring & Observability
- **Error Tracking:**
  - Sentry for frontend and backend errors
  - Group errors by root cause (not by user)
  - Alert on new errors or spike in error rate
- **Logging:**
  - Vercel Logs for serverless function execution
  - Structured logging (JSON format) for easy parsing
  - Log levels: DEBUG, INFO, WARN, ERROR
  - Never log sensitive data (passwords, tokens)
- **Performance Monitoring:**
  - Vercel Analytics for Web Vitals (LCP, FID, CLS)
  - Custom metrics: API response time, Jira sync duration
  - Alerts: Notify if LCP > 3s or API p95 > 1s
- **User Analytics (Privacy-Friendly):**
  - Plausible or Fathom (no cookies, GDPR-compliant)
  - Track: Page views, feature usage (Jira sync count, Test Case creation)
  - No PII tracking (no names, emails, IP addresses)

### 7.7 Code Review Process
- **Pull Request Requirements:**
  - All changes via PR (no direct commits to main)
  - PR template: Description, related issue, testing checklist
  - At least 1 approval required (founder + beta tester for MVP)
  - CI checks must pass (linting, tests, type check)
- **Review Checklist:**
  - Code follows style guide
  - Tests added for new features
  - Documentation updated (README, API docs)
  - No security vulnerabilities introduced
  - Performance impact considered

---

## 8. Compliance & Privacy Requirements

### 8.1 Data Privacy (GDPR/CCPA)
- **User Rights:**
  - Right to access: Export all user data (FR-028)
  - Right to deletion: Delete account + all data (soft delete, hard delete after 90 days)
  - Right to portability: Export data in JSON/CSV format
- **Data Retention:**
  - Active users: Retain indefinitely (while account active)
  - Inactive users: Anonymize after 2 years of inactivity (email to user before)
  - Deleted accounts: Hard delete after 90 days (compliance hold period)
- **Cookies & Tracking:**
  - Essential cookies only (auth session)
  - No third-party tracking cookies
  - Cookie consent banner (if analytics added in future)

### 8.2 Terms of Service & Privacy Policy
- **Required Documents:**
  - Terms of Service: User responsibilities, acceptable use, liability
  - Privacy Policy: Data collection, usage, sharing, retention
  - Cookie Policy: If using non-essential cookies
- **Acceptance:**
  - Users must accept terms on signup (checkbox required)
  - Notify users of policy changes (email + in-app banner)
  - Version terms (e.g., "Last updated: 2025-11-02")

### 8.3 Payment Security (PCI Compliance)
- **Strategy:** No card data touches our servers
- **Stripe Integration:**
  - Stripe Checkout hosted payment page (PCI-compliant)
  - Stripe handles all card processing
  - QAssist never sees or stores card numbers
- **Compliance Level:** PCI DSS SAQ A (Stripe handles compliance)

---

## 9. Localization & Internationalization (Future)

### 9.1 MVP Scope
- **Language:** English only (US English)
- **Date/Time Format:** ISO 8601 (YYYY-MM-DD HH:mm:ss)
- **Timezone:** Store UTC, display user's local timezone
- **Currency:** USD only (if relevant for future marketplace)

### 9.2 Future (Phase 2+)
- **i18n Framework:** next-intl or react-i18next
- **Target Languages:** Spanish, Portuguese, German, French
- **RTL Support:** Future (Arabic, Hebrew)
- **Number/Date Formatting:** Intl API (browser native)

---

## Summary

**Total NFR Categories:** 9 (Performance, Security, Scalability, Accessibility, Browser Support, Reliability, Maintainability, Compliance, i18n)

**Key Metrics to Monitor:**
- Page load time (LCP): < 2s
- API response time (p95): < 500ms
- Uptime: 99.9%
- Error rate: < 1%
- Code coverage: > 80%
- WCAG compliance: Level AA

**MVP Focus:**
- Performance and security are non-negotiable
- Accessibility built-in from day 1 (not retrofitted)
- Scalability designed for growth (100 → 500 → 1000 users)
- Maintainability to support rapid iteration

**Next Steps:**
- Implement monitoring dashboards (Vercel, Sentry, Supabase)
- Create performance budget enforcement in CI
- Set up automated security scanning (Snyk, npm audit)
- Document runbooks for common incidents
