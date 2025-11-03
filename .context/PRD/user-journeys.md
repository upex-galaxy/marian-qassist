# QAssist - User Journeys

## Journey 1: First-Time User Onboarding & Setup (Happy Path)

### Persona
**Maya Chen** - The Organized Individual Contributor (27yo QA Engineer, 3 years experience)

### Scenario
Maya just heard about QAssist from a Reddit post on r/QualityAssurance. She's frustrated with managing test cases across Jira, Google Sheets, and local folders. It's Monday morning, and she wants to try QAssist before her sprint planning meeting in 30 minutes.

---

### Steps

**Step 1: Discovery & Sign-Up**
- **User Action:** Visits QAssist landing page, clicks "Start Free" button
- **System Response:**
  - Redirects to sign-up page
  - Shows email/password form with clear "No credit card required" messaging
  - Displays benefits: "1 project, 50 test cases, 500MB storage - Forever free"
- **Pain Point:**
  - ⚠️ If form asks for too much information (company name, job title, phone), Maya might abandon
  - ⚠️ If password requirements are unclear, she'll get frustrated with validation errors

**Step 2: Account Creation**
- **User Action:** Enters email (maya.chen@techstartup.com) and password, clicks "Create Account"
- **System Response:**
  - Creates account in <2 seconds
  - Sends verification email (background, non-blocking)
  - Immediately shows welcome screen with 3 options:
    1. "Connect Jira" (recommended)
    2. "Take Tutorial" (5min video)
    3. "Explore on my own"
- **Pain Point:**
  - ⚠️ If email verification is required before proceeding, Maya loses momentum
  - ⚠️ If welcome screen is overwhelming with too many options, she doesn't know where to start

**Step 3: Connect Jira Account**
- **User Action:** Clicks "Connect Jira" → Redirected to Atlassian OAuth page
- **System Response:**
  - Opens Jira OAuth consent screen in new tab
  - Shows clear permissions request: "QAssist will access: Projects, Issues, Attachments (read-only)"
  - Displays "Why we need this" explanation tooltip
- **Pain Point:**
  - ⚠️ If OAuth fails (wrong credentials, 2FA issues), error message must be clear
  - ⚠️ If Maya doesn't have Jira admin permissions, she can still connect but with limited project access

**Step 4: Jira Authorization**
- **User Action:** Reviews permissions, clicks "Allow" in Jira OAuth screen
- **System Response:**
  - Redirects back to QAssist
  - Shows "Connection successful!" confirmation
  - Displays list of accessible Jira projects with checkboxes
  - Pre-selects projects where she's assigned (smart default)
- **Pain Point:**
  - ⚠️ If she has access to 20+ Jira projects, list is overwhelming without search/filter
  - ⚠️ If connection times out, she's not sure if it worked or needs to retry

**Step 5: Select Jira Project to Import**
- **User Action:** Selects "Product Dashboard Q1" project, clicks "Import Sprints"
- **System Response:**
  - Shows loading spinner with progress: "Importing sprints... 2 of 5 complete"
  - Displays imported sprints in tree view:
    - Sprint 23 (Active) - 12 stories assigned to Maya
    - Sprint 22 (Closed) - 8 stories
  - Auto-expands current sprint
- **Pain Point:**
  - ⚠️ If import takes >10 seconds with no progress indicator, Maya thinks it froze
  - ⚠️ If import fails mid-way (API rate limit), unclear how to retry

**Step 6: Import First User Story**
- **User Action:** Clicks on User Story "US-456: Implement dark mode toggle" in Sprint 23
- **System Response:**
  - Opens User Story detail panel (right sidebar)
  - Shows Jira fields: Title, Description, Acceptance Criteria, Status, Assignee
  - Displays "Create Test Cases" button prominently
- **Pain Point:**
  - ⚠️ If User Story has no description or poorly formatted text, Maya doesn't have context
  - ⚠️ If formatting from Jira (bullets, code blocks) breaks in QAssist, looks unprofessional

**Step 7: Create First Test Case**
- **User Action:** Clicks "Create Test Case" button
- **System Response:**
  - Opens Test Case editor (modal or new page)
  - Shows rich HTML editor with toolbar (bold, italic, lists, tables)
  - Displays template dropdown: "Blank, Smoke Test, Regression, Edge Cases"
  - Auto-fills Test Case ID: TC-001
