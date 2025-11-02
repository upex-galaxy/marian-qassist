# QAssist - Business Model Canvas (MVP)

## Problem Statement

QA Engineers face a critical pain point of tool fragmentation and productivity loss. On a typical day, an individual QA alternates between 5-8 different tools (Jira, Excel/Google Sheets, local folders, text editors, data generators), losing between 45-90 minutes daily solely on context switching, searching for previous information, and manual documentation reorganization. This "context switching tax" represents approximately 15-25% of their productive workday.

The second pain point is the disconnect between Jira (designed for project management) and the real needs of individual testing workflows. Jira excels at ticket tracking and team-level collaboration, but lacks features specific to personal QA work: professional visual structuring of Test Cases, efficient local evidence management, automated test dataset generation, and offline access to historical documentation. QAs end up duplicating information: they create Test Cases in Jira for Product/Dev visibility, but maintain more detailed versions in Excel or Google Docs for their own use.

Additionally, there's an ownership and portability problem. When a QA changes projects or companies, they lose access to all their historical work stored in corporate Jira. There's no structured "personal archive" of their professional testing experience, forcing them to rebuild knowledge and reinvent solutions to already-solved problems. This lack of continuity affects both their efficiency and professional development.

---

## Business Model Canvas

### 1. Customer Segments

**Primary Segment: Individual QA Engineers (Mid-Level)**
- **Profile:** QA Engineers with 1-5 years of experience in software companies (startups to mid-size companies)
- **Size:** ~350,000 active QA professionals in English-speaking markets (US, UK, Canada, EU, India)
- **Tech Stack:** Active Jira users, familiar with manual testing and basic automation
- **Budget Authority:** Individual purchase decision for tools <$20/month (no management approval required)
- **Pain Intensity:** High - lose 3-6 hours/week on organizational and repetitive tasks

**Secondary Segment (Post-MVP):**
- Freelance QAs working with multiple clients simultaneously
- QA Leads who need to organize their individual work in addition to coordinating teams

### 2. Value Propositions

**Core Value: "Reclaim 5 hours/week focusing on testing, not organization"**

**Functional Benefits:**
- **Jira Bidirectional Sync:** Import User Stories with 1-click, update statuses automatically (saves 30min/day vs. manual copy-paste)
- **Test Case Studio:** HTML editor with professional templates, automatic numbering, pre-formatted decision tables (saves 20min/day vs. manual Excel formatting)
- **Evidence Manager:** Drag-and-drop screenshots/videos with automatic organization by Sprint/US (saves 15min/day vs. manual folders)
- **Auto-Save Local First:** Everything automatically saved in structured folders on your PC (Sprint → User Story → Test Cases/Evidence)
- **Smart Tools:** Test dataset generator, auto-fill decision tables, reusable templates

**Emotional Benefits:**
- **Control:** "My work is on MY computer, not just in corporate Jira"
- **Professionalism:** Polished PDF exports that impress stakeholders
- **Peace of Mind:** Functional offline mode, no constant connection dependency

**Differentiation vs. Competition:**
- **vs. Jira:** We don't replace, we complement - workflow optimized for individual QAs, not PMs
- **vs. TestRail/Zephyr:** 80% lighter, setup in <5min vs. hours, individual pricing vs. enterprise licenses ($500-1000/year)
- **vs. Excel/Notion:** Native Jira integration, testing-specific tools (not generic)

### 3. Channels

**MVP (Validation Phase - Months 1-6):**
1. **Direct Outreach:** LinkedIn targeted campaigns to QA Engineers (groups: "QA Testing", "Software Testing Professionals")
2. **Content Marketing:**
   - Technical blog posts on Medium/Dev.to ("How I organized 150 Test Cases in Jira without losing my mind")
   - YouTube tutorials (5-10min screencasts showing complete workflow)
3. **Community Engagement:**
   - Participation in subreddits (r/QualityAssurance, r/softwaretesting)
   - Answers on StackOverflow/Quora about "best QA organization tools"
4. **Product Hunt Launch:** Targeting tech-savvy early adopters

**Post-Validation (Months 7-12):**
5. **Referral Program:** 20% discount for each referred QA (virality within teams)
6. **Atlassian Marketplace:** Listing as Jira complementary app (requires demand validation first)

### 4. Customer Relationships

**MVP Approach: High-Touch, Personal, Community-Driven**

- **Personalized Onboarding:** Email sequence (Day 1: Welcome + Quick Start Guide, Day 3: "How's your first Jira sync going?", Day 7: Tips & Tricks)
- **Direct Support:** Email support with <24h response (founder-driven in MVP)
- **Feedback Loop:** In-app feedback widget, bi-weekly surveys to active users, 1-on-1 calls with early adopters
- **Community Building:** Exclusive Discord/Slack channel for users (peer-to-peer help, feature requests, share templates)
- **Transparency:** Public roadmap (Trello/GitHub Projects), visible changelog, vote on upcoming features

