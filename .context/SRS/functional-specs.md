# QAssist - Functional Specifications

## Epic 1: User Authentication & Onboarding

### FR-001: The system must allow user registration with email and password

- **Related to:** EPIC-QASSIST-001, US 1.1
- **Input:**
  - email (string, RFC 5321 format, max 254 characters)
  - password (string, min 8 characters, max 128 characters)
  - consent_terms (boolean, must be true)
- **Processing:**
  - Validate email format against RFC 5321 standard
  - Validate password strength (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
  - Check email uniqueness in database (case-insensitive)
  - Hash password using bcrypt (salt rounds: 10)
  - Create user record in `users` table with status "pending_verification"
  - Generate email verification token (UUID v4, expires in 24 hours)
  - Send verification email to provided address
  - Create user session token (JWT, expires in 7 days)
- **Output:**
  - Success (201): `{ id, email, created_at, session_token }`
  - Error (400): `{ error_code: "INVALID_EMAIL" | "WEAK_PASSWORD" | "EMAIL_EXISTS", message }`
  - Error (500): `{ error_code: "SERVER_ERROR", message }`
- **Validations:**
  - Email must be unique in system (case-insensitive)
  - Password must contain: min 8 chars, 1 uppercase, 1 lowercase, 1 number
  - Email must be valid RFC 5321 format
  - Terms of service consent must be true
  - Rate limit: max 5 registration attempts per IP per hour

---

### FR-002: The system must allow user login with credentials

- **Related to:** EPIC-QASSIST-001, US 1.2
- **Input:**
  - email (string, max 254 characters)
  - password (string, max 128 characters)
- **Processing:**
  - Lookup user by email (case-insensitive)
  - Verify password against stored bcrypt hash
  - Check account status (not suspended/deleted)
  - Update last_login timestamp
  - Generate new session token (JWT, expires in 7 days)
  - Log login event (IP address, user agent, timestamp)
- **Output:**
  - Success (200): `{ user: { id, email, name, avatar_url, subscription_tier }, session_token }`
  - Error (401): `{ error_code: "INVALID_CREDENTIALS", message }`
  - Error (403): `{ error_code: "ACCOUNT_SUSPENDED", message }`
  - Error (500): `{ error_code: "SERVER_ERROR", message }`
- **Validations:**
  - Email must exist in database
  - Password must match stored hash
  - Account status must be "active" or "pending_verification"
  - Rate limit: max 5 failed login attempts per IP per 15 minutes (then CAPTCHA required)

---

### FR-003: The system must allow password reset via email

- **Related to:** EPIC-QASSIST-001, US 1.3
- **Input:**
  - email (string, max 254 characters)
- **Processing:**
  - Lookup user by email (case-insensitive)
  - Generate password reset token (UUID v4, expires in 1 hour)
  - Store token in `password_reset_tokens` table with expiration timestamp
  - Send password reset email with reset link
  - Return success response regardless of email existence (prevent user enumeration)
- **Output:**
  - Success (200): `{ message: "If email exists, reset link sent" }`
  - Error (429): `{ error_code: "RATE_LIMIT_EXCEEDED", message }`
  - Error (500): `{ error_code: "SERVER_ERROR", message }`
- **Validations:**
  - Rate limit: max 3 reset requests per email per hour
  - Token must expire after 1 hour
  - Previous tokens for same user must be invalidated when new token generated

**FR-003b: Password Reset Token Validation**
- **Input:**
  - reset_token (string, UUID v4)
  - new_password (string, min 8 chars, max 128 chars)
- **Processing:**
  - Validate token exists and not expired
  - Validate new password strength
  - Hash new password with bcrypt
  - Update user password in database
  - Invalidate reset token
  - Revoke all existing user sessions (force re-login)
- **Output:**
  - Success (200): `{ message: "Password updated successfully" }`
  - Error (400): `{ error_code: "INVALID_TOKEN" | "EXPIRED_TOKEN" | "WEAK_PASSWORD", message }`
- **Validations:**
  - Token must be valid UUID v4
  - Token must not be expired (< 1 hour old)
  - New password must meet strength requirements

---

### FR-004: The system must provide guided onboarding tutorial

- **Related to:** EPIC-QASSIST-001, US 1.4
- **Input:**
  - user_id (UUID, authenticated user)
- **Processing:**
  - Check user's onboarding status in `user_onboarding` table
  - Return onboarding steps based on completion status:
    1. Connect Jira (required)
    2. Import first User Story (required)
    3. Create first Test Case (required)
    4. Attach evidence (optional)
    5. Export PDF (optional)
  - Track completion progress in database
  - Show context-sensitive tooltips based on current step
- **Output:**
  - Success (200): `{ steps: [ { id, title, description, completed, required } ], progress_percentage }`
- **Validations:**
  - User must be authenticated
  - Onboarding completion tracked per user
  - Tutorial can be dismissed but re-shown on user request

**FR-004b: Update Onboarding Progress**
- **Input:**
  - user_id (UUID)
  - step_id (string)
  - completed (boolean)
- **Processing:**
  - Update `user_onboarding` table with step completion
  - Calculate overall progress percentage
  - Trigger celebration animation when all required steps completed
- **Output:**
  - Success (200): `{ progress_percentage, next_step }`

---

### FR-005: The system must allow user profile management

- **Related to:** EPIC-QASSIST-001, US 1.5
- **Input:**
  - user_id (UUID, authenticated)
  - name (string, optional, max 100 chars)
  - email (string, optional, RFC 5321 format)
  - avatar (file, optional, max 2MB, JPEG/PNG only)
- **Processing:**
  - Validate input fields
  - If email changed: generate new verification email, mark email as "pending_verification"
  - If avatar uploaded: resize to 256x256, convert to WebP, store in object storage
  - Update user record in database
  - Return updated user object
- **Output:**
  - Success (200): `{ user: { id, name, email, avatar_url, email_verified } }`
  - Error (400): `{ error_code: "INVALID_EMAIL" | "FILE_TOO_LARGE" | "INVALID_FILE_TYPE", message }`
- **Validations:**
  - Name max 100 characters
  - Email must be unique if changed
  - Avatar max 2MB, only JPEG/PNG formats
  - Email change requires re-verification

---

## Epic 2: Jira Integration & Bidirectional Sync

### FR-006: The system must allow Jira OAuth connection

- **Related to:** EPIC-QASSIST-002, US 2.1
- **Input:**
  - user_id (UUID, authenticated)
  - jira_instance_url (string, valid URL format)
- **Processing:**
  - Validate Jira instance URL format (must be https://*.atlassian.net or self-hosted)
  - Generate OAuth 2.0 authorization URL with required scopes:
    - `read:jira-work` (read projects, issues)
    - `write:jira-work` (update issue status, create issues)
  - Store OAuth state parameter for CSRF protection
  - Redirect user to Jira consent screen
- **Output:**
  - Success (200): `{ authorization_url, state }`
  - Error (400): `{ error_code: "INVALID_JIRA_URL", message }`

**FR-006b: Handle Jira OAuth Callback**
- **Input:**
  - code (string, OAuth authorization code)
  - state (string, CSRF protection token)
  - user_id (UUID, from session)
- **Processing:**
  - Validate state parameter matches stored value
  - Exchange authorization code for access token via Jira OAuth API
  - Store access token and refresh token in `jira_connections` table (encrypted at rest)
  - Fetch Jira user info and accessible projects
  - Mark connection status as "active"
- **Output:**
  - Success (200): `{ jira_user: { name, email }, accessible_projects_count }`
  - Error (400): `{ error_code: "INVALID_STATE" | "OAUTH_FAILED", message }`
- **Validations:**
  - State parameter must match stored value (CSRF protection)
  - Access token must be encrypted using AES-256 before storage
  - User can only have one active Jira connection per instance

---

### FR-007: The system must allow one-click User Story import from Jira

- **Related to:** EPIC-QASSIST-002, US 2.2
- **Input:**
  - user_id (UUID, authenticated)
  - jira_project_key (string, e.g., "PROJ")
  - sprint_id (number, optional - if omitted, imports all open sprints)
- **Processing:**
  - Verify active Jira connection exists
  - Fetch issues from Jira API filtered by:
    - Project key
    - Sprint ID (if specified)
    - Assignee = current user (or all issues if user has permissions)
  - Map Jira fields to QAssist schema:
    - `key` → `jira_issue_key`
    - `summary` → `title`
    - `description` → `description`
    - `status` → `jira_status`
    - `priority` → `priority`
    - `assignee` → `assigned_to`
  - Store issues in `user_stories` table with `source: "jira"`
  - Create sync metadata (last_synced_at, sync_direction: "jira_to_qassist")
- **Output:**
  - Success (200): `{ imported_count, stories: [ { id, jira_issue_key, title, status } ] }`
  - Error (401): `{ error_code: "JIRA_CONNECTION_EXPIRED", message }`
  - Error (403): `{ error_code: "INSUFFICIENT_PERMISSIONS", message }`
  - Error (500): `{ error_code: "JIRA_API_ERROR", message }`
- **Validations:**
  - Jira connection must be active and not expired
  - Project key must exist in user's accessible projects
  - Duplicate stories (by jira_issue_key) are updated, not re-created
  - Rate limit: Max 100 issues imported per request (pagination required for larger datasets)

---

### FR-008: The system must display User Stories organized by Sprint/Project

- **Related to:** EPIC-QASSIST-002, US 2.3
- **Input:**
  - user_id (UUID, authenticated)
  - project_id (UUID)
  - filter (object, optional): `{ sprint_id, status, assigned_to_me }`
- **Processing:**
  - Fetch User Stories from database filtered by project and user ownership
  - Group stories by sprint (active sprint first, then by date descending)
  - Apply optional filters (sprint, status, assignee)
  - Sort within each sprint by priority (High → Medium → Low)
  - Include metadata: test case count, last updated timestamp
- **Output:**
  - Success (200): `{ sprints: [ { id, name, status, stories: [ { id, jira_key, title, status, test_case_count } ] } ] }`
- **Validations:**
  - User must have access to project
  - Sprint grouping defaults to "No Sprint" for unassigned stories

---

### FR-009: The system must sync Test Case status back to Jira automatically

- **Related to:** EPIC-QASSIST-002, US 2.4
- **Input:**
  - test_case_id (UUID)
  - new_status (enum: "pass" | "fail" | "blocked")
  - user_id (UUID, authenticated)
- **Processing:**
  - Fetch Test Case and related User Story
  - Verify User Story has Jira mapping (jira_issue_key exists)
  - Calculate aggregated QA status for User Story:
    - Count: total_tests, passed_tests, failed_tests, blocked_tests
    - Status: "All Passed" | "X Failed" | "In Progress"
  - Update Jira issue via API:
    - Option 1: Update custom field "QA Status" (if configured)
    - Option 2: Add comment with test results (fallback)
  - Store sync event in `sync_history` table
- **Output:**
  - Success (200): `{ synced: true, jira_issue_key, updated_field: "custom_field" | "comment" }`
  - Error (400): `{ error_code: "NO_JIRA_MAPPING", message }`
  - Error (403): `{ error_code: "JIRA_PERMISSION_DENIED", message }`
  - Error (500): `{ error_code: "JIRA_API_ERROR", message }`
- **Validations:**
  - Test Case must belong to User Story with Jira mapping
  - Jira connection must be active
  - User must have write permissions in Jira project
  - Retry logic: 3 attempts with exponential backoff on API failures

---

### FR-010: The system must allow manual sync trigger

- **Related to:** EPIC-QASSIST-002, US 2.5
- **Input:**
  - user_id (UUID, authenticated)
  - project_id (UUID)
  - sync_direction (enum: "jira_to_qassist" | "qassist_to_jira" | "bidirectional")
- **Processing:**
  - Verify Jira connection is active
  - If "jira_to_qassist" or "bidirectional":
    - Fetch updated issues from Jira (based on last_synced_at timestamp)
    - Update local User Stories with new data
    - Detect conflicts (story deleted in Jira but has Test Cases in QAssist)
  - If "qassist_to_jira" or "bidirectional":
    - Push Test Case status updates to Jira for all modified Test Cases
  - Generate sync report: added, updated, deleted, conflicts
  - Update last_synced_at timestamp
- **Output:**
  - Success (200): `{ sync_summary: { added, updated, deleted, conflicts }, last_synced_at }`
  - Error (401): `{ error_code: "JIRA_CONNECTION_EXPIRED", message }`
  - Error (409): `{ error_code: "SYNC_CONFLICTS", conflicts: [ { story_id, issue } ] }`
- **Validations:**
  - Free tier: Manual sync only (no rate limit)
  - Conflicts must be presented to user for resolution (archive, delete, or keep)
  - Sync operations are idempotent (safe to retry)

---

### FR-011: The system must provide automatic real-time sync for Pro users

- **Related to:** EPIC-QASSIST-002, US 2.6
- **Input:**
  - user_id (UUID, authenticated, subscription_tier: "pro")
  - project_id (UUID)
- **Processing:**
  - Run background job every 15 minutes:
    - Trigger bidirectional sync (FR-010)
    - Handle conflicts automatically using predefined rules:
      - Jira updates always win for story metadata
      - QAssist updates always win for Test Case status
    - Show subtle notification toast on sync completion
  - Use Jira webhooks (if available) to receive real-time updates
  - Fallback to polling if webhooks not configured
- **Output:**
  - Background job result: `{ success: true, items_synced }`
  - User notification: Toast message "Synced 3 updates from Jira"
- **Validations:**
  - Feature restricted to Pro tier users
  - Auto-sync can be disabled in user settings
  - Sync operations must not block UI (background process)
  - Max sync frequency: every 15 minutes (prevent API rate limit abuse)

---

## Epic 3: Test Case Management Studio

### FR-012: The system must provide rich HTML Test Case editor

- **Related to:** EPIC-QASSIST-003, US 3.1
- **Input:**
  - test_case_id (UUID, optional for new Test Case)
  - content (HTML string, sanitized)
  - user_story_id (UUID, parent story)
- **Processing:**
  - Sanitize HTML input to prevent XSS (allow only: bold, italic, underline, lists, tables, links)
  - Store content as HTML in database
  - Auto-save every 3 seconds (debounced)
  - Save local copy to file system: `~/QAssist/Project/Sprint/US-XX/TC-XXX.html`
  - Track edit history (last 10 versions) for undo/redo
- **Output:**
  - Success (200): `{ test_case_id, content, last_saved_at, local_path }`
  - Error (400): `{ error_code: "INVALID_HTML" | "XSS_DETECTED", message }`
- **Validations:**
  - HTML must be sanitized (no script tags, event handlers)
  - Content max size: 1MB per Test Case
  - Auto-save must work offline (sync when reconnected)
  - Allowed HTML tags: `<b>, <i>, <u>, <ul>, <ol>, <li>, <table>, <tr>, <td>, <th>, <a>, <h1-h6>, <p>, <br>`

---

### FR-013: The system must provide pre-built Test Case templates

- **Related to:** EPIC-QASSIST-003, US 3.2
- **Input:**
  - template_id (string: "blank" | "smoke" | "regression" | "edge_cases")
  - user_story_id (UUID)
- **Processing:**
  - Load template HTML from templates library:
    - **Blank:** Empty editor
    - **Smoke Test:** Pre-filled sections (Preconditions, Test Steps, Expected Results)
    - **Regression:** Includes "Previous Behavior" and "Current Behavior" sections
    - **Edge Cases:** Includes decision table template
  - Create new Test Case with template content
  - Auto-generate Test Case ID (TC-XXX)
  - Set status to "draft"
- **Output:**
  - Success (201): `{ test_case: { id, title, content, template_used, status: "draft" } }`
- **Validations:**
  - Template ID must be valid
  - Templates are read-only (users can create custom templates in v2)
  - Template content includes placeholder text to guide user

---

### FR-014: The system must auto-generate Test Case IDs

- **Related to:** EPIC-QASSIST-003, US 3.3
- **Input:**
  - project_id (UUID)
  - user_story_id (UUID)
- **Processing:**
  - Query max Test Case number for project: `SELECT MAX(test_case_number) FROM test_cases WHERE project_id = ?`
  - Increment by 1
  - Format as: `TC-{number:03d}` (e.g., TC-001, TC-002, ... TC-999)
  - Store in database with unique constraint on (project_id, test_case_number)
- **Output:**
  - Generated ID: `TC-XXX`
- **Validations:**
  - Test Case numbers are sequential per project (not global)
  - IDs are immutable once created (no reuse if Test Case deleted)
  - Handle race conditions with database unique constraint + retry logic

---

### FR-015: The system must provide decision table auto-fill functionality

- **Related to:** EPIC-QASSIST-003, US 3.4
- **Input:**
  - test_case_id (UUID)
  - table_config (object): `{ inputs: [ { name, type, values[] } ], outputs: [ { name } ] }`
- **Processing:**
  - Parse input configuration
  - Generate all possible combinations (Cartesian product)
  - Create HTML table with:
    - Header row: Input columns + Output columns
    - Data rows: All combinations with empty output cells
  - Insert table into Test Case content at cursor position
  - Limit: Max 100 rows (prevent exponential explosion)
- **Output:**
  - Success (200): `{ table_html, row_count }`
  - Error (400): `{ error_code: "TOO_MANY_COMBINATIONS", message: "Max 100 rows exceeded" }`
- **Validations:**
  - Max 5 input variables
  - Max 10 values per variable
  - Total combinations ≤ 100 rows
  - Table is editable after generation

**Example:**
- Input: `{ inputs: [{ name: "User Type", values: ["Free", "Pro"] }, { name: "Action", values: ["Upload", "Export"] }] }`
- Output table:
  ```
  | User Type | Action | Expected Result |
  |-----------|--------|-----------------|
  | Free      | Upload | [empty]         |
  | Free      | Export | [empty]         |
  | Pro       | Upload | [empty]         |
  | Pro       | Export | [empty]         |
  ```

---

### FR-016: The system must organize Test Cases by User Story/Sprint

- **Related to:** EPIC-QASSIST-003, US 3.5
- **Input:**
  - user_id (UUID, authenticated)
  - project_id (UUID)
  - view_mode (enum: "by_sprint" | "by_story" | "flat")
- **Processing:**
  - Fetch Test Cases for project
  - Group by selected view mode:
    - **by_sprint:** Sprint → User Story → Test Cases
    - **by_story:** User Story → Test Cases (no sprint grouping)
    - **flat:** All Test Cases in list (sorted by created_at)
  - Include metadata: Test Case count, pass/fail/blocked count, last executed
  - Save user's preferred view mode in settings
- **Output:**
  - Success (200): Hierarchical structure based on view_mode
- **Validations:**
  - View mode preference persists across sessions
  - Empty groups (sprints with no Test Cases) are hidden by default

---

### FR-017: The system must provide Test Case search and filtering

- **Related to:** EPIC-QASSIST-003, US 3.6
- **Input:**
  - user_id (UUID, authenticated)
  - project_id (UUID)
  - query (string, optional, min 2 chars)
  - filters (object, optional): `{ status, sprint_id, user_story_id, date_range }`
- **Processing:**
  - Build SQL query with filters:
    - Text search: Match against title, content (full-text search)
    - Status filter: Pass, Fail, Blocked, Not Executed
    - Sprint/Story filter: Exact match
    - Date range: created_at or last_executed_at
  - Return results sorted by relevance (text search) or date
  - Highlight matching keywords in results
- **Output:**
  - Success (200): `{ results: [ { id, title, snippet, status, last_executed } ], total_count }`
- **Validations:**
  - Query min length: 2 characters
  - Max results: 100 (pagination required for more)
  - Search is case-insensitive
  - Full-text index on title and content columns for performance

---

### FR-018: The system must allow Test Case execution status tracking

- **Related to:** EPIC-QASSIST-003, US 3.7
- **Input:**
  - test_case_id (UUID)
  - status (enum: "pass" | "fail" | "blocked")
  - execution_notes (string, optional, max 1000 chars)
  - executed_by (UUID, user ID)
  - executed_at (timestamp, defaults to now)
- **Processing:**
  - Update Test Case status in database
  - Store execution record in `test_executions` table (history tracking)
  - If status = "fail" or "blocked", mark execution_notes as required
  - Calculate execution duration if timer was running
  - Trigger Jira sync (FR-009) if enabled
- **Output:**
  - Success (200): `{ test_case: { id, status, last_executed_at, execution_count } }`
  - Error (400): `{ error_code: "NOTES_REQUIRED", message: "Execution notes required for failed/blocked tests" }`
- **Validations:**
  - Status must be valid enum value
  - Execution notes required if status = "fail" or "blocked"
  - Execution history preserved (never overwritten)
  - User can re-execute same Test Case multiple times (creates new execution record)

---

## Epic 4: Evidence & Attachment Management

### FR-019: The system must support drag-and-drop screenshot upload

- **Related to:** EPIC-QASSIST-004, US 4.1
- **Input:**
  - test_case_id (UUID)
  - file (binary, image format: JPEG, PNG, GIF, WebP)
  - file_size (number, max based on tier: 10MB per file)
- **Processing:**
  - Validate file type (check MIME type and file signature, not just extension)
  - Validate file size against tier limits
  - Generate unique filename: `{timestamp}_{original_name}`
  - Save to local folder: `~/QAssist/Project/Sprint/US-XX/evidence/{filename}`
  - Generate thumbnail (256px width, maintain aspect ratio)
  - Upload to cloud storage (S3/Supabase Storage) in background
  - Create attachment record in database linked to test_case_id
  - Update user's storage usage counter
- **Output:**
  - Success (201): `{ attachment: { id, filename, url, thumbnail_url, size, uploaded_at } }`
  - Error (400): `{ error_code: "INVALID_FILE_TYPE" | "FILE_TOO_LARGE", message }`
  - Error (413): `{ error_code: "STORAGE_LIMIT_EXCEEDED", message, current_usage, limit }`
- **Validations:**
  - Allowed MIME types: `image/jpeg, image/png, image/gif, image/webp`
  - Max file size: 10MB
  - Validate file signature (prevent malicious files disguised as images)
  - Storage limits: 500MB (Free), 10GB (Pro)
  - Files must be virus-scanned before storage (ClamAV or cloud provider service)

---

### FR-020: The system must auto-organize evidence by Sprint/User Story

- **Related to:** EPIC-QASSIST-004, US 4.2
- **Input:**
  - test_case_id (UUID)
  - attachment_file (binary)
- **Processing:**
  - Determine folder structure from Test Case hierarchy:
    - Project → Sprint → User Story → evidence/
  - Create folder path if not exists: `~/QAssist/{project_name}/{sprint_name}/{user_story_key}/evidence/`
  - Save file to determined path
  - Store relative path in database for portability
  - Create symlink/shortcut in "Recent Evidence" folder for quick access
- **Output:**
  - Local path: `~/QAssist/ProjectX/Sprint-23/US-456/evidence/screenshot-2025-11-02.png`
  - Database record: `{ attachment_id, relative_path, test_case_id }`
- **Validations:**
  - Folder structure matches User Story hierarchy
  - File naming prevents collisions (timestamp prefix)
  - Paths are relative (portable across machines)
  - Works offline (local filesystem only, cloud sync deferred)

---

### FR-021: The system must display thumbnail previews of screenshots

- **Related to:** EPIC-QASSIST-004, US 4.3
- **Input:**
  - test_case_id (UUID)
- **Processing:**
  - Fetch all attachments linked to Test Case
  - Generate thumbnails (if not already generated):
    - Images: Resize to 256px width, maintain aspect ratio
    - Videos: Extract first frame as thumbnail
  - Cache thumbnails in local folder: `~/QAssist/.thumbnails/{attachment_id}.webp`
  - Display in Test Case editor in grid layout
  - Click thumbnail to open full-size lightbox view
- **Output:**
  - Success (200): `{ attachments: [ { id, thumbnail_url, original_url, type, size } ] }`
- **Validations:**
  - Thumbnails generated asynchronously (non-blocking)
  - Thumbnail cache cleared after 30 days of no access
  - Lazy load thumbnails (only generate when viewing Test Case)

---

### FR-022: The system must support video/GIF attachments

- **Related to:** EPIC-QASSIST-004, US 4.4
- **Input:**
  - test_case_id (UUID)
  - file (binary, video format: MP4, WebM, MOV, or GIF)
  - file_size (number, max 50MB per file)
- **Processing:**
  - Validate file type (MIME types: `video/mp4, video/webm, video/quicktime, image/gif`)
  - Validate file size (max 50MB)
  - Save to local folder (same structure as images)
  - Extract first frame as thumbnail (using FFmpeg or browser API)
  - Upload to cloud storage (deferred, background job)
  - Create attachment record with type = "video"
- **Output:**
  - Success (201): `{ attachment: { id, filename, url, thumbnail_url, duration, size } }`
  - Error (400): `{ error_code: "INVALID_VIDEO_FORMAT" | "FILE_TOO_LARGE", message }`
  - Error (413): `{ error_code: "STORAGE_LIMIT_EXCEEDED", message }`
- **Validations:**
  - Allowed video formats: MP4 (H.264 codec), WebM (VP9), MOV, GIF
  - Max file size: 50MB
  - Video duration: No limit (but large files may hit storage limit)
  - Auto-compress videos exceeding 50MB (offer option to user)

---

### FR-023: The system must enforce storage limits by tier

- **Related to:** EPIC-QASSIST-004, US 4.5 & US 4.6
- **Input:**
  - user_id (UUID)
  - new_file_size (number, bytes)
- **Processing:**
  - Fetch user's current storage usage from database
  - Fetch user's tier limit:
    - Free: 500MB (524,288,000 bytes)
    - Pro: 10GB (10,737,418,240 bytes)
  - Calculate: `current_usage + new_file_size`
  - If exceeds limit, reject upload and return error
  - If within limit, proceed with upload and increment usage counter
  - Update `users.storage_used_bytes` in database
- **Output:**
  - Success: Upload proceeds
  - Error (413): `{ error_code: "STORAGE_LIMIT_EXCEEDED", current_usage, limit, available, upgrade_url }`
- **Validations:**
  - Storage usage calculated accurately (sum of all attachments.file_size)
  - Free tier: 500MB hard limit
  - Pro tier: 10GB hard limit
  - Soft warning at 80% usage: Show notification to user
  - Provide "Manage Storage" UI to delete old attachments

---

## Epic 5: Local-First Data Storage & Offline Mode

### FR-024: The system must auto-save all data to local PC

- **Related to:** EPIC-QASSIST-005, US 5.1
- **Input:**
  - user_id (UUID)
  - data_object (Test Case, User Story, attachment metadata)
- **Processing:**
  - Save data to local file system in structured folders:
    - Test Cases: `~/QAssist/{project}/{sprint}/{user_story}/TC-XXX.html`
    - User Stories: `~/QAssist/{project}/{sprint}/user-stories.json`
    - Attachments: `~/QAssist/{project}/{sprint}/{user_story}/evidence/{filename}`
    - Metadata: `~/QAssist/{project}/metadata.json`
  - Save to local IndexedDB for web app or SQLite for desktop app
  - Debounce auto-save: Trigger 3 seconds after last edit
  - Show "Saving..." → "Saved ✓" indicator
  - Queue cloud sync for when online
- **Output:**
  - Local file written successfully
  - Database record updated with `last_saved_locally_at` timestamp
- **Validations:**
  - Files must be saved even when offline
  - Auto-save must not trigger more than once per 3 seconds (debounced)
  - File paths must be sanitized (no special characters that break filesystems)
  - Conflict resolution: Local changes always preserved, cloud sync happens after

---

### FR-025: The system must create structured folder hierarchy automatically

- **Related to:** EPIC-QASSIST-005, US 5.2
- **Input:**
  - project_name (string)
  - sprint_name (string)
  - user_story_key (string, e.g., "US-456")
- **Processing:**
  - Sanitize folder names (remove invalid characters: `/ \ : * ? " < > |`)
  - Create folder structure:
    ```
    ~/QAssist/
      {project_name}/
        {sprint_name}/
          {user_story_key}/
            TC-001.html
            TC-002.html
            evidence/
              screenshot-1.png
              video-1.mp4
        metadata.json
    ```
  - Create folders recursively if they don't exist
  - Create `.qassist` marker file in root to identify QAssist workspace
  - Generate README.txt explaining folder structure
- **Output:**
  - Folder structure created on filesystem
  - Paths stored in database as relative paths (for portability)
- **Validations:**
  - Folder names must be valid for all OS (Windows, macOS, Linux)
  - Max path length: 260 characters (Windows limit)
  - Special characters in project/sprint names auto-replaced with underscores
  - Empty folders (no Test Cases) are not created until first Test Case added

---

### FR-026: The system must support full offline functionality

- **Related to:** EPIC-QASSIST-005, US 5.3
- **Input:**
  - user_id (UUID)
  - offline_mode (boolean, detected automatically or manually enabled)
- **Processing:**
  - Detect network status using browser/OS APIs
  - When offline:
    - Disable Jira sync (show "Offline" badge)
    - All CRUD operations work on local database only
    - Queue cloud sync operations for later
    - Show banner: "You're offline. Changes saving locally."
  - When back online:
    - Auto-trigger sync of queued operations
    - Show notification: "Back online. Syncing X changes..."
    - Resolve conflicts (local changes win, cloud changes merged)
- **Output:**
  - Offline mode active: All features work except Jira sync and cloud storage upload
  - Sync queue: `{ pending_operations: [ { type, data, timestamp } ] }`
- **Validations:**
  - No data loss in offline mode
  - Sync queue persisted to local storage (survives app restart)
  - Conflicts resolved with "local wins" strategy for Test Cases
  - User can manually disable offline mode (force online)

---

### FR-027: The system must auto-sync offline changes when reconnected

- **Related to:** EPIC-QASSIST-005, US 5.4
- **Input:**
  - user_id (UUID)
  - network_status (enum: "online")
- **Processing:**
  - Detect network reconnection
  - Fetch queued sync operations from local storage
  - Execute operations sequentially:
    1. Upload attachments to cloud storage
    2. Sync Test Case updates to cloud database
    3. Sync Jira updates (if Jira sync enabled)
  - Mark each operation as synced in queue
  - Show progress: "Syncing 3 of 10 changes..."
  - Clear queue when all operations complete
  - Log any failed operations for retry
- **Output:**
  - Success: `{ synced_count, failed_count, sync_errors: [] }`
  - User notification: "Synced 10 changes successfully"
- **Validations:**
  - Sync operations are idempotent (safe to retry)
  - Failed operations retry 3 times with exponential backoff
  - User can view sync log (timestamp, operation, status)
  - Max queue size: 1000 operations (prevent memory overflow)

---

### FR-028: The system must allow full workspace export as ZIP

- **Related to:** EPIC-QASSIST-005, US 5.5
- **Input:**
  - user_id (UUID)
  - project_id (UUID)
  - export_options (object): `{ include_evidence, include_metadata, format: "html" | "pdf" }`
- **Processing:**
  - Gather all project data:
    - Test Cases (HTML or PDF format based on option)
    - User Stories (JSON metadata)
    - Evidence files (screenshots, videos)
    - Project metadata (sprints, Jira mappings)
  - Create folder structure in temp directory
  - Generate README.txt with:
    - Project name, export date
    - Folder structure explanation
    - Instructions to re-import (future feature)
  - Compress to ZIP file: `{project_name}_Export_{timestamp}.zip`
  - Offer download to user
  - Clean up temp files after download
- **Output:**
  - Success (200): `{ download_url, file_size, expires_at }`
  - Error (500): `{ error_code: "EXPORT_FAILED", message }`
- **Validations:**
  - Export includes all data in open formats (HTML, JSON, images)
  - Max export size: 5GB (warn user if exceeded)
  - ZIP file expires after 24 hours (temp download link)
  - Export process does not block UI (background job with progress indicator)

---

## Epic 6: Export & Professional Reporting

### FR-029: The system must export Test Cases to PDF

- **Related to:** EPIC-QASSIST-006, US 6.1
- **Input:**
  - test_case_ids (array of UUIDs, or "all" for project)
  - export_options (object): `{ include_evidence, include_execution_history, page_orientation }`
- **Processing:**
  - Fetch Test Cases and related data (User Story, evidence, execution history)
  - Generate HTML template with:
    - Cover page: Project name, sprint, export date, QA name
    - Table of contents (linked)
    - Test Cases grouped by User Story
    - Embedded images (if include_evidence = true)
    - Execution history table (if include_execution_history = true)
  - Convert HTML to PDF using headless browser (Puppeteer) or PDF library
  - Apply styling: Professional fonts, page breaks, headers/footers
  - Add watermark if Free tier (bottom-right corner, 20% opacity)
- **Output:**
  - Success (200): `{ pdf_url, file_size, page_count }`
  - Error (400): `{ error_code: "NO_TEST_CASES_FOUND", message }`
  - Error (500): `{ error_code: "PDF_GENERATION_FAILED", message }`
- **Validations:**
  - PDF quality: 300 DPI for images
  - Max file size: 100MB (compress images if exceeded)
  - Watermark on Free tier: "Generated by QAssist - qassist.io"
  - PDF includes clickable table of contents
  - Export process shows progress: "Generating PDF... 50%"

---

### FR-030: The system must control watermark based on tier

- **Related to:** EPIC-QASSIST-006, US 6.2 & US 6.3
- **Input:**
  - user_id (UUID)
  - subscription_tier (enum: "free" | "pro")
- **Processing:**
  - Check user's subscription tier
  - If Free tier:
    - Add watermark to PDF: "Generated by QAssist - qassist.io" (footer, 10pt gray text)
    - Watermark on every page
  - If Pro tier:
    - No watermark
    - Allow custom branding (logo, company name in header/footer)
- **Output:**
  - PDF with or without watermark based on tier
- **Validations:**
  - Watermark must be subtle but visible (not obstructive)
  - Pro users can upload custom logo (max 500KB, PNG/SVG)
  - Custom branding saved per project (not global)

---

### FR-031: The system must support Excel/CSV export

- **Related to:** EPIC-QASSIST-006, US 6.4
- **Input:**
  - test_case_ids (array of UUIDs)
  - format (enum: "excel" | "csv")
- **Processing:**
  - Fetch Test Cases with columns:
    - ID, Title, User Story, Sprint, Status, Last Executed, Executed By, Notes
  - Generate Excel file (.xlsx) using library (ExcelJS) or CSV (plain text)
  - Excel: Include formatting (bold headers, alternating row colors)
  - CSV: Use UTF-8 encoding, comma delimiter, quoted strings
  - Evidence URLs included as hyperlinks
- **Output:**
  - Success (200): `{ download_url, file_size, format }`
  - Error (400): `{ error_code: "NO_TEST_CASES_FOUND", message }`
- **Validations:**
  - Excel supports max 1M rows (more than enough for Test Cases)
  - CSV properly escapes special characters (commas, quotes)
  - File naming: `{project_name}_TestCases_{timestamp}.xlsx`
  - Evidence attachments not embedded (URLs only)

---

### FR-032: The system must generate Test Summary Report

- **Related to:** EPIC-QASSIST-006, US 6.5
- **Input:**
  - project_id (UUID)
  - sprint_id (UUID, optional - defaults to active sprint)
  - date_range (object, optional): `{ start_date, end_date }`
- **Processing:**
  - Aggregate Test Case data for selected scope:
    - Total Test Cases created
    - Execution breakdown: Passed, Failed, Blocked, Not Executed
    - Coverage percentage: (Executed / Total) × 100
    - Execution time: Sum of all execution durations
    - Defect density: Failed tests per User Story
  - Generate charts:
    - Pie chart: Pass/Fail/Blocked distribution
    - Bar chart: Test Cases by User Story
    - Line chart: Daily execution trend (if date range)
  - Create report in HTML or PDF format
- **Output:**
  - Success (200): `{ report_html, summary: { total, passed, failed, blocked, coverage_percentage } }`
- **Validations:**
  - Report generated in <5 seconds for up to 500 Test Cases
  - Charts rendered using Chart.js or similar library
  - Summary includes Key Insights: "80% pass rate - 3 User Stories need attention"
  - Report can be exported as PDF or shared via link (Pro feature)

---

## Epic 7: Subscription & Monetization

### FR-033: The system must enforce Free tier limits

- **Related to:** EPIC-QASSIST-007, US 7.1
- **Input:**
  - user_id (UUID)
  - subscription_tier (enum: "free")
- **Processing:**
  - Enforce limits:
    - Max 1 active project
    - Max 50 total Test Cases across all projects
    - Max 500MB evidence storage
    - Manual Jira sync only (no auto-sync)
    - PDF exports with watermark
  - Block actions when limit reached:
    - Creating 2nd project → Show upgrade prompt
    - Creating 51st Test Case → Show upgrade prompt
    - Uploading when 500MB exceeded → Show upgrade prompt
  - Track usage in real-time (project_count, test_case_count, storage_used)
- **Output:**
  - Limit enforcement: Block action + show modal with upgrade CTA
  - Usage display: "25 / 50 Test Cases used (Free tier)"
- **Validations:**
  - Limits checked on every create operation
  - Usage counters updated in real-time
  - Grace period: Allow 5% overage (e.g., 52 Test Cases) before hard block
  - Clear messaging: "Upgrade to Pro for unlimited Test Cases"

---

### FR-034: The system must display upgrade prompts at limits

- **Related to:** EPIC-QASSIST-007, US 7.2
- **Input:**
  - user_id (UUID)
  - limit_reached (enum: "projects" | "test_cases" | "storage")
- **Processing:**
  - Show modal with:
    - Headline: "You've reached your Free tier limit"
    - Current usage: "50 / 50 Test Cases"
    - Pro benefits: "Upgrade for unlimited Test Cases, 10GB storage, auto-sync"
    - Pricing: "$12/month or $120/year (save 17%)"
    - CTA: "Upgrade to Pro" button (links to Stripe checkout)
  - Track modal impressions and conversions (analytics)
- **Output:**
  - Modal displayed with upgrade CTA
  - User action: "Upgrade Now" or "Not Now"
- **Validations:**
  - Modal shown only when limit reached (not before)
  - Can be dismissed (but action still blocked)
  - "Not Now" shows subtle banner instead of modal for 24 hours
  - Conversion tracking: Click CTA → Complete checkout (funnel analysis)

---

### FR-035: The system must support Stripe subscription checkout

- **Related to:** EPIC-QASSIST-007, US 7.3
- **Input:**
  - user_id (UUID)
  - plan (enum: "pro_monthly" | "pro_yearly")
  - payment_method (Stripe handles this)
- **Processing:**
  - Create Stripe Checkout session:
    - Products: "QAssist Pro - Monthly" ($12/mo) or "QAssist Pro - Yearly" ($120/yr)
    - Customer: Create or retrieve Stripe customer ID for user
    - Success URL: `{app_url}/subscription/success?session_id={CHECKOUT_SESSION_ID}`
    - Cancel URL: `{app_url}/subscription/cancel`
  - Redirect user to Stripe hosted checkout page
  - Handle webhook from Stripe on successful payment:
    - Update user subscription_tier to "pro"
    - Set subscription_expires_at timestamp
    - Send confirmation email
- **Output:**
  - Success: User redirected to success page, subscription activated
  - Cancel: User returns to app, remains on Free tier
- **Validations:**
  - Stripe webhook signature must be validated (prevent fraud)
  - Subscription status synced from Stripe (source of truth)
  - Prorate charges if user switches from monthly to yearly mid-cycle
  - Handle payment failures gracefully (show retry modal)

---

### FR-036: The system must unlock Pro features on upgrade

- **Related to:** EPIC-QASSIST-007, US 7.4
- **Input:**
  - user_id (UUID)
  - subscription_tier (enum: "pro")
- **Processing:**
  - Update user record: `subscription_tier = "pro"`
  - Unlock features:
    - Unlimited projects (remove 1-project limit)
    - Unlimited Test Cases (remove 50 Test Case limit)
    - 10GB evidence storage (increase from 500MB)
    - Auto-sync enabled (every 15 minutes)
    - PDF exports without watermark
    - Custom branding on exports
  - Show celebration modal: "Welcome to Pro! 🎉"
  - Send onboarding email with Pro feature guide
- **Output:**
  - User tier updated in database
  - UI reflects Pro status (badge, unlocked features)
- **Validations:**
  - Feature access controlled by subscription_tier check
  - Pro features enabled immediately after payment (no delay)
  - If subscription expires, gracefully downgrade to Free (preserve data, re-apply limits)

---

### FR-037: The system must allow subscription management

- **Related to:** EPIC-QASSIST-007, US 7.5
- **Input:**
  - user_id (UUID)
  - action (enum: "view" | "upgrade" | "downgrade" | "cancel" | "update_payment")
- **Processing:**
  - **View:** Display current plan, next billing date, payment method
  - **Upgrade:** Monthly → Yearly (prorate difference)
  - **Downgrade:** Cancel at end of current period (no refund)
  - **Cancel:** Mark subscription for cancellation at period end
  - **Update Payment:** Redirect to Stripe customer portal
  - All actions via Stripe API or Customer Portal
- **Output:**
  - View: `{ plan, next_billing_date, amount, payment_method_last4 }`
  - Action success: `{ message, effective_date }`
- **Validations:**
  - Downgrades effective at end of billing period (no immediate refund)
  - Cancellations don't delete data (downgrade to Free tier)
  - Payment updates handled by Stripe Customer Portal (secure)
  - User notified via email for any subscription changes

---

### FR-038: The system must track subscription metrics

- **Related to:** EPIC-QASSIST-007, US 7.6
- **Input:**
  - admin_user_id (UUID, role: "admin")
- **Processing:**
  - Calculate metrics:
    - MRR (Monthly Recurring Revenue): Sum of active monthly subscriptions
    - ARR (Annual Recurring Revenue): MRR × 12
    - Churn rate: (Cancelled subscriptions / Total subscribers) × 100
    - Conversion rate: (Pro users / Total users) × 100
    - Lifetime Value (LTV): Average subscription duration × monthly price
  - Display in admin dashboard with charts
  - Track trends: MRR growth over time, churn by cohort
- **Output:**
  - Success (200): `{ mrr, arr, churn_rate, conversion_rate, ltv, active_subscribers }`
- **Validations:**
  - Metrics updated daily (cron job)
  - Only accessible to admin users
  - Data sourced from Stripe webhooks (source of truth)
  - Visualizations: Line chart (MRR over time), bar chart (conversions by month)

---

## Summary

**Total Functional Requirements:** 38 FRs mapped from 40 User Stories
**Coverage:** 100% of MVP scope User Stories

**FR Breakdown by Epic:**
- Epic 1 (Auth): 5 FRs
- Epic 2 (Jira): 6 FRs
- Epic 3 (Test Cases): 7 FRs
- Epic 4 (Evidence): 5 FRs
- Epic 5 (Local Storage): 5 FRs
- Epic 6 (Export): 4 FRs
- Epic 7 (Subscription): 6 FRs

**Next Steps:**
- Map FRs to API endpoints (srs-api-contracts.md)
- Define non-functional requirements (srs-non-functional-specs.md)
- Design system architecture (srs-architecture-specs.md)