- **Pain Point:**
  - ⚠️ If editor is too complex (Notion-like with too many formatting options), overwhelming
  - ⚠️ If she can't figure out how to save (no clear "Save" button vs. auto-save), might lose work

**Step 8: Write Test Steps**
- **User Action:** Selects "Smoke Test" template, fills in:
  - Test Case Title: "Verify dark mode toggle switches theme"
  - Test Steps:
    1. Navigate to Settings page
    2. Click "Dark Mode" toggle
    3. Verify UI switches to dark theme
  - Expected Result: "All UI elements display dark theme colors"
- **System Response:**
  - Auto-saves every 3 seconds (subtle "Saved" indicator appears)
  - Test Case appears in left sidebar under US-456
  - Shows local folder path: `~/QAssist/Sprint-23/US-456/TC-001.html`
- **Pain Point:**
  - ⚠️ If auto-save fails silently (no network), Maya loses work without knowing
  - ⚠️ If local folder path is in unexpected location, she can't find files later

**Step 9: Attach Evidence (Screenshot)**
- **User Action:** Drags screenshot file "dark-mode-enabled.png" into Test Case editor
- **System Response:**
  - Shows upload progress bar
  - Displays thumbnail preview inline in Test Case
  - Saves to local folder: `~/QAssist/Sprint-23/US-456/evidence/dark-mode-enabled.png`
  - Updates storage usage: "15MB / 500MB used (Free tier)"
- **Pain Point:**
  - ⚠️ If file size exceeds limit (e.g., 10MB screenshot), unclear error message
  - ⚠️ If drag-and-drop doesn't work (browser issue), no alternative "Browse files" button

**Step 10: Mark Test Case as Executed**
- **User Action:** Clicks "Execute" dropdown, selects "Pass"
- **System Response:**
  - Changes Test Case status badge to green "Passed"
  - Prompts: "Sync status back to Jira? (Updates US-456 custom field)"
  - Shows "Yes, sync now" and "Not now" buttons
- **Pain Point:**
  - ⚠️ If sync fails (Jira API error), error message must explain what to do next
  - ⚠️ If she doesn't have Jira permissions to update custom field, sync fails without clear reason

**Step 11: Sync Status to Jira**
- **User Action:** Clicks "Yes, sync now"
- **System Response:**
  - Shows brief success toast: "Synced to Jira ✓"
  - Updates last sync timestamp in sidebar
  - Jira custom field "QA Status" updates to "1 Passed / 0 Failed"
- **Pain Point:**
  - ⚠️ If Jira doesn't have required custom field configured, sync partially fails
  - ⚠️ If Maya's team doesn't use custom fields, this feature is useless to her

**Step 12: Complete Onboarding Tutorial**
- **User Action:** Clicks "Finish Tutorial" button in onboarding overlay
- **System Response:**
  - Shows congratulations message: "You're all set! Here's what you can do next:"
    - Import more User Stories
    - Create Test Case templates
    - Export PDF report
  - Dismisses onboarding overlay, shows main workspace
- **Pain Point:**
  - ⚠️ If tutorial is mandatory and blocking, Maya gets frustrated (wants to explore freely)
  - ⚠️ If no clear next steps provided, she's not sure what to do next

---

### Expected Outcome
✅ **Success State:**
- Maya successfully connected Jira in <5 minutes
- Created first Test Case with screenshot attached
- Synced status back to Jira
- Understands core workflow: Import → Create Test Case → Attach Evidence → Sync
- Feels confident to continue testing sprint stories in QAssist

📊 **Onboarding Metrics Target:**
- Time to first Test Case created: <8 minutes
- Completion rate: ≥60% of users reach Step 12
- User sentiment: "That was easier than expected" (NPS survey after onboarding)

---

### Alternative Paths / Edge Cases

**Alt Path 1: User Already Has Jira Connected (Returning User)**
- **Step 3 Modified:** System detects existing Jira connection, skips OAuth flow
- **System Response:** Shows "Your Jira projects" with option to "Add more projects" or "Disconnect"
- **Outcome:** Faster onboarding, jumps directly to Step 5 (Select Project)

**Alt Path 2: User Skips Jira Connection (Wants to Try Offline-First)**
- **Step 3 Modified:** Clicks "Explore on my own" instead of "Connect Jira"
- **System Response:**
  - Creates blank project "My First Project"
  - Shows empty workspace with "Create Test Case manually" option
  - Displays tutorial tooltip: "You can connect Jira later from Settings"
- **Outcome:** User explores Test Case editor without Jira dependency, can connect later