**Retention Strategy:**
- **Engagement Metrics:** Weekly email with "Your weekly summary: 12 Test Cases created, 3h saved"
- **Habit Formation:** Subtle reminders to sync Jira, export PDFs at end of sprint
- **Data Lock-In (Benign):** The more Test Cases/evidence they accumulate locally, the more valuable the workspace becomes

### 5. Revenue Streams

**MVP Pricing Model: Freemium Individual Subscription**

**Free Tier (Forever):**
- 1 active project
- 50 total Test Cases
- Manual Jira sync (1x/day)
- Evidence storage: 500MB
- PDF exports with watermark
- **Goal:** User acquisition, product-market fit validation, feedback loop

**Pro Tier - $12/month (or $120/year - 17% discount):**
- Unlimited projects
- Unlimited Test Cases
- Automatic Jira sync (real-time)
- Evidence storage: 10GB
- PDF exports without watermark + custom branding
- Priority support
- Advanced tools: Dataset generator with custom schemas, AI-assisted test case suggestions (phase 2)
- **Target Conversion Rate:** 8-12% Free → Pro (benchmark for B2C dev tools)

**Revenue Projections (Conservative - Year 1):**
- Month 6 (Post-Launch): 200 Free users → 16 Pro subs = $192 MRR
- Month 12: 1,000 Free users → 100 Pro subs = $1,200 MRR
- **Year 1 Goal:** $1,500-2,000 MRR ($18-24K ARR) to validate viability

**Future Revenue Streams (Post-MVP):**
- Team Plan ($8/user/month for teams of 5+)
- One-time purchases (Premium Template Packs: $15-25)
- Affiliate commissions (refer testing courses, complementary tools)

### 6. Key Resources

**MVP Critical Resources:**

**Intellectual:**
- **Proprietary Codebase:** Electron app (offline-first), Jira API integration module, local file sync engine
- **User Workflows Research:** Interviews with 15-20 QAs, daily workflow mapping, pain point documentation

**Human:**
- **Founder (Full-Stack Developer):** 30h/week - core feature development + customer support
- **Beta Testers/Advisors:** 10-15 active QAs willing to give weekly feedback

**Physical/Digital:**
- **Development Tools:** GitHub (code hosting), Electron framework, VS Code
- **Cloud Infrastructure:** AWS S3 (optional evidence backups), Supabase/Firebase (user auth + cloud sync)
- **Design Assets:** Figma designs, component library, marketing materials

**Financial:**
- **Bootstrap Capital:** $3,000-5,000 to cover 6-12 months of infra + minimal marketing
- **Time Investment:** 6-9 months of part-time development before first revenue

### 7. Key Activities

**MVP Development & Validation (High Priority):**

1. **Core Product Development (60% time):**
   - Build Jira bidirectional sync (API OAuth integration)
   - Develop Test Case editor (HTML rich text, templates)
   - Implement local file organization system (auto-save, folder structure)
   - Create evidence attachment module (drag-drop, thumbnails)
   - Build PDF export engine (professional formatting)

2. **Customer Discovery & Validation (20% time):**
   - Conduct 20-30 QA interviews (understand workflows, validate pain points)
   - Run beta program (15-20 users, weekly feedback sessions)
   - Analyze usage metrics (feature adoption, churn triggers, engagement patterns)

3. **Marketing & Distribution (15% time):**
   - Create educational content (blog posts, YouTube tutorials)
   - Engage in QA communities (Reddit, LinkedIn, Discord)
   - Build landing page + email capture (measure conversion rates)

4. **Customer Support & Iteration (5% time):**
   - Respond to user questions/bugs (<24h response time)
   - Monthly feature releases based on feedback
   - Maintain documentation (getting started guides, FAQs)

### 8. Key Partners

**MVP Strategic Partners:**

**Technology Partners:**
- **Atlassian (Jira):** API access partner (critical dependency - contingency: also support Azure DevOps, Linear)
- **Electron Community:** Open-source framework for desktop app development
- **Payment Processor:** Stripe (handles subscriptions, PCI compliance)

**Distribution Partners:**
- **Testing Communities:** Moderators/influencers in r/QualityAssurance, Ministry of Testing community
- **QA Educators:** Instructors on Udemy/Pluralsight (potential affiliates - "my students use QAssist")

**Validation Partners:**
- **Beta Testing Companies:** 2-3 small software companies willing to pilot with their QA teams
- **QA Freelancers:** 5-10 consultants testing with real clients

**Future Partners (Post-MVP):**
- Test automation tool providers (Selenium, Cypress) - integrations
- Cloud storage providers (Dropbox, Google Drive) - optional evidence sync

### 9. Cost Structure

**MVP Cost Breakdown (Monthly - First 12 Months):**

