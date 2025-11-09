---
id: STORY-QASSIST-006
jira_id: null
epic_id: EPIC-QASSIST-002
title: As a user, I want to connect my Jira account via OAuth, so that I can sync my projects securely
priority: High
story_points: 5
assignee: null
status: To Do
---

# STORY-QASSIST-006: Connect Jira account via OAuth

## Description

Implement secure Jira Cloud integration using OAuth 2.0 (3-Legged OAuth) that allows users to authorize QAssist to access their Jira data without sharing passwords. The connection should be quick (<2 minutes), secure (encrypted tokens), and support multiple Jira instances.

## Acceptance Criteria (Gherkin format)

### Scenario 1: Successful Jira OAuth connection
- **Given:** I am a logged-in QAssist user without any Jira connections
- **When:** I click "Connect Jira" button on the dashboard
- **Then:** I am redirected to Atlassian's OAuth consent screen
- **And:** The screen shows "QAssist is requesting access to your Jira data"
- **And:** I see requested permissions: "View and edit Jira issues"
- **When:** I click "Accept"
- **Then:** I am redirected back to QAssist
- **And:** I see a success message "Jira connected successfully! ✓"
- **And:** My Jira instance URL is displayed: "Connected to: yourcompany.atlassian.net"
- **And:** Connection status shows "Active" with a green indicator

### Scenario 2: OAuth flow handles errors gracefully
- **Given:** I am on the Atlassian consent screen
- **When:** I click "Deny" (refuse permission)
- **Then:** I am redirected back to QAssist
- **And:** I see a message "Jira connection cancelled. You can try again anytime."
- **And:** No connection record is created in the database

### Scenario 3: Expired OAuth token auto-refreshes
- **Given:** I have an active Jira connection
- **When:** My access token expires (after 1 hour)
- **And:** I trigger any Jira operation (e.g., sync)
- **Then:** QAssist automatically refreshes the token using the refresh_token
- **And:** The operation proceeds without user intervention
- **And:** I don't see any errors or prompts

### Scenario 4: Reconnect when token refresh fails
- **Given:** My Jira connection exists but refresh token is invalid/revoked
- **When:** I attempt to sync with Jira
- **Then:** I see an error message "Jira connection expired. Please reconnect."
- **And:** Connection status shows "Expired" with a yellow warning icon
- **When:** I click "Reconnect Jira"
- **Then:** The OAuth flow starts again

### Scenario 5: View and manage Jira connections
- **Given:** I have an active Jira connection
- **When:** I navigate to Settings → Integrations
- **Then:** I see my connected Jira instance:
  - URL: yourcompany.atlassian.net
  - Status: Active (green) | Expired (yellow) | Revoked (red)
  - Last synced: "2 hours ago"
  - Actions: "Disconnect" button

## Technical Notes

### OAuth 2.0 Flow (Jira Cloud)

```typescript
// Step 1: Generate authorization URL
const authUrl = `https://auth.atlassian.com/authorize?` +
  `audience=api.atlassian.com&` +
  `client_id=${JIRA_CLIENT_ID}&` +
  `scope=${encodeURIComponent('read:jira-work write:jira-work')}&` +
  `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
  `state=${csrfToken}&` +
  `response_type=code&` +
  `prompt=consent`;

// Step 2: Handle callback
// GET /api/auth/jira/callback?code={AUTH_CODE}&state={CSRF_TOKEN}

// Step 3: Exchange code for tokens
const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'authorization_code',
    client_id: JIRA_CLIENT_ID,
    client_secret: JIRA_CLIENT_SECRET,
    code: authCode,
    redirect_uri: REDIRECT_URI,
  }),
});

// Response:
{
  access_token: "eyJraWQi...",
  refresh_token: "eyJraWQi...",
  expires_in: 3600, // 1 hour
  scope: "read:jira-work write:jira-work",
  token_type: "Bearer"
}

// Step 4: Get accessible resources (Jira cloud IDs)
const resources = await fetch('https://api.atlassian.com/oauth/token/accessible-resources', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// Response:
[
  {
    "id": "1324a887-45db-1bf4-1e99-ef0ff456d421",
    "url": "https://yourcompany.atlassian.net",
    "name": "Your Company",
    "scopes": ["read:jira-work", "write:jira-work"]
  }
]
```

### Token Encryption

**Before storing tokens:**
```typescript
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY; // 32-byte key
const IV_LENGTH = 16;

function encryptToken(token: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptToken(encryptedToken: string): string {
  const parts = encryptedToken.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf8');
}
```

### Token Refresh Logic

```typescript
async function refreshJiraToken(connectionId: string) {
  const connection = await db.jiraConnections.findUnique({ where: { id: connectionId } });

  const refreshToken = decryptToken(connection.refresh_token_encrypted);

  const response = await fetch('https://auth.atlassian.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: JIRA_CLIENT_ID,
      client_secret: JIRA_CLIENT_SECRET,
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    // Token refresh failed - mark connection as expired
    await db.jiraConnections.update({
      where: { id: connectionId },
      data: { status: 'expired' },
    });
    throw new Error('JIRA_TOKEN_EXPIRED');
  }

  const { access_token, refresh_token, expires_in } = await response.json();

  await db.jiraConnections.update({
    where: { id: connectionId },
    data: {
      access_token_encrypted: encryptToken(access_token),
      refresh_token_encrypted: encryptToken(refresh_token),
      expires_at: new Date(Date.now() + expires_in * 1000),
      status: 'active',
    },
  });
}
```

### API Endpoints

```typescript
// Initiate OAuth flow
GET /api/jira/connect
Response (302 Redirect): https://auth.atlassian.com/authorize?...

// OAuth callback
GET /api/auth/jira/callback?code={CODE}&state={STATE}
Response (302 Redirect): /dashboard?jira_connected=true

// Get connection status
GET /api/jira/connection
Response (200 OK):
{
  connected: boolean;
  jira_url: string | null;
  status: "active" | "expired" | "revoked" | null;
  last_synced_at: string | null;
}

// Disconnect Jira
DELETE /api/jira/connection
Response (200 OK):
{
  message: "Jira disconnected successfully"
}
```

## Definition of Done

- [ ] OAuth flow implemented (authorization → callback → token exchange)
- [ ] Jira OAuth app registered in Atlassian Developer Console
- [ ] CSRF protection working (state parameter validation)
- [ ] Tokens encrypted before storage (AES-256)
- [ ] Token refresh logic implemented
- [ ] Accessible resources API call working (get Jira cloud ID)
- [ ] Connection status displayed correctly
- [ ] Disconnect functionality working
- [ ] Error handling for denied permissions
- [ ] Error handling for expired tokens
- [ ] Integration tests passing (mock OAuth flow)
- [ ] E2E test passing with real Jira account
- [ ] Security audit: No token leakage in logs/errors
- [ ] Code review approved
- [ ] Deployed to staging and verified