**Edge Case 1: OAuth Connection Fails (Incorrect Credentials)**
- **Step 4 Modified:** Maya enters wrong Jira password
- **System Response:**
  - Jira OAuth page shows error: "Authentication failed"
  - Redirects back to QAssist with error message: "Couldn't connect to Jira. Try again?"
  - Offers "Retry" button and "Need help?" link to troubleshooting docs
- **Recovery:** Maya clicks "Retry", corrects credentials, successfully connects

**Edge Case 2: User Has No Jira Projects Assigned**
- **Step 5 Modified:** Jira connection succeeds, but user has view-only access to all projects
- **System Response:**
  - Shows message: "No projects found where you're assigned. You can still import stories from projects you can view."
  - Displays all viewable projects with "Import as Read-Only" option
- **Recovery:** Maya selects project, imports stories but can't sync status back to Jira (read-only mode)

**Edge Case 3: Large Jira Import Times Out**
- **Step 5 Modified:** Maya's Jira project has 500+ stories across 20 sprints
- **System Response:**
  - Shows warning: "Large project detected. Import may take 2-3 minutes."
  - Offers option: "Import last 3 sprints only (recommended)" vs. "Import all sprints"
  - If timeout occurs, shows: "Import incomplete. Retry in chunks?"
- **Recovery:** Maya selects "Import last 3 sprints only", completes successfully in <30 seconds

**Edge Case 4: Auto-Save Fails (Offline Mode)**
- **Step 8 Modified:** Maya loses internet connection while writing Test Case
- **System Response:**
  - Shows orange banner: "You're offline. Changes are saving locally only."
  - Test Case still saves to local folder: `~/QAssist/Sprint-23/US-456/TC-001.html`
  - When reconnected, shows: "You're back online. Syncing 1 pending change..."
- **Recovery:** Auto-sync completes when network restored, no data lost

**Edge Case 5: Storage Limit Exceeded (Free Tier)**
- **Step 9 Modified:** Maya tries to upload 20MB video, exceeding 500MB free tier limit
- **System Response:**
  - Shows error modal: "Storage limit reached (500MB). Please upgrade to Pro for 10GB."
  - Offers "Delete old evidence" or "Upgrade to Pro" buttons
  - Displays current usage breakdown: "Screenshots: 350MB, Videos: 150MB"
- **Recovery:** Maya deletes old screenshots or upgrades to Pro for more storage

---

## Journey 2: Daily Testing Workflow (Happy Path)

### Persona
**Maya Chen** - The Organized Individual Contributor (Returning User, Day 5 of using QAssist)

### Scenario
It's Wednesday mid-sprint. Maya has 3 User Stories assigned in Sprint 23. She already created Test Cases for 2 stories yesterday. Today, she needs to execute tests, document a bug with evidence, and export a progress report for her PM.

---

### Steps

**Step 1: Open QAssist & Sync Latest Changes**
- **User Action:** Launches QAssist desktop app, sees "Last synced 18 hours ago" notice
- **System Response:**
  - Shows "Sync Now" button in top toolbar
  - Displays notification badge: "2 new stories assigned to you in Jira"
- **Pain Point:**
  - ⚠️ If sync is slow (>5 seconds), Maya gets impatient and clicks multiple times
  - ⚠️ If sync conflicts exist (Jira story deleted but Test Cases remain), unclear how to resolve

**Step 2: Trigger Manual Sync**
- **User Action:** Clicks "Sync Now" button
- **System Response:**
  - Shows progress modal: "Syncing Sprint 23... 8 of 10 stories updated"
  - Completes in 3 seconds
  - Shows summary: "2 new stories added, 1 story status updated, 0 conflicts"
  - Highlights new stories in sidebar with "NEW" badge
- **Pain Point:**
  - ⚠️ If sync brings 50+ updates, summary is overwhelming without grouping
  - ⚠️ If conflict occurs (story moved to different sprint), no clear resolution UI

**Step 3: Review New User Story**
- **User Action:** Clicks new story "US-489: Add export CSV button"
- **System Response:**
  - Opens User Story detail panel
  - Shows Jira metadata: Status "In Progress", Priority "High", Sprint "Sprint 23"
  - Displays AI suggestion badge: "Suggested Test Cases (3)" (if Pro feature enabled)
- **Pain Point:**
  - ⚠️ If story has minimal description, Maya doesn't have enough context to create tests
  - ⚠️ If AI suggestions are poor quality (irrelevant tests), she ignores feature entirely

