---
id: STORY-QASSIST-004
jira_id: null
epic_id: EPIC-QASSIST-001
title: As a new user, I want a guided onboarding tutorial, so that I can understand core features in under 5 minutes
priority: High
story_points: 3
assignee: null
status: To Do
---

# STORY-QASSIST-004: Guided onboarding tutorial

## Description

Implement an interactive onboarding tutorial that guides new users through QAssist's core workflow in 5 steps. The tutorial should be engaging, skippable, and track completion to measure activation rate. Users who complete the onboarding are significantly more likely to become active users (target: 60% completion rate).

## Acceptance Criteria (Gherkin format)

### Scenario 1: First-time user sees onboarding on signup
- **Given:** I just completed signup and verified my email
- **When:** I am redirected to the dashboard
- **Then:** An onboarding modal appears with a welcome message
- **And:** The modal shows "Welcome to QAssist! Let's get you started in 5 minutes"
- **And:** I see a progress bar "Step 1 of 5"
- **And:** I see two buttons: "Start Tutorial" and "Skip for now"

### Scenario 2: Complete required onboarding steps
- **Given:** I am in the onboarding tutorial
- **When:** I complete all 3 required steps:
  1. Connect Jira account
  2. Import first User Story
  3. Create first Test Case
- **Then:** My `user_onboarding.step_X` flags are marked as true in the database
- **And:** Progress bar updates: "Step 1 of 5 complete" → "Step 2 of 5 complete"
- **And:** Each completed step shows a green checkmark
- **And:** I see encouraging messages: "Great job! 🎉"

### Scenario 3: Skip onboarding and resume later
- **Given:** I am on step 2 of the onboarding
- **When:** I click "Skip for now"
- **Then:** The modal closes
- **And:** My partial progress is saved in the database
- **When:** I visit the dashboard again later
- **Then:** I see a subtle banner: "Complete your setup (2 of 5 steps done)"
- **And:** I can click "Resume tutorial" to continue from step 3

### Scenario 4: Complete all steps and celebrate
- **Given:** I have completed all 5 onboarding steps
- **When:** I finish the last step (Export PDF)
- **Then:** I see a celebration animation (confetti + success message)
- **And:** The modal shows "You're all set! 🚀 You've unlocked the full power of QAssist."
- **And:** My `user_onboarding.completed_at` timestamp is set
- **And:** The onboarding banner disappears permanently
- **And:** I receive a congratulatory email with tips and resources

### Scenario 5: Onboarding adapts to user actions
- **Given:** I am in the onboarding tutorial
- **When:** I complete a required action outside the tutorial (e.g., I manually connect Jira before tutorial prompts me)
- **Then:** The tutorial automatically detects completion
- **And:** Step 1 is marked as complete without user input
- **And:** The tutorial advances to step 2
- **And:** I see a message: "Nice! You've already connected Jira. Let's move to the next step."

## Technical Notes

### Onboarding Steps

#### Step 1: Connect Jira (Required)
- **Goal:** Authenticate with Jira via OAuth
- **UI:** Modal with "Connect Jira" button
- **Action:** OAuth flow opens in popup window
- **Completion:** `jira_connections` table has an active connection
- **Skip condition:** User can connect Jira later, but tutorial won't proceed

#### Step 2: Import First User Story (Required)
- **Goal:** Import at least 1 User Story from Jira
- **UI:** Guided tour showing Jira sync page
- **Action:** User clicks "Import User Stories" → Selects project → Imports
- **Completion:** `user_stories` table has at least 1 record
- **Skip condition:** Tutorial can be resumed after manual import

#### Step 3: Create First Test Case (Required)
- **Goal:** Create at least 1 Test Case
- **UI:** Guided tour to Test Case editor
- **Action:** User clicks "New Test Case" → Fills in title → Saves
- **Completion:** `test_cases` table has at least 1 record

#### Step 4: Attach Evidence (Optional)
- **Goal:** Upload a screenshot or video
- **UI:** Highlight drag-and-drop area in Test Case editor
- **Action:** User uploads file
- **Completion:** `attachments` table has at least 1 record

#### Step 5: Export PDF (Optional)
- **Goal:** Generate a PDF report
- **UI:** Guided tour to Export page
- **Action:** User clicks "Export to PDF" → Downloads file
- **Completion:** PDF generation API called successfully