**Fixed Costs:**
- **Development Tools/Infra:** $50/month
  - GitHub Pro: $4
  - Cloud hosting (Supabase/Firebase): $25
  - Domain + SSL: $3
  - CDN/Assets hosting: $10
  - Email service (SendGrid): $8

- **Software/Subscriptions:** $30/month
  - Design tools (Figma): $12
  - Analytics (Mixpanel/Amplitude free tier): $0
  - Customer support (Discord/Plain free tier): $0
  - Project management (Linear/Notion free tier): $0

**Variable Costs (Scale with Users):**
- **Cloud Storage:** $0.023/GB/month (AWS S3) → $5-20/month for 200-1000 users with 500MB average
- **Payment Processing:** 2.9% + $0.30 per transaction (Stripe) → ~$0.65 per $12 subscription

**Marketing Costs (MVP Phase):**
- **Content Creation:** $100/month (freelance writers/editors if needed, otherwise $0 DIY)
- **Paid Ads (Experimental):** $50-100/month (LinkedIn, Reddit ads for testing)

**Total MVP Monthly Costs:** ~$200-300/month

**One-Time Costs (Pre-Launch):**
- **Brand/Design:** $300-500 (logo, landing page design)
- **Legal Setup:** $200-400 (LLC registration, Terms of Service/Privacy Policy templates)

**Break-Even Point:** ~20-25 Pro subscribers ($240-300 MRR)

**Cost Structure Philosophy:**
- **Capital-Efficient:** Bootstrap-friendly, avoid heavy infra costs until proven demand
- **Free-First Tools:** Maximize use of free tiers (Firebase, Supabase, Vercel)
- **Time over Money:** Founder time investment >> cash burn (sweat equity)
- **Scale Economics:** Marginal cost per user <$0.50/month (mostly storage), healthy unit economics

---

## MVP Hypothesis (Critical Assumptions to Validate)

### Hypothesis 1: Pain Point Validation
**"QA Engineers will dedicate 30+ minutes to setup and learn a new tool if it demonstrably saves them 5+ hours/week"**

**Validation Metrics:**
- ≥60% of beta testers complete full onboarding (Jira connection + first Test Case created)
- ≥40% use the app 3+ days/week after 2 weeks of trial
- Net Promoter Score (NPS) ≥40 within first month of use

**Validation Methods:**
- Track onboarding completion rates via analytics
- Weekly usage logs (active days/week, features used)
- Post-trial survey: "How much time did QAssist save you this week?" (target: ≥50% report >3h saved)

**Invalidation Trigger:** If <30% complete onboarding or <20% use weekly, pain point isn't strong enough or solution is too complex

---

### Hypothesis 2: Jira Complementarity (Not Replacement)
**"QAs will adopt a Jira-complementary tool that syncs bidirectionally rather than demanding they abandon Jira entirely"**

**Validation Metrics:**
- ≥70% of users enable Jira sync (vs. using QAssist standalone)
- ≥50% sync at least 2x/week
- Feature usage: Jira sync ranks in Top 3 most-used features

**Validation Methods:**
- Analytics: % users with active Jira integration
- Qualitative interviews: "How does QAssist fit into your Jira workflow?"
- A/B test messaging: "Jira companion" vs. "Jira alternative" (measure conversion)

**Invalidation Trigger:** If users prefer standalone mode or request "replace Jira entirely," pivot to different positioning or add more Jira-independent features

---

### Hypothesis 3: Willingness to Pay (Individual Budget)
**"8-12% of engaged free users will convert to $12/month Pro plan after experiencing time savings and hitting free tier limits"**

**Validation Metrics:**
- Free-to-Pro conversion rate ≥8% after 30 days of active use (benchmark: industry avg for dev tools B2C is 5-10%)
- Average time-to-conversion: ≤45 days
- Churn rate <10%/month for Pro users (indicates pricing matches perceived value)

**Validation Methods:**
- Funnel analysis: Free signup → Active use (3+ days/week) → Hit limit (50 Test Cases or manual sync friction) → Upgrade
- Exit surveys for non-converters: "What would make you upgrade?"
- Price sensitivity test: Offer 20% discount to subset, measure elasticity

**Invalidation Trigger:** If conversion <4% after 3 months or churn >15%/month, pricing is too high, free tier too generous, or Pro features insufficiently compelling

---

**Success Definition for MVP:**
All 3 hypotheses validated within 6 months post-launch → Proceed to scale and team plan development

**Pivot Signals:**
- If Hypothesis 1 fails → Simplify UX, reduce onboarding friction, or revalidate if pain point is real
- If Hypothesis 2 fails → Consider pivoting to Jira alternative (higher competition) or focus on non-Jira workflows
- If Hypothesis 3 fails → Adjust pricing ($8/month?), enhance Pro features, or explore alternative monetization (sponsorships, affiliate)