**Step 4: Create Test Cases from Template**
- **User Action:** Clicks "Create Test Cases" → Selects "Regression Test" template
- **System Response:**
  - Opens editor with pre-filled sections:
    - Preconditions: [Template placeholder]
    - Test Steps: [Numbered list template]
    - Expected Results: [Template placeholder]
  - Auto-assigns TC-012 (continues numbering from previous Test Cases)
- **Pain Point:**
  - ⚠️ If template placeholders are not clear, Maya doesn't know what to fill in
  - ⚠️ If she wants to create custom template, process is not discoverable

**Step 5: Execute Test Case & Find Bug**
- **User Action:** Follows Test Steps, discovers CSV export button is broken (downloads empty file)
- **System Response:**
  - Maya marks Test Case status as "Failed"
  - Prompts: "Add failure notes?"
  - Opens notes text area with cursor focused
- **Pain Point:**
  - ⚠️ If notes area is too small (single line), hard to document detailed repro steps
  - ⚠️ If she forgets to attach evidence before saving, bug report is incomplete

**Step 6: Attach Bug Evidence (Screenshot + Video)**
- **User Action:**
  - Takes screenshot of broken export (empty CSV file)
  - Records 15-second screen recording showing bug reproduction
  - Drags both files into Test Case editor
- **System Response:**
  - Shows upload progress: "Uploading 2 files... 50%"
  - Displays inline preview: Screenshot thumbnail + video player
  - Saves to: `~/QAssist/Sprint-23/US-489/evidence/`
  - Updates storage: "127MB / 500MB used"
- **Pain Point:**
  - ⚠️ If video file is large (50MB), upload takes 30+ seconds with no cancel option
  - ⚠️ If video format not supported (e.g., MOV on Windows), shows cryptic error

**Step 7: Sync Failed Test Case to Jira**
- **User Action:** Clicks "Sync to Jira" button in Test Case detail
- **System Response:**
  - Updates Jira US-489 custom field: "QA Status: 1 Failed"
  - Prompts: "Create Jira bug ticket from this failure?"
  - Shows "Yes, create bug" and "No, just update status" options
- **Pain Point:**
  - ⚠️ If custom field doesn't exist in Jira, sync silently fails
  - ⚠️ If Maya wants to create bug but doesn't have Jira permissions, error is confusing

**Step 8: Create Jira Bug from Failed Test Case (Optional)**
- **User Action:** Clicks "Yes, create bug"
- **System Response:**
  - Opens "Create Jira Bug" modal pre-filled with:
    - Summary: "[Bug] CSV export downloads empty file"
    - Description: Test Case steps + failure notes + evidence links
    - Links to: US-489 (parent story)
  - Shows editable fields before creation
- **Pain Point:**
  - ⚠️ If bug template doesn't match team's Jira workflow (missing required fields), creation fails
  - ⚠️ If evidence files are too large to attach to Jira, unclear workaround

**Step 9: Execute Remaining Test Cases (Batch)**
- **User Action:** Opens Test Case list view, selects 5 Test Cases, clicks "Bulk Execute"
- **System Response:**
  - Shows quick execution modal with Pass/Fail/Blocked buttons for each TC
  - Allows adding notes to any failed cases
  - Updates all statuses simultaneously
- **Pain Point:**
  - ⚠️ If bulk modal doesn't show TC titles (only IDs), hard to remember which is which
  - ⚠️ If she accidentally marks wrong status, no easy undo option

**Step 10: Generate Test Summary Report**
- **User Action:** Clicks "Reports" → "Test Summary for Sprint 23"
- **System Response:**
  - Generates report showing:
    - Total Test Cases: 18 (12 Passed, 2 Failed, 4 Not Executed)
    - Coverage: 77% (14/18 executed)
    - Execution Time: 3.5 hours
    - Failed Tests: TC-012 (US-489), TC-008 (US-467)
  - Displays chart: Pass/Fail breakdown by User Story
- **Pain Point:**
  - ⚠️ If report takes >5 seconds to generate, no loading indicator
  - ⚠️ If execution time is inaccurate (Maya forgot to stop timer), metrics are misleading

**Step 11: Export PDF for PM Review**
- **User Action:** Clicks "Export PDF" button
- **System Response:**
  - Shows export options:
    - Include: All Test Cases / Only Executed / Only Failed
    - Attachments: Embed images / Link to files
    - Branding: QAssist watermark (Free) / Custom logo (Pro)
  - Generates PDF in 5 seconds
  - Downloads: `QAssist_Sprint-23_Report_2025-11-02.pdf`
