---
id: EPIC-QASSIST-002
jira_id: null
title: Jira Integration & Bidirectional Sync
priority: P0 (Critical)
business_value: High
estimated_story_points: 21
status: To Do
---

# EPIC-QASSIST-002: Jira Integration & Bidirectional Sync

## Description

Implement a robust, bidirectional integration with Jira that allows users to seamlessly import User Stories, sync test execution results back to Jira, and maintain data consistency across both platforms. This epic is the **core differentiator** of QAssist, eliminating 30+ minutes/day of manual copy-paste work for QA engineers.

## Business Value

**Critical value proposition:** Without Jira integration, QAssist is just another test case tool. This epic validates our core hypothesis that QAs want a Jira-complementary workspace, not a replacement.

**Impact Metrics:**
- **Time Savings:** Eliminates 30 min/day of manual data entry (180 hours/year per user)
- **Adoption Driver:** 70%+ of users expected to enable Jira sync within first week
- **Conversion Catalyst:** Pro plan's auto-sync feature is a key monetization lever
- **Competitive Moat:** Bidirectional sync is rare in QA tools (most are read-only)

**Success Metrics:**
- Jira connection success rate: ≥95%
- User Stories imported on first try: ≥90%
- Sync reliability (no data loss): 99.9%
- Pro tier conversion attributed to auto-sync: ≥20%

## Scope

### In Scope
✅ **Jira OAuth Connection:**
- Support for Jira Cloud (*.atlassian.net)
- OAuth 2.0 authentication (secure, no password storage)
- Support for multiple Jira instances (users can switch between workspaces)
- Connection health monitoring (detect expired tokens)

✅ **User Story Import:**
- 1-click import of issues assigned to current user
- Filter by project, sprint, status
- Support for standard Jira issue fields (key, summary, description, status, priority, assignee)
- Custom field mapping (optional for MVP)
- Bulk import (up to 100 issues at once)

✅ **Data Display:**
- View imported User Stories grouped by Sprint/Project
- Show Jira metadata (issue key, status, priority, last updated)
- Search and filter User Stories locally
- Link to original Jira issue (opens in new tab)

✅ **Bidirectional Sync (QAssist → Jira):**
- Push test case execution status back to Jira
- Update custom field "QA Status" OR add comment (configurable)
- Aggregate test results per User Story (e.g., "8/10 tests passed")
- Manual sync trigger (Free tier)
- Automatic sync every 15 min (Pro tier)

✅ **Sync Conflict Resolution:**
- Detect if User Story was deleted in Jira but has Test Cases in QAssist
- Present conflicts to user with options: Archive, Delete, Keep
- Last-write-wins strategy for metadata updates

### Out of Scope (Post-MVP)
❌ Self-hosted Jira (Jira Server/Data Center) - Only Cloud for MVP
❌ Creating new Jira issues from QAssist
❌ Syncing comments/attachments between platforms
❌ Support for other tools (Azure DevOps, Linear, GitHub Issues)
❌ Advanced custom field mapping (beyond standard fields)
❌ Jira webhooks for real-time sync (polling every 15 min for Pro tier)

## Acceptance Criteria (Epic-level)

- [ ] User can connect Jira account via OAuth in <2 minutes
- [ ] User can import ≥1 User Story with all standard fields intact
- [ ] Imported User Stories display correctly (title, description, status, priority)
- [ ] User can manually trigger sync (Jira → QAssist)
- [ ] Test Case status updates sync to Jira (QAssist → Jira)
- [ ] Pro users have automatic sync enabled (every 15 min)
- [ ] Sync conflicts are detected and presented to user
- [ ] No data loss during sync operations (verified with 100+ sync cycles)
- [ ] Jira OAuth tokens are encrypted at rest (AES-256)
- [ ] Expired tokens trigger re-authentication flow (no crashes)

## Dependencies

### Technical Pre-requisites
- **Jira OAuth App registered** (Client ID, Client Secret)
- **Supabase database configured** (jira_connections, user_stories tables)
- **Jira REST API v3 access** (Cloud API documentation)

