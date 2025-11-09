---
id: STORY-QASSIST-007
jira_id: null
epic_id: EPIC-QASSIST-002
title: As a user, I want to import User Stories from Jira with 1-click, so that I don't have to manually copy data
priority: High
story_points: 3
assignee: null
status: To Do
---

# STORY-QASSIST-007: Import User Stories from Jira with 1-click

## Description

Implement a 1-click import feature that fetches User Stories from Jira and stores them locally in QAssist. Users should be able to filter by project, sprint, and assignee, then import up to 100 issues at once with all standard fields (summary, description, status, priority) intact.

## Acceptance Criteria (Gherkin format)

### Scenario 1: Import User Stories assigned to me
- **Given:** I have an active Jira connection
- **When:** I navigate to "Import from Jira" page
- **Then:** I see a project selector with all my accessible Jira projects
- **When:** I select project "QASSIST"
- **Then:** I see a sprint selector with all sprints in that project
- **When:** I select "Sprint 23" and click "Import User Stories"
- **Then:** QAssist fetches all issues assigned to me in Sprint 23
- **And:** I see a preview list of issues to be imported (max 100)
- **When:** I click "Confirm Import"
- **Then:** All User Stories are saved to the local database
- **And:** I see a success message "15 User Stories imported successfully"
- **And:** I am redirected to the User Stories page showing imported stories

### Scenario 2: Import includes all standard Jira fields
- **Given:** I import a User Story with key "QASSIST-123"
- **Then:** The following fields are imported correctly:
  - jira_issue_key: "QASSIST-123"
  - title: [Jira summary field]
  - description: [Jira description field]
  - status: [Current status, e.g., "In Progress"]
  - priority: [e.g., "High"]
  - assigned_to: [Assignee email/name]
  - sprint_id: [Linked to local sprint record]
  - jira_updated_at: [Last updated timestamp from Jira]

### Scenario 3: Duplicate imports update existing User Stories
- **Given:** I previously imported "QASSIST-123"
- **When:** I import the same User Story again (e.g., after status changed in Jira)
- **Then:** The existing record is updated (not duplicated)
- **And:** Updated fields reflect current Jira state
- **And:** `last_synced_at` timestamp is updated
- **And:** I see a message "10 User Stories imported (5 new, 5 updated)"

### Scenario 4: Import handles large datasets (pagination)
- **Given:** My selected sprint has 150 User Stories
- **When:** I click "Import User Stories"
- **Then:** I see a warning "This will import the first 100 User Stories. You can import more later."
- **And:** Only the first 100 issues are imported
- **And:** I can repeat the import process to fetch additional issues

### Scenario 5: Import fails gracefully on errors
- **Given:** I start an import process
- **When:** Jira API returns an error (e.g., 403 Forbidden due to permissions)
- **Then:** I see an error message "Import failed: Insufficient permissions. Please check your Jira access."
- **And:** No partial data is saved (rollback transaction)
- **And:** I see a "Retry" button

## Technical Notes

### JQL Query Construction

```typescript
function buildJQL(params: {
  projectKey: string;
  sprintId?: number;
  assignee?: string;
}) {
  let jql = `project = "${params.projectKey}"`;

  if (params.sprintId) {
    jql += ` AND sprint = ${params.sprintId}`;
  }

  if (params.assignee) {
    jql += ` AND assignee = "${params.assignee}"`;
  } else {
    jql += ` AND assignee = currentUser()`; // Default: assigned to me
  }

  jql += ` ORDER BY updated DESC`;

  return jql;
}
```

### Jira API Call

```typescript
async function importUserStories(connectionId: string, params: ImportParams) {
  const connection = await getJiraConnection(connectionId);
  const accessToken = decryptToken(connection.access_token_encrypted);

  const jql = buildJQL(params);

  const response = await fetch(
    `https://api.atlassian.com/ex/jira/${connection.jira_cloud_id}/rest/api/3/search`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jql,
        fields: ['summary', 'description', 'status', 'priority', 'assignee', 'updated', 'sprint'],
        maxResults: 100,
        startAt: 0,
      }),
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired, refresh and retry
      await refreshJiraToken(connectionId);
      return importUserStories(connectionId, params); // Retry
    }
    throw new Error(`JIRA_API_ERROR: ${response.statusText}`);
  }

  const data = await response.json();

  return data.issues.map((issue: any) => ({
    jira_issue_id: issue.id,
    jira_issue_key: issue.key,
    title: issue.fields.summary,
    description: issue.fields.description?.content?.[0]?.content?.[0]?.text || '',
    status: issue.fields.status.name,
    priority: issue.fields.priority?.name || 'Medium',
    assigned_to: issue.fields.assignee?.emailAddress || null,
    jira_updated_at: new Date(issue.fields.updated),
  }));
}
```

### Database Operations (Upsert)

```typescript
async function saveUserStories(userId: string, projectId: string, stories: JiraIssue[]) {
  const results = {
    new: 0,
    updated: 0,
  };

  for (const story of stories) {
    const existing = await db.userStories.findUnique({
      where: {
        user_id_jira_issue_key: {
          user_id: userId,
          jira_issue_key: story.jira_issue_key,
        },
      },
    });

    if (existing) {
      // Update existing
      await db.userStories.update({
        where: { id: existing.id },
        data: {
          ...story,
          last_synced_at: new Date(),
        },
      });
      results.updated++;
    } else {
      // Create new
      await db.userStories.create({
        data: {
          ...story,
          user_id: userId,
          project_id: projectId,
          source: 'jira',
          last_synced_at: new Date(),
        },
      });
      results.new++;
    }
  }

  return results;
}
```

### API Endpoints

```typescript
// Get accessible Jira projects
GET /api/jira/projects
Response (200 OK):
{
  projects: [
    { id: "10000", key: "QASSIST", name: "QAssist Project" },
    { id: "10001", key: "PROJ", name: "Another Project" }
  ]
}

// Get sprints for a project
GET /api/jira/projects/{projectKey}/sprints
Response (200 OK):
{
  sprints: [
    { id: 123, name: "Sprint 23", state: "active" },
    { id: 122, name: "Sprint 22", state: "closed" }
  ]
}

// Import User Stories
POST /api/jira/import
Request Body:
{
  projectKey: string;
  sprintId?: number;
  assignee?: string; // "currentUser" or email
  maxResults?: number; // default 100
}

Response (200 OK):
{
  imported: number;
  new: number;
  updated: number;
  stories: UserStory[];
}

Errors:
401: { error_code: "JIRA_TOKEN_EXPIRED" }
403: { error_code: "INSUFFICIENT_PERMISSIONS" }
429: { error_code: "RATE_LIMIT_EXCEEDED" }
500: { error_code: "JIRA_API_ERROR" }
```

## Definition of Done

- [ ] JQL query builder implemented
- [ ] Jira search API integration working
- [ ] Import API endpoint created
- [ ] Upsert logic working (new + updated stories)
- [ ] Project selector populated with user's Jira projects
- [ ] Sprint selector populated with project sprints
- [ ] Import preview shows issues before confirmation
- [ ] Success message shows new/updated counts
- [ ] Error handling for API failures
- [ ] Token refresh on 401 errors
- [ ] Pagination handling (max 100 results)
- [ ] Integration tests passing
- [ ] E2E test passing (full import flow)
- [ ] Code review approved
- [ ] Deployed to staging and verified