- **Pain Point:**
  - ⚠️ If PDF is 50+ pages (embedded images), file size is huge (20MB+)
  - ⚠️ If watermark is too prominent on Free tier, looks unprofessional

**Step 12: Share Report with PM**
- **User Action:** Opens PDF in viewer, verifies formatting, attaches to Slack message to PM
- **System Response:**
  - PDF displays professionally:
    - Cover page with sprint info
    - Table of contents
    - Test Cases grouped by User Story
    - Embedded screenshots
    - Summary stats footer
- **Pain Point:**
  - ⚠️ If PDF formatting breaks (images overflow pages), looks messy
  - ⚠️ If PM can't open PDF (corrupted file), Maya has to regenerate

---

### Expected Outcome
✅ **Success State:**
- Maya executed 14 Test Cases in 2 hours (vs. 3+ hours in old workflow)
- Documented bug with clear evidence (screenshot + video)
- Synced status back to Jira without manual updates
- Generated professional PDF report in <2 minutes (vs. 30+ minutes manually formatting Excel)
- PM receives clear progress update with visual evidence

📊 **Daily Workflow Metrics Target:**
- Time saved: 60+ minutes per day
- Test execution rate: 7+ Test Cases/hour
- Evidence attachment rate: ≥80% of failed tests have screenshots/videos
- Report generation time: <3 minutes

---

### Alternative Paths / Edge Cases

**Alt Path 1: Pro User with Auto-Sync Enabled**
- **Step 1-2 Modified:** Maya is on Pro plan with real-time sync enabled (every 15min)
- **System Response:**
  - No manual "Sync Now" needed
  - Shows "Auto-sync: ON" status in toolbar
  - New stories appear automatically with subtle notification toast
- **Outcome:** Zero manual sync overhead, always up-to-date

**Edge Case 1: Sync Conflict (Story Deleted in Jira)**
- **Step 2 Modified:** During sync, detects US-467 was deleted in Jira but has 3 Test Cases in QAssist
- **System Response:**
  - Shows conflict modal: "US-467 deleted in Jira. What should we do with 3 Test Cases?"
  - Options: "Archive locally" / "Delete permanently" / "Move to another story"
- **Recovery:** Maya selects "Archive locally", Test Cases moved to "Archived" folder, data preserved

**Edge Case 2: Storage Limit Reached Mid-Upload**
- **Step 6 Modified:** Maya tries to upload 15MB video, but only has 10MB storage remaining
- **System Response:**
  - Shows warning: "Not enough storage. 10MB available, 15MB needed."
  - Options: "Delete old evidence (auto-select least accessed)" / "Upgrade to Pro"
  - Shows which files will be deleted if auto-cleanup selected
- **Recovery:** Maya upgrades to Pro for 10GB storage, upload completes

**Edge Case 3: Jira Custom Field Not Configured**
- **Step 7 Modified:** Maya's Jira project doesn't have "QA Status" custom field
- **System Response:**
  - Shows error: "Can't sync status. Jira custom field 'QA Status' not found."
  - Offers: "Create field in Jira (requires admin)" / "Sync via comments instead"
  - Provides tutorial link: "How to configure Jira custom fields"
- **Recovery:** Maya switches to "sync via comments" mode, status updates appear as Jira comments

**Edge Case 4: PDF Export Fails (Too Large)**
- **Step 11 Modified:** Maya tries to export all 50 Test Cases with 200+ screenshots embedded
- **System Response:**
  - PDF generation stalls at 80% (file size exceeding 100MB)
  - Shows error: "PDF too large. Try reducing image quality or linking instead of embedding."
  - Auto-retries with "Medium Quality" images, successfully generates 15MB PDF
- **Recovery:** PDF exports with compressed images, still readable but smaller file size

---

## Journey 3: Freelancer Managing Multiple Clients (Power User Workflow)

### Persona
**Franco Martínez** - The Juggling Freelancer (34yo, manages 4 active clients)

### Scenario
It's Friday afternoon. Franco has 4 client projects active in QAssist. He needs to switch contexts between Client A (finishing sprint testing), Client B (creating Test Cases for new feature), Client C (exporting report for weekly status call), and Client D (archiving completed project). He has 3 hours before weekend to complete all tasks.