### Database Schema
```sql
CREATE TABLE user_onboarding (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  step_connect_jira BOOLEAN DEFAULT false,
  step_import_story BOOLEAN DEFAULT false,
  step_create_test_case BOOLEAN DEFAULT false,
  step_attach_evidence BOOLEAN DEFAULT false,
  step_export_pdf BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ, -- Set when all required steps done
  dismissed BOOLEAN DEFAULT false, -- User clicked "Don't show again"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Endpoints

#### Get Onboarding Status
```typescript
GET /api/onboarding/status
Response (200 OK):
{
  user_id: string;
  steps: {
    connect_jira: { completed: boolean, required: true },
    import_story: { completed: boolean, required: true },
    create_test_case: { completed: boolean, required: true },
    attach_evidence: { completed: boolean, required: false },
    export_pdf: { completed: boolean, required: false }
  };
  progress_percentage: number; // 0-100
  completed_at: string | null;
}
```

#### Update Onboarding Step
```typescript
POST /api/onboarding/update
Request Body:
{
  step: "connect_jira" | "import_story" | "create_test_case" | "attach_evidence" | "export_pdf";
  completed: boolean;
}

Response (200 OK):
{
  progress_percentage: number;
  next_step: string | null; // null if all done
}
```

#### Dismiss Onboarding
```typescript
POST /api/onboarding/dismiss
Response (200 OK):
{
  message: "Onboarding dismissed"
}
```

### UI/UX Components

#### 1. Welcome Modal
- Title: "Welcome to QAssist!"
- Subtitle: "Let's set up your workspace in 5 minutes"
- Illustration: Animated graphic showing QA workflow
- Buttons: "Start Tutorial" (primary), "Skip for now" (secondary)

#### 2. Step-by-Step Guided Tour
- Use library: [Driver.js](https://driverjs.com/) or [Intro.js](https://introjs.com/)
- Highlight interactive elements with pulsing border
- Dim background (overlay with 50% opacity)
- Tooltip with instructions + "Next" button
- Progress indicator: "Step 2 of 5"

#### 3. Completion Celebration
- Confetti animation (use [canvas-confetti](https://github.com/catdad/canvas-confetti))
- Success message: "🎉 You're all set!"
- Summary: "You've completed all core features"
- CTA: "Start Testing" button → Close modal, go to dashboard

#### 4. Resume Banner
- Dismissible banner at top of dashboard
- Text: "Complete your setup (2 of 5 steps done)"
- Progress bar (visual)
- Button: "Resume tutorial"

### Completion Tracking

**Progress Calculation:**
```typescript
const requiredSteps = 3; // connect_jira, import_story, create_test_case
const optionalSteps = 2; // attach_evidence, export_pdf
const totalSteps = 5;

const completedRequired = [step_connect_jira, step_import_story, step_create_test_case].filter(Boolean).length;
const completedOptional = [step_attach_evidence, step_export_pdf].filter(Boolean).length;

const progress_percentage = ((completedRequired + completedOptional) / totalSteps) * 100;
const all_required_done = completedRequired === requiredSteps;

if (all_required_done && !completed_at) {
  completed_at = new Date();
  // Trigger celebration animation
}
```

## Definition of Done

- [ ] Onboarding modal designed and implemented
- [ ] 5 tutorial steps defined with clear goals
- [ ] Guided tour library integrated (Driver.js or Intro.js)
- [ ] Database schema for tracking progress created
- [ ] API endpoints for status and updates implemented
- [ ] Automatic step detection working (e.g., Jira connection triggers step 1 completion)
- [ ] Progress bar updates in real-time
- [ ] Celebration animation triggers on completion
- [ ] Resume functionality working (save partial progress)
- [ ] Dismiss/skip functionality working
- [ ] Congratulatory email sent on completion
- [ ] Analytics tracking onboarding completion rate
- [ ] Unit tests written (progress calculation logic)
- [ ] Integration tests passing (onboarding flow)
- [ ] E2E test passing (Playwright: full onboarding)
- [ ] Mobile responsive
- [ ] Accessibility: Keyboard navigation, skip links
- [ ] Code review approved
- [ ] Deployed to staging and verified
- [ ] User testing confirms 5-minute completion time