### External Dependencies
- **Jira Cloud API** (https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- **Jira OAuth 2.0 (3LO)** for user authorization

### Blocking Dependencies
- EPIC-001 (User Authentication) must be complete (OAuth requires authenticated users)

### Dependent Epics
- EPIC-003 (Test Case Management) depends on this for linking Test Cases to User Stories
- EPIC-006 (Export/Reporting) benefits from Jira metadata for reports

## User Stories

- [STORY-QASSIST-006](./stories/STORY-QASSIST-006-jira-oauth/story.md): Connect Jira account via OAuth (5 pts)
- [STORY-QASSIST-007](./stories/STORY-QASSIST-007-import-user-stories/story.md): Import User Stories from Jira with 1-click (3 pts)
- [STORY-QASSIST-008](./stories/STORY-QASSIST-008-view-user-stories/story.md): View assigned Jira issues by Sprint/Project (2 pts)
- [STORY-QASSIST-009](./stories/STORY-QASSIST-009-sync-test-status/story.md): Auto-sync test case status to Jira (5 pts)
- [STORY-QASSIST-010](./stories/STORY-QASSIST-010-manual-sync/story.md): Manual sync trigger (3 pts)
- [STORY-QASSIST-011](./stories/STORY-QASSIST-011-auto-sync-pro/story.md): Automatic real-time sync for Pro users (3 pts)

**Total Story Points:** 21

## Technical Notes

### Jira OAuth 2.0 Flow (3-Legged OAuth)

1. **User initiates connection:**
   - Click "Connect Jira" button
   - Select Jira instance (if multiple)

2. **Authorization request:**
   ```
   GET https://auth.atlassian.com/authorize?
     audience=api.atlassian.com&
     client_id={CLIENT_ID}&
     scope=read:jira-work write:jira-work&
     redirect_uri={APP_URL}/api/auth/jira/callback&
     state={CSRF_TOKEN}&
     response_type=code&
     prompt=consent
   ```

3. **User grants permission** (redirected to Atlassian consent screen)

4. **Receive authorization code:**
   ```
   GET {APP_URL}/api/auth/jira/callback?code={AUTH_CODE}&state={CSRF_TOKEN}
   ```

5. **Exchange code for tokens:**
   ```
   POST https://auth.atlassian.com/oauth/token
   Body:
   {
     grant_type: "authorization_code",
     client_id: {CLIENT_ID},
     client_secret: {CLIENT_SECRET},
     code: {AUTH_CODE},
     redirect_uri: {REDIRECT_URI}
   }

   Response:
   {
     access_token: "eyJ...",
     refresh_token: "eyJ...",
     expires_in: 3600, // 1 hour
     scope: "read:jira-work write:jira-work"
   }
   ```

6. **Store tokens securely:**
   - Encrypt with AES-256 before storing in database
   - Store `refresh_token` to renew expired access tokens

### Database Schema

```sql
CREATE TABLE jira_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  jira_instance_url TEXT NOT NULL, -- e.g., https://yourcompany.atlassian.net
  jira_cloud_id TEXT NOT NULL, -- Atlassian cloud ID
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, jira_instance_url)
);

CREATE TABLE user_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  jira_issue_key TEXT NOT NULL, -- e.g., PROJ-123
  jira_issue_id TEXT NOT NULL, -- Jira's internal ID
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT, -- High, Medium, Low
  sprint_id UUID REFERENCES sprints(id),
  assigned_to TEXT,
  jira_updated_at TIMESTAMPTZ,
  last_synced_at TIMESTAMPTZ,
  source TEXT DEFAULT 'jira' CHECK (source IN ('jira', 'manual')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, jira_issue_key)
);

CREATE INDEX idx_user_stories_project ON user_stories(project_id);
CREATE INDEX idx_user_stories_sprint ON user_stories(sprint_id);
CREATE INDEX idx_user_stories_jira_key ON user_stories(jira_issue_key);
```

### Jira API Endpoints Used

**1. Get accessible resources (cloud IDs):**
```
GET https://api.atlassian.com/oauth/token/accessible-resources
```

**2. Search for issues (JQL):**
```
GET https://api.atlassian.com/ex/jira/{cloudId}/rest/api/3/search?
  jql=assignee=currentUser() AND project=PROJ AND sprint=123&
  fields=summary,description,status,priority,assignee,updated&
  maxResults=100
```

**3. Update issue (push QA status):**
```
PUT https://api.atlassian.com/ex/jira/{cloudId}/rest/api/3/issue/{issueKey}
Body:
{
  "fields": {
    "customfield_10045": "8/10 tests passed" // QA Status field
  }
}
```

**4. Add comment (alternative to custom field):**
```
POST https://api.atlassian.com/ex/jira/{cloudId}/rest/api/3/issue/{issueKey}/comment
Body:
{
  "body": {
    "type": "doc",
    "version": 1,
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "QAssist Test Results: 8/10 tests passed ✓"
          }
        ]
      }
    ]
  }
}
```

### Sync Strategy

**Jira → QAssist (Import/Update):**
- Frequency: Manual (Free tier), Every 15 min (Pro tier)
- Operations:
  - INSERT new User Stories not in local database
  - UPDATE existing User Stories if `jira_updated_at` > `last_synced_at`
  - DETECT deleted issues (issue no longer in Jira but exists locally)

**QAssist → Jira (Push test status):**
- Trigger: Test Case status changed (Pass/Fail/Blocked)
- Operations:
  - Aggregate test results per User Story
  - Update Jira custom field OR add comment
  - Retry on failure (3 attempts with exponential backoff)

**Conflict Resolution:**
- User Story deleted in Jira: Show conflict modal → User chooses Archive/Delete/Keep
- Sync fails due to permissions: Show error → Prompt to reconnect Jira
- Token expired: Auto-refresh using refresh_token

## Testing Strategy

### Unit Tests
- OAuth token encryption/decryption
- JQL query builder
- Test result aggregation logic

### Integration Tests
- Full OAuth flow (mock Jira API)
- Import User Stories (mock Jira response)
- Push test status (verify API call made)

### E2E Tests (Playwright)
- Connect Jira account (OAuth flow)
- Import User Stories (verify display)
- Update test status (verify Jira updated)

### Manual Tests
- Test with real Jira Cloud instance
- Verify 100+ sync cycles (no data loss)
- Test expired token refresh

## Timeline

**Sprint:** 3-4 (Weeks 5-8)
**Estimated Effort:** 21 story points (~4 weeks for 1 developer)

**Breakdown:**
- Week 1: Story 6 (OAuth connection) - 5 pts
- Week 2: Stories 7-8 (import + display) - 5 pts
- Week 3: Stories 9-10 (bidirectional sync) - 8 pts
- Week 4: Story 11 (auto-sync for Pro) + testing - 3 pts

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Jira API changes break integration | High | Low | Version API calls (v3), monitor Jira changelog |
| OAuth consent screen confuses users | Medium | Medium | Add in-app tutorial, test with beta users |
| Token refresh fails | High | Low | Implement robust retry logic, alert user |
| Sync conflicts cause data loss | Critical | Low | Conflict detection + user resolution, never auto-delete |
| Jira custom field not available | Medium | Medium | Fallback to comments if custom field missing |
| API rate limits hit (10 req/sec) | Medium | Low | Implement request queuing, respect rate limits |

## Definition of Done

- [ ] All 6 user stories completed and tested
- [ ] OAuth flow working with real Jira Cloud instance
- [ ] User Stories import successfully (tested with 100+ issues)
- [ ] Bidirectional sync functional (QAssist ↔ Jira)
- [ ] Sync conflicts detected and resolved properly
- [ ] Token encryption implemented (AES-256)
- [ ] Token refresh working (expired tokens renewed automatically)
- [ ] Unit tests coverage ≥80%
- [ ] Integration tests passing
- [ ] E2E tests passing (OAuth, import, sync)
- [ ] Security audit completed (no token leakage)
- [ ] Documentation updated (setup guide, troubleshooting)
- [ ] Deployed to staging and verified with real Jira account
- [ ] Product Owner acceptance