---

### Steps

**Step 1: Switch Client Context (Client A → Client B)**
- **User Action:** Opens QAssist, sees "Client A - E-commerce Platform" project selected
- **System Response:**
  - Shows project switcher dropdown in top navbar
  - Lists 4 active projects:
    - Client A - E-commerce Platform (Last edited 2 hours ago)
    - Client B - Healthcare Portal (Last edited yesterday)
    - Client C - Fintech Dashboard (Last edited 3 days ago)
    - Client D - CRM Integration (Completed)
  - Displays search bar: "Quick switch (⌘K)"
- **Pain Point:**
  - ⚠️ If project switcher requires multiple clicks (menu → submenu → select), context switching is slow
  - ⚠️ If projects don't have clear labels/icons, Franco confuses similar names

**Step 2: Quick Switch Using Keyboard Shortcut**
- **User Action:** Presses ⌘K (Cmd+K), types "Health"
- **System Response:**
  - Shows quick switcher modal with fuzzy search
  - Highlights "Client B - Healthcare Portal" as top match
  - Shows recent files: "Last edited: TC-045 - User registration flow"
- **Pain Point:**
  - ⚠️ If search is slow (>1 second to filter), faster to use mouse
  - ⚠️ If keyboard shortcut isn't discoverable, Franco doesn't know it exists

**Step 3: Create Test Cases for Client B Feature**
- **User Action:** Selects User Story "HS-123: Implement patient consent form"
- **System Response:**
  - Opens User Story detail
  - Shows Client B's custom Jira instance data (different fields than Client A)
  - Displays Client B's saved templates: "HIPAA Compliance Test", "Security Test"
- **Pain Point:**
  - ⚠️ If templates are global (not per-project), Client A templates appear in Client B, causing confusion
  - ⚠️ If Jira field mapping is broken (Client B has custom fields), data missing

**Step 4: Apply Client-Specific Template**
- **User Action:** Selects "HIPAA Compliance Test" template
- **System Response:**
  - Opens Test Case editor with pre-filled HIPAA checklist:
    - Verify PHI data encryption
    - Verify consent form signature capture
    - Verify audit log creation
  - Auto-tags Test Case with "HIPAA", "Security"
- **Pain Point:**
  - ⚠️ If template editing is not intuitive, Franco can't customize for this specific feature
  - ⚠️ If tags are not project-specific, Client A tags appear in Client B

**Step 5: Switch to Client C for Report Export**
- **User Action:** Presses ⌘K, types "Fintech", presses Enter
- **System Response:**
  - Instantly switches to "Client C - Fintech Dashboard" project
  - Shows notification: "Unsaved changes in Client B. Auto-saved to local."
  - Displays Client C workspace with 23 Test Cases ready for weekly report
- **Pain Point:**
  - ⚠️ If context switch is slow (>2 seconds), disrupts flow
  - ⚠️ If unsaved changes are lost during switch, data loss risk

**Step 6: Generate Custom-Branded Report for Client C**
- **User Action:** Clicks "Export PDF" → Selects "Weekly Status Report" template
- **System Response:**
  - Shows branding options (Pro feature):
    - Company Logo: [Upload] (auto-loads Client C's logo if previously uploaded)
    - Header Text: "Fintech Dashboard - QA Status Week 45"
    - Footer: "Prepared by Franco Martínez Consulting"
  - Generates PDF with Client C branding in 4 seconds
- **Pain Point:**
  - ⚠️ If branding settings are global (not per-project), Client A's logo appears in Client C report
  - ⚠️ If logo upload size limit is too small (1MB), high-res logos are rejected

**Step 7: Export Report & Verify Quality**
- **User Action:** Opens generated PDF: `Client-C_Weekly-Status_Week45.pdf`
- **System Response:**
  - PDF displays:
    - Client C logo in header
    - Executive summary: "18/20 Test Cases Passed (90% success rate)"
    - Detailed breakdown by feature area
    - Franco's company name in footer
- **Pain Point:**
  - ⚠️ If PDF footer shows "Generated by QAssist" instead of Franco's branding, looks less professional
  - ⚠️ If chart formatting is off (overlapping text), report looks unprofessional

**Step 8: Archive Completed Client D Project**
- **User Action:** Switches to Client D project, clicks "Project Settings" → "Archive Project"
- **System Response:**
  - Shows confirmation modal: "Archive 'Client D - CRM Integration'?"
  - Explains: "Project will be hidden from active list. Data remains in local folder for export."
  - Options: "Archive" / "Archive + Export ZIP" / "Cancel"
- **Pain Point:**
  - ⚠️ If archive permanently deletes data from cloud, Franco loses client history
  - ⚠️ If there's no clear way to unarchive later, risky to archive

**Step 9: Export Complete Project as ZIP**
- **User Action:** Selects "Archive + Export ZIP"
- **System Response:**
  - Generates ZIP file containing:
    - All Test Cases (HTML + PDF exports)
    - All evidence (screenshots, videos)
    - Project metadata (Jira mapping, sprint info)
    - README.txt with folder structure explanation
  - Downloads: `Client-D_CRM-Integration_Complete_2025-11-02.zip` (234MB)
- **Pain Point:**
  - ⚠️ If ZIP export takes >2 minutes (large project), no progress indicator
  - ⚠️ If ZIP is corrupted (export interrupted), Franco loses access to client history

**Step 10: Verify Data Ownership**
- **User Action:** Extracts ZIP to external hard drive, opens README.txt
- **System Response:**
  - README explains folder structure:
    ```
    Client-D_CRM-Integration/
    ├── Sprints/
    │   ├── Sprint-10/
    │   │   ├── US-234/
    │   │   │   ├── TC-001.html
    │   │   │   ├── TC-001.pdf
    │   │   │   └── evidence/
    │   └── Sprint-11/
    ├── Reports/
    │   └── Final-Summary.pdf
    └── README.txt
    ```
  - All files are human-readable (HTML, PDF, images - no proprietary formats)
- **Pain Point:**
  - ⚠️ If files are in proprietary format (requires QAssist to open), Franco can't access after unsubscribing
  - ⚠️ If folder structure is messy (flat directory with 500 files), hard to navigate

**Step 11: Return to Client A to Finish Sprint Testing**
- **User Action:** Presses ⌘K, types "Ecommerce", presses Enter
- **System Response:**
  - Switches back to Client A
  - Restores exact state: Same Test Case open, same scroll position
  - Shows notification: "3 new Jira updates synced while you were away"
- **Pain Point:**
  - ⚠️ If state is not preserved (opens to homepage instead of previous view), loses context
  - ⚠️ If sync conflicts occurred while working on other clients, confusing to resolve

**Step 12: Review Weekly Time Saved Across All Clients**
- **User Action:** Opens "Analytics" → "Weekly Summary"
- **System Response:**
  - Shows aggregated stats:
    - Total Test Cases created: 47 (across 4 clients)
    - Time saved: 8.5 hours (vs. manual workflow)
    - Most productive day: Tuesday (14 Test Cases)
    - Most-used feature: Jira sync (124 times)
  - Displays per-project breakdown chart
- **Pain Point:**
  - ⚠️ If analytics are inaccurate (doesn't track offline work), misleading data
  - ⚠️ If no way to export analytics (Franco wants to show ROI to future clients), feature less useful

---

### Expected Outcome
✅ **Success State:**
- Franco managed 4 client projects in 3 hours without confusion
- Switched contexts seamlessly using keyboard shortcuts (avg. 2 seconds per switch)
- Generated custom-branded report for Client C that looks professional
- Archived Client D project with full data export for permanent records
- Verified data ownership - all files accessible without QAssist dependency
- Saved 8.5 hours this week compared to old workflow (Excel + manual Jira updates)

📊 **Power User Workflow Metrics Target:**
- Project switching time: <3 seconds average
- Context preservation: 100% (state fully restored after switch)
- Data portability: All exports in open formats (HTML, PDF, images)
- Time saved per client: 2+ hours/week (8+ hours total across 4 clients)

---

### Alternative Paths / Edge Cases

**Alt Path 1: Client Jira Connection Expires (OAuth Token Refresh)**
- **Step 11 Modified:** When switching back to Client A, Jira sync fails (token expired)
- **System Response:**
  - Shows banner: "Jira connection expired for Client A. Reconnect?"
  - One-click "Reconnect" button (re-initiates OAuth flow)
  - Other clients (B, C, D) unaffected (separate OAuth tokens)
- **Recovery:** Franco clicks "Reconnect", OAuth completes in 15 seconds, sync resumes

**Edge Case 1: Duplicate Project Names (Client Confusion)**
- **Step 1 Modified:** Franco has 2 projects named "Dashboard Testing" (different clients)
- **System Response:**
  - Project switcher shows:
    - Dashboard Testing (Client B - Healthcare)
    - Dashboard Testing (Client E - Retail)
  - Displays Jira instance domain as subtitle for clarity
- **Recovery:** Franco identifies correct project by Jira domain, renames to avoid future confusion

**Edge Case 2: Storage Limit Hit Across All Projects**
- **Step 9 Modified:** Franco tries to export Client D ZIP but has 9.8GB used (10GB Pro limit)
- **System Response:**
  - Shows error: "Not enough storage for export. Need 500MB, only 200MB available."
  - Offers: "Delete archived evidence" / "Upgrade storage" / "Export without videos"
- **Recovery:** Franco selects "Export without videos", completes in 20 seconds, manually copies videos later

**Edge Case 3: Template Imported from Another Project**
- **Step 4 Modified:** Franco wants to reuse Client A's "Smoke Test" template in Client B
- **System Response:**
  - Shows "Import Template" option in template dropdown
  - Lists templates from other projects with "From: Client A" label
  - Confirms: "Copy 'Smoke Test' template to Client B?"
- **Recovery:** Franco imports template, customizes for Client B, saves as "Healthcare Smoke Test"

**Edge Case 4: Corrupted ZIP Export (Network Interruption)**
- **Step 9 Modified:** ZIP export interrupted at 60% due to network issue
- **System Response:**
  - Shows error: "Export failed. Retry?"
  - Displays partial file path: `~/Downloads/Client-D_incomplete.zip`
  - Offers "Retry" or "Export to local folder only (skip cloud backup)"
- **Recovery:** Franco selects "Export to local folder only", completes in 30 seconds from local cache

**Edge Case 5: Client Requests Data Deletion (GDPR)**
- **Scenario:** Client C terminates contract, requests all data be deleted
- **User Action:** Franco opens Client C project settings → "Delete Project Permanently"
- **System Response:**
  - Shows warning: "This will delete all Test Cases, evidence, and cloud backups. Local ZIP exports will remain."
  - Requires typing "DELETE Client C" to confirm
  - Sends confirmation email after deletion completes
- **Outcome:** Cloud data deleted, Franco retains local ZIP export for records (compliant with GDPR)

---

## Journey Summary & Design Implications

### Cross-Journey Insights

**Critical Success Factors:**
1. **Onboarding must be <10 minutes** - Users abandon if setup is complex
2. **Jira sync is make-or-break feature** - 70%+ of users must successfully connect Jira
3. **Context switching must be instant** - Power users (Franco) switch projects 20+ times/day
4. **Data ownership must be transparent** - All exports in open formats (no vendor lock-in)
5. **Offline mode must be bulletproof** - Auto-save must never lose data

**Top Pain Points to Address:**
1. **Sync conflicts** - Need clear, non-technical resolution UI
2. **Storage limits** - Free tier 500MB might be too restrictive, users hit limit in 1-2 weeks
3. **Template management** - Global vs. per-project templates must be clear
4. **PDF export quality** - Formatting must be perfect (stakeholders judge quality by reports)
5. **Error messages** - Must be actionable (not "Error 500", but "Jira connection lost. Reconnect?")

**Feature Priorities Based on Journeys:**
| Priority | Feature | Reason |
|----------|---------|--------|
| P0 | Jira OAuth + Sync | 100% of journeys depend on this |
| P0 | Auto-save + Offline Mode | Data loss is unacceptable |
| P0 | Test Case Editor + Evidence | Core daily workflow |
| P1 | PDF Export | Required for stakeholder communication |
| P1 | Project Switching | Essential for power users (Franco) |
| P2 | Analytics Dashboard | Nice-to-have, but not MVP blocker |

**UX/UI Design Decisions:**
1. **Keyboard shortcuts mandatory** - Power users (Franco) need ⌘K quick switcher
2. **Progress indicators everywhere** - Sync, upload, export must show progress
3. **Undo/Redo support** - Accidental status changes, deletions must be recoverable
4. **Clear visual hierarchy** - Project switcher must be prominent (not hidden in menu)
5. **Subtle notifications** - Toast messages for sync success, banners for errors

**Testing Focus Areas:**
1. Large Jira imports (500+ stories) - Must handle gracefully
2. Network interruption during sync - Must recover without data loss
3. Storage limit edge cases - Must prompt before rejecting uploads
4. PDF export with 100+ images - Must optimize file size
5. Multi-project context switching - Must preserve state perfectly
