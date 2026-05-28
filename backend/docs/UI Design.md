# File Index

## Configuration Files

1. `package.json` - NPM dependencies and scripts
2. `tailwind.config.js` - Tailwind CSS configuration with custom theme
3. `angular.json` - Angular CLI configuration
4. `tsconfig.json` - TypeScript compiler configuration
5. `src/environments/environment.ts` - Development environment variables
6. `src/environments/environment.production.ts` - Production environment variables

## Core Module Files

7. `src/app/core/models/api-response.model.ts` - API response type definitions
8. `src/app/core/services/api.service.ts` - HTTP API wrapper service
9. `src/app/core/services/auth.service.ts` - Clerk authentication service
10. `src/app/core/services/storage.service.ts` - LocalStorage wrapper service
11. `src/app/core/services/toast.service.ts` - Toast notification service
12. `src/app/core/interceptors/auth.interceptor.ts` - JWT token HTTP interceptor
13. `src/app/core/interceptors/error.interceptor.ts` - Global error handler interceptor
14. `src/app/core/guards/auth.guard.ts` - Route authentication guard
15. `src/app/core/core.module.ts` - Core module declaration

## Shared UI Components

16. `src/app/shared/components/ui/button/button.component.ts` - Reusable button component
17. `src/app/shared/components/ui/button/button.component.html` - Button template
18. `src/app/shared/components/ui/card/card.component.ts` - Card container component
19. `src/app/shared/components/ui/card/card.component.html` - Card template
20. `src/app/shared/components/ui/modal/modal.component.ts` - Modal dialog component
21. `src/app/shared/components/ui/modal/modal.component.html` - Modal template
22. `src/app/shared/shared.module.ts` - Shared module declaration

## Feature: Workspace

23. `src/app/features/workspace/models/workspace.model.ts` - Workspace type definitions
24. `src/app/features/workspace/services/workspace.service.ts` - Workspace API service
25. `src/app/features/workspace/components/workspace-list/workspace-list.component.ts` - Workspace list page
26. `src/app/features/workspace/components/workspace-list/workspace-list.component.html` - Workspace list template
27. `src/app/features/workspace/workspace-routing.module.ts` - Workspace routing configuration
28. `src/app/features/workspace/workspace.module.ts` - Workspace feature module

## Main App Files

29. `src/app/app-routing.module.ts` - Root routing configuration with lazy loading
30. `src/app/app.module.ts` - Root module declaration
31. `src/app/app.component.ts` - Root component
32. `src/app/app.component.html` - Root component template
33. `src/styles.css` - Global Tailwind CSS styles

---

# UI.md - Frontend UI Structure

# Skillmark Frontend UI Documentation

Version: 1.0  
Last Updated: 2024  
Framework: Angular 17 + Tailwind CSS

---

## Table of Contents

1. [Layout Structure](#layout-structure)
2. [Authentication Pages](#authentication-pages)
3. [Dashboard Pages](#dashboard-pages)
4. [Workspace Pages](#workspace-pages)
5. [Workshop Pages](#workshop-pages)
6. [Assessment Pages](#assessment-pages)
7. [Submission Pages](#submission-pages)
8. [Certificate Pages](#certificate-pages)
9. [Public Pages](#public-pages)
10. [Shared Components](#shared-components)

---

## Layout Structure

### Main Layout Component

**Route:** Used by all authenticated pages  
**Location:** `src/app/shared/components/layout/main-layout/main-layout.component.html`

**Structure:**
```
┌────────────────────────────────────────┐
│           Navbar (fixed top)           │
├─────────┬──────────────────────────────┤
│         │                              │
│ Sidebar │   Main Content Area          │
│ (fixed) │   (router-outlet)            │
│         │                              │
│         │                              │
│         │                              │
├─────────┴──────────────────────────────┤
│           Footer (optional)            │
└────────────────────────────────────────┘
```

**Components:**
- Navbar (app-navbar)
- Sidebar (app-sidebar)
- Main content area with router outlet
- Footer (app-footer)

**Navbar Contents:**
- Logo (left)
- Search bar (center) - for later phase
- User profile dropdown (right)
  - View Profile
  - Settings
  - Sign Out

**Sidebar Contents:**
- Dashboard link
- My Workspaces link
- My Workshops link
- My Certificates link
- Analytics (if admin/instructor)

---

## Authentication Pages

### Sign In Page

**Route:** `/auth/sign-in`  
**Location:** `src/app/features/auth/components/sign-in/sign-in.component.html`  
**Layout:** Centered, no sidebar

**Structure:**
- Full-screen centered card
- Skillmark logo at top
- Heading: "Sign in to your account"
- Clerk sign-in component embedded
- Link to sign up page at bottom

**Components Used:**
- app-card
- Clerk SignIn component

**User Actions:**
- Enter email and password (handled by Clerk)
- Click "Sign In" (handled by Clerk)
- Click "Forgot password?" (handled by Clerk)
- Click "Don't have an account? Sign up"

---

### Sign Up Page

**Route:** `/auth/sign-up`  
**Location:** `src/app/features/auth/components/sign-up/sign-up.component.html`  
**Layout:** Centered, no sidebar

**Structure:**
- Full-screen centered card
- Skillmark logo at top
- Heading: "Create your account"
- Clerk sign-up component embedded
- Link to sign in page at bottom

**Components Used:**
- app-card
- Clerk SignUp component

**User Actions:**
- Enter email, password, name (handled by Clerk)
- Click "Sign Up" (handled by Clerk)
- Verify email (handled by Clerk)
- Click "Already have an account? Sign in"

---

## Dashboard Pages

### Dashboard Home

**Route:** `/dashboard`  
**Location:** `src/app/features/dashboard/components/dashboard-home/dashboard-home.component.html`  
**Layout:** Main layout with sidebar

**Structure:**
- Page header
  - Heading: "Dashboard"
  - Subheading: "Welcome back, [User Name]"
- Stats cards row (4 cards)
  - Total Workspaces
  - Active Workshops
  - Certificates Earned
  - Enrollments
- Two-column layout below
  - Left: Recent Workshops (list)
  - Right: Recent Activity (timeline)

**Components Used:**
- app-card
- app-stats-card (custom)
- app-badge
- app-empty-state (if no data)

**User Actions:**
- Click on workspace card → Navigate to workspace
- Click on workshop card → Navigate to workshop
- Click "View All Workspaces" button

---

## Workspace Pages

### Workspace List Page

**Route:** `/workspaces`  
**Location:** `src/app/features/workspace/components/workspace-list/workspace-list.component.html`  
**Layout:** Main layout with sidebar

**Structure:**
- Page header
  - Left: Heading "My Workspaces" and description
  - Right: "Create Workspace" button (primary)
- Loading state: centered spinner
- Empty state: 
  - Illustration
  - Message: "No workspaces yet"
  - "Create Workspace" button
- Grid layout (3 columns on desktop)
  - Workspace cards

**Workspace Card Contents:**
- Workspace logo or initial
- Workspace name
- Role badge (ADMIN/INSTRUCTOR/MEMBER)
- Description (2 lines max, truncated)
- Footer stats:
  - Members count
  - Workshops count

**Components Used:**
- app-button
- app-card
- app-badge
- app-spinner (loading)
- app-empty-state (no workspaces)

**User Actions:**
- Click "Create Workspace" → Navigate to create page
- Click workspace card → Navigate to workspace detail

---

### Create Workspace Page

**Route:** `/workspaces/create`  
**Location:** `src/app/features/workspace/components/workspace-create/workspace-create.component.html`  
**Layout:** Main layout with sidebar

**Structure:**
- Page header
  - Heading: "Create Workspace"
  - Breadcrumb: Workspaces > Create
- Main card container
  - Form section
    - Workspace Name input (required)
    - Slug input (auto-generated, editable)
    - Description textarea (optional)
    - Logo upload component (optional)
  - Preview section (right side or below on mobile)
    - Shows how workspace card will look
  - Action buttons at bottom
    - "Cancel" button (secondary, left)
    - "Create Workspace" button (primary, right)

**Components Used:**
- app-card
- app-input
- app-textarea
- app-file-upload
- app-button

**User Actions:**
- Type workspace name → slug auto-generates
- Edit slug manually
- Type description
- Upload logo image
- Click "Create Workspace" → API call → Navigate to workspace detail
- Click "Cancel" → Navigate back to workspace list

**Validation:**
- Name: required, 3-100 characters
- Slug: required, 3-50 characters, lowercase, alphanumeric + hyphens
- Description: max 1000 characters
- Logo: max 2MB, image formats only

---

### Workspace Detail Page

**Route:** `/workspaces/:id`  
**Location:** `src/app/features/workspace/components/workspace-detail/workspace-detail.component.html`  
**Layout:** Main layout with sidebar

**Structure:**
- Workspace header section
  - Logo and name (large)
  - Description
  - Role badge
  - Action buttons (right):
    - "Settings" button (if ADMIN)
    - "Invite Members" button (if ADMIN/INSTRUCTOR)
- Tabs navigation
  - Overview (default)
  - Workshops
  - Members
  - Analytics (if ADMIN/INSTRUCTOR)
- Tab content area (router-outlet for sub-routes)

**Overview Tab Contents:**
- Stats row (4 cards):
  - Total Members
  - Total Workshops
  - Active Workshops
  - Certificates Issued
- Recent workshops list
- Recent members list

**Workshops Tab Contents:**
- Header with "Create Workshop" button (if ADMIN/INSTRUCTOR)
- Workshop grid (same as workshop list)
- Empty state if no workshops

**Members Tab Contents:**
- Header with "Add Member" button (if ADMIN/INSTRUCTOR)
- Members table:
  - Avatar
  - Name
  - Email
  - Role
  - Joined date
  - Actions (remove, change role - if ADMIN)

**Analytics Tab Contents:**
- Charts and statistics
- Enrollment trends
- Completion rates
- Certificate distribution

**Components Used:**
- app-card
- app-badge
- app-button
- app-tabs (custom)
- app-stats-card
- app-table (custom)

**User Actions:**
- Click "Settings" → Navigate to workspace edit
- Click "Invite Members" → Open invite modal
- Switch tabs → Change content
- Click workshop card → Navigate to workshop detail
- Click "Create Workshop" → Navigate to workshop create

---

### Workspace Settings Page

**Route:** `/workspaces/:id/edit`  
**Location:** `src/app/features/workspace/components/workspace-edit/workspace-edit.component.html`  
**Layout:** Main layout with sidebar

**Structure:**
- Page header
  - Heading: "Workspace Settings"
  - Breadcrumb: Workspaces > [Workspace Name] > Settings
- Settings card
  - Form sections:
    - General Information
      - Name input
      - Slug input
      - Description textarea
      - Logo upload
    - Danger Zone (at bottom, red border)
      - Delete workspace section
      - Warning message
      - "Delete Workspace" button (danger)
  - Action buttons
    - "Cancel" (secondary)
    - "Save Changes" (primary)

**Components Used:**
- app-card
- app-input
- app-textarea
- app-file-upload
- app-button
- app-confirmation-dialog

**User Actions:**
- Edit workspace details
- Click "Save Changes" → API call → Show success toast → Navigate back
- Click "Delete Workspace" → Show confirmation dialog → API call → Navigate to workspace list
- Click "Cancel" → Navigate back

---

## Workshop Pages

### Workshop List Page (within workspace)

**Route:** `/workspaces/:workspaceId/workshops`  
**Location:** `src/app/features/workshop/components/workshop-list/workshop-list.component.html`  
**Layout:** Main layout with sidebar

**Structure:**
- Page header
  - Left: Heading "Workshops" and description
  - Right: "Create Workshop" button (if ADMIN/INSTRUCTOR)
- Filter/Sort bar
  - Status filter dropdown (All, Published, Draft, Archived)
  - Sort dropdown (Newest, Oldest, Name A-Z)
  - Search input
- Grid layout (3 columns)
  - Workshop cards

**Workshop Card Contents:**
- Cover image or placeholder
- Status badge (Published/Draft/Archived)
- Title
- Description (2 lines, truncated)
- Start date
- Footer stats:
  - Enrolled count
  - Resources count
  - Assessments count
- Quick actions (if owner):
  - Edit icon
  - Archive icon

**Components Used:**
- app-button
- app-card
- app-badge
- app-dropdown
- app-input (search)
- app-empty-state

**User Actions:**
- Click "Create Workshop" → Navigate to create page
- Filter by status
- Sort workshops
- Search workshops
- Click workshop card → Navigate to workshop detail
- Click edit icon → Navigate to workshop edit
- Click archive icon → Show confirmation → API call

---

### Create Workshop Page

**Route:** `/workspaces/:workspaceId/workshops/create`  
**Location:** `src/app/features/workshop/components/workshop-create/workshop-create.component.html`  
**Layout:** Main layout with sidebar

**Structure:**
- Page header
  - Heading: "Create Workshop"
  - Breadcrumb
- Stepper/Progress indicator
  - Step 1: Basic Info (active)
  - Step 2: Resources
  - Step 3: Assessment
  - Step 4: Publish
- Form card (changes per step)
  - Step 1 fields:
    - Title input (required)
    - Description textarea (required)
    - Cover image upload (optional)
    - Start date picker (optional)
    - End date picker (optional)
  - Navigation buttons
    - "Cancel" (left)
    - "Save as Draft" (secondary)
    - "Next" (primary)

**Components Used:**
- app-card
- app-input
- app-textarea
- app-file-upload
- app-button
- app-stepper (custom)
- Date picker component

**User Actions:**
- Fill workshop details
- Upload cover image
- Select dates
- Click "Next" → Move to resources step
- Click "Save as Draft" → API call → Navigate to workshop detail
- Click "Cancel" → Show confirmation if dirty → Navigate back

---

### Workshop Detail Page

**Route:** `/workshops/:id`  
**Location:** `src/app/features/workshop/components/workshop-detail/workshop-detail.component.html`  
**Layout:** Main layout with sidebar

**Structure:**
- Workshop hero section
  - Cover image background (with overlay)
  - Title (large, white text)
  - Description
  - Status badge
  - Dates
  - Enrolled badge ("You're enrolled" or "Enroll" button)
  - Action buttons (if owner):
    - Edit
    - Publish/Archive
    - Generate Invite
- Tabs navigation
  - Overview (default)
  - Resources
  - Assessments
  - Participants (if owner)
- Tab content area

**Overview Tab:**
- About section (full description)
- Stats cards row
- Upcoming assessments list

**Resources Tab:**
- Header with "Add Resource" button (if owner)
- Resource list items:
  - Icon (based on type: PDF, Link, Video, etc.)
  - Title
  - Description
  - File size (if file)
  - Download/View button
  - Edit/Delete buttons (if owner)
- Empty state if no resources

**Assessments Tab:**
- Assessment cards:
  - Title
  - Description
  - Passing score badge
  - Duration badge
  - Status (Published/Draft)
  - Your best score (if participant)
  - Attempts used / max attempts
  - "Start Assessment" button (if can attempt)
  - "View Results" button (if completed)
  - Edit button (if owner)

**Participants Tab (owner only):**
- Stats row
- Participants table:
  - Avatar
  - Name
  - Email
  - Enrolled date
  - Progress (assessments completed)
  - Best score
  - Certificate status

**Components Used:**
- app-card
- app-badge
- app-button
- app-tabs
- app-table
- app-stats-card
- app-resource-item (custom)
- app-assessment-card (custom)

**User Actions:**
- Click "Enroll" → Enroll in workshop
- Click resource → Download/view
- Click "Start Assessment" → Navigate to take assessment
- Click "Add Resource" → Open create resource modal
- Click "Generate Invite" → Open invite modal with code

---

### Workshop Edit Page

**Route:** `/workshops/:id/edit`  
**Location:** `src/app/features/workshop/components/workshop-edit/workshop-edit.component.html`  
**Layout:** Main layout with sidebar

**Structure:**
- Same as create workshop page but:
  - Pre-filled with existing data
  - Heading: "Edit Workshop"
  - All steps accessible (no forced progression)
  - Additional "Danger Zone" section for deletion

**Components Used:**
- Same as create workshop page

**User Actions:**
- Edit any workshop field
- Click "Save Changes" → API call → Navigate back
- Click "Delete Workshop" → Confirmation → API call → Navigate to workspace

---

## Assessment Pages

### Create Assessment Page

**Route:** `/workshops/:workshopId/assessments/create`  
**Location:** `src/app/features/assessment/components/assessment-create/assessment-create.component.html`  
**Layout:** Main layout with sidebar

**Structure:**
- Page header
  - Heading: "Create Assessment"
  - Breadcrumb
- Progress stepper
  - Step 1: Settings (active)
  - Step 2: Questions
  - Step 3: Review & Publish
- Settings form (Step 1):
  - Title input (required)
  - Description textarea
  - Instructions textarea (shown to students)
  - Passing score input (1-100, required)
  - Duration in minutes input (required)
  - Max attempts input (required)
  - Auto-issue certificate toggle (default: true)
- Navigation buttons
  - "Cancel"
  - "Save Draft"
  - "Next"

**Components Used:**
- app-card
- app-input
- app-textarea
- app-toggle
- app-button
- app-stepper

**User Actions:**
- Fill assessment settings
- Click "Next" → Move to questions step
- Click "Save Draft" → API call → Navigate back

---

### Add Questions Page (Step 2)

**Route:** Same component, step 2  
**Location:** `src/app/features/assessment/components/assessment-create/assessment-create.component.html`

**Structure:**
- Question list (left panel)
  - Shows all added questions
  - Drag to reorder (future)
  - Click to edit
  - Delete button per question
- Question form (right panel)
  - Question text input (required)
  - Points input (default: 1)
  - Explanation textarea (optional, shown after submission)
  - Answer options section:
    - Answer text inputs (min 2, max 6)
    - Radio button to mark correct answer
    - Add/remove answer buttons
- Add Question button (bottom)
- Or: Bulk import button (upload JSON)
- Navigation buttons
  - "Previous"
  - "Save Draft"
  - "Next"

**Components Used:**
- app-card
- app-input
- app-textarea
- app-button
- app-question-form (custom)
- app-answer-option (custom)

**User Actions:**
- Type question text
- Add answer options
- Mark correct answer (exactly one)
- Click "Add Question" → Validate → Add to list → Reset form
- Click question in list → Load in form for editing
- Delete question → Show confirmation → Remove from list
- Click "Next" → Validate (min 3 questions) → Move to review

---

### Review & Publish Page (Step 3)

**Route:** Same component, step 3  
**Location:** `src/app/features/assessment/components/assessment-create/assessment-create.component.html`

**Structure:**
- Assessment summary card:
  - Title
  - Settings summary (passing score, duration, max attempts)
  - Total questions count
  - Total points
  - Certificate auto-issue status
- Questions preview (read-only):
  - List of all questions with answers
  - Correct answer highlighted (green)
- Publish checklist:
  - At least 3 questions ✓/✗
  - All questions have 2+ answers ✓/✗
  - All questions have exactly 1 correct answer ✓/✗
  - Settings configured ✓/✗
- Action buttons
  - "Previous" (go back to edit)
  - "Save as Draft"
  - "Publish Assessment" (primary, enabled only if all checks pass)

**Components Used:**
- app-card
- app-badge
- app-button
- app-checklist (custom)

**User Actions:**
- Review all details
- Click "Previous" → Go back to edit questions
- Click "Publish Assessment" → API call → Show success → Navigate to workshop

---

### Assessment Edit Page

**Route:** `/assessments/:id/edit`  
**Location:** `src/app/features/assessment/components/assessment-edit/assessment-edit.component.html`  
**Layout:** Main layout with sidebar

**Structure:**
- Same as create assessment but:
  - Pre-filled with existing data
  - If assessment has submissions:
    - Show warning banner: "This assessment has [X] submissions. You cannot edit questions."
    - Disable question editing
    - Allow only settings changes (title, description, passing score)
  - If no submissions:
    - Full editing allowed

**Components Used:**
- Same as create assessment

**User Actions:**
- Edit settings
- Edit questions (if no submissions)
- Click "Save Changes" → API call → Navigate back

---

## Submission Pages

### Take Assessment Page

**Route:** `/assessments/:id/take`  
**Location:** `src/app/features/submission/components/take-assessment/take-assessment.component.html`  
**Layout:** Fullscreen (no sidebar for focus)

**Structure:**
- Pre-assessment screen (before starting):
  - Assessment title
  - Instructions (large, centered)
  - Key information cards:
    - Number of questions
    - Duration
    - Passing score
    - Attempts remaining
  - Action buttons:
    - "Cancel" (go back)
    - "Start Assessment" (primary, large)
- Assessment in progress:
  - Fixed header:
    - Assessment title (left)
    - Timer countdown (center, large, red when < 5 min)
    - Progress indicator (right): "Question 5/10"
  - Question panel (center, large):
    - Question number badge
    - Question text (large, bold)
    - Points badge
    - Answer options (radio buttons, large clickable areas)
  - Navigation bar (bottom, sticky):
    - "Previous" button (disabled on first question)
    - Question number pills (1 2 3 4 5...) 
      - Answered: filled circle
      - Unanswered: empty circle
      - Current: highlighted
    - "Next" button (primary)
    - "Submit Assessment" button (danger, shows on last question)
  - Side panel (collapsible, right):
    - Question navigator (list view)
    - Flag question button (for review)

**Components Used:**
- app-card
- app-button
- app-badge
- app-timer (custom)
- app-question-display (custom)
- app-confirmation-dialog (for submit)

**User Actions:**
- Click "Start Assessment" → API call (create submission) → Show questions
- Select answer option → Mark question as answered
- Click "Next" → Move to next question
- Click "Previous" → Move to previous question
- Click question number → Jump to that question
- Click "Flag" → Mark for review (visual indicator)
- Click "Submit Assessment" → Show confirmation dialog:
  - "You have answered 9/10 questions"
  - "Are you sure you want to submit?"
  - "Cancel" / "Submit"
- Confirm submit → API call → Navigate to results page
- Timer expires → Auto-submit → Navigate to results

**Auto-save:**
- Save selected answers to localStorage every 10 seconds
- On browser crash/refresh → Restore progress if submission not expired

---

### Assessment Results Page

**Route:** `/submissions/:id/result`  
**Location:** `src/app/features/submission/components/submission-result/submission-result.component.html`  
**Layout:** Main layout with sidebar

**Structure:**
- Result hero section (full width, colored background):
  - If passed (green background):
    - Large checkmark icon
    - "Congratulations! You Passed"
    - Score: 85%
    - Certificate badge "Certificate Earned!"
  - If failed (red background):
    - X icon
    - "Not Passed"
    - Score: 60%
    - "Passing score: 70%"
    - Remaining attempts
- Stats cards row:
  - Score percentage
  - Correct answers (8/10)
  - Time taken
  - Attempt number
- Certificate card (if passed and issued):
  - Certificate preview image
  - Certificate number
  - "View Certificate" button
  - "Download PDF" button
- Review answers section:
  - List of all questions:
    - Question text
    - Your answer (highlighted green if correct, red if wrong)
    - Correct answer (if wrong, shown in green)
    - Explanation (if provided)
    - Points earned / total
- Action buttons (bottom):
  - "Back to Workshop" (secondary)
  - "Try Again" (primary, if attempts remaining)

**Components Used:**
- app-card
- app-badge
- app-button
- app-stats-card
- app-review-answer (custom)

**User Actions:**
- Scroll to review answers
- Click "View Certificate" → Navigate to certificate detail
- Click "Download PDF" → Download file
- Click "Try Again" → Navigate back to take assessment
- Click "Back to Workshop" → Navigate to workshop

---

### My Submissions Page

**Route:** `/submissions`  
**Location:** `src/app/features/submission/components/submission-list/submission-list.component.html`  
**Layout:** Main layout with sidebar

**Structure:**
- Page header:
  - Heading: "My Assessment Submissions"
  - Description: "View all your assessment attempts and results"
- Filter bar:
  - Status filter (All, Passed, Failed, In Progress)
  - Workshop filter dropdown
  - Date range picker
- Submissions table:
  - Columns:
    - Assessment name
    - Workshop name
    - Attempt number
    - Score
    - Status badge (Passed/Failed/In Progress/Expired)
    - Submitted date
    - Actions (View Results)
- Empty state if no submissions

**Components Used:**
- app-card
- app-table
- app-badge
- app-button
- app-dropdown
- app-empty-state

**User Actions:**
- Filter submissions by status/workshop
- Click "View Results" → Navigate to result page
- Click submission row → Navigate to result page

---

## Certificate Pages

### My Certificates Page

**Route:** `/certificates`  
**Location:** `src/app/features/certificate/components/certificate-list/certificate-list.component.html`  
**Layout:** Main layout with sidebar

**Structure:**
- Page header:
  - Heading: "My Certificates"
  - Description: "All certificates you've earned"
  - Stats: "X certificates earned"
- Filter/Sort bar:
  - Status filter (All, Active, Revoked)
  - Sort by (Newest, Oldest, Workshop A-Z)
  - Search input
- Grid layout (2 columns on desktop):
  - Certificate cards

**Certificate Card Contents:**
- Certificate preview (thumbnail or styled card):
  - Workshop title
  - Workspace name
  - Score badge
  - Issue date
  - Certificate number
  - Status badge (Active/Revoked)
  - QR code (small)
- Action buttons:
  - "View Details"
  - "Download PDF"
  - "Share" (copy link, LinkedIn, etc.)

**Components Used:**
- app-card
- app-badge
- app-button
- app-dropdown
- app-certificate-card (custom)
- app-empty-state

**User Actions:**
- Search certificates
- Filter by status
- Sort certificates
- Click "View Details" → Navigate to certificate detail
- Click "Download PDF" → Download file
- Click "Share" → Open share modal with options

---

### Certificate Detail Page

**Route:** `/certificates/:id`  
**Location:** `src/app/features/certificate/components/certificate-detail/certificate-detail.component.html`  
**Layout:** Main layout with sidebar

**Structure:**
- Certificate display section (large, centered):
  - Full certificate preview or PDF embed
  - If PDF not generated yet: placeholder with "Generating PDF..." message
- Certificate information panel (right sidebar or below):
  - Certificate number (large, monospace)
  - Issue date
  - Status badge (Active/Revoked)
  - Recipient name
  - Workshop title
  - Workspace name
  - Score achieved
  - Verification code (with copy button)
- QR code section:
  - QR code image (large)
  - "Scan to verify" text
  - Verification URL (with copy button)
- Action buttons:
  - "Download PDF" (primary)
  - "Share Certificate" (secondary)
  - "Verify Certificate" (link to verification page)
  - "Back to Certificates" (link)

**Components Used:**
- app-card
- app-badge
- app-button
- QR code display component

**User Actions:**
- View certificate details
- Click "Download PDF" → Download file
- Click "Share" → Open share modal
- Click verification URL → Copy to clipboard
- Click "Verify Certificate" → Navigate to verification page with code

---

### Certificate Verification Page (Public)

**Route:** `/verify/:verificationCode`  
**Location:** `src/app/features/certificate/components/certificate-verify/certificate-verify.component.html`  
**Layout:** Minimal (no sidebar, simple header)

**Structure:**
- Skillmark logo header (minimal)
- Verification result card (large, centered):
  - If valid (green border):
    - Large checkmark icon (green)
    - "Certificate Verified" heading
    - Certificate number
    - Horizontal divider
    - Recipient name
    - Workshop title
    - Issued by workspace name
    - Score achieved
    - Issue date
    - Status: Active badge (green)
    - Verified timestamp
  - If revoked (red border):
    - Warning icon (red)
    - "Certificate Revoked" heading
    - Certificate number
    - Revoked date
    - Revoke reason (if provided)
    - Original issue details (grayed out)
  - If invalid (gray border):
    - X icon (gray)
    - "Certificate Not Found" heading
    - "Invalid verification code" message
    - Warning: "This may be a fake certificate"
- Alternative verification section (below):
  - "Verify by certificate number" link
  - Modal/form to enter certificate number

**Components Used:**
- app-card
- app-badge
- Minimal header component

**User Actions:**
- Scan QR code → Lands on this page with code in URL
- View verification result
- Copy certificate number
- Click "Verify another certificate" → Show search form

---

### Share Certificate Modal

**Component:** Modal overlay  
**Location:** `src/app/features/certificate/components/share-certificate-modal/`

**Structure:**
- Modal header: "Share Certificate"
- Share options (large buttons):
  - Copy verification link (with icon)
  - Share to LinkedIn (with LinkedIn icon)
  - Share via email (with email icon)
  - Download QR code (with download icon)
- Preview section:
  - Verification URL (read-only input with copy button)
  - QR code image
- Close button

**Components Used:**
- app-modal
- app-button

**User Actions:**
- Click "Copy Link" → Copy to clipboard → Show toast
- Click "LinkedIn" → Open LinkedIn share dialog
- Click "Email" → Open email client with pre-filled message
- Click "Download QR" → Download QR code image
- Click close or backdrop → Close modal

---

## Public Pages

### Join Workshop Page (Public with Auth)

**Route:** `/join/:inviteCode`  
**Location:** `src/app/features/invite/components/join-workshop/join-workshop.component.html`  
**Layout:** Minimal (no sidebar)

**Structure:**
- If user not authenticated:
  - Redirect to sign-in with returnUrl
- If authenticated:
  - Invite preview card (large, centered):
    - Workspace logo
    - Workspace name
    - "You're invited to join" heading
    - Workshop cover image
    - Workshop title
    - Workshop description
    - Start/end dates
    - Stats:
      - Participants enrolled
      - Resources count
      - Assessments count
    - Invite validity info:
      - Expires in X days
      - X/Y spots remaining (if limited)
    - "Accept Invitation" button (primary, large)
    - "Decline" button (secondary)
- If invite invalid/expired:
  - Error card:
    - X icon
    - "Invitation Invalid" or "Invitation Expired"
    - Reason message
    - "Contact organizer" suggestion

**Components Used:**
- app-card
- app-badge
- app-button

**User Actions:**
- Click "Accept Invitation" → API call → Show success → Navigate to workshop
- Click "Decline" → Navigate to dashboard
- If invite expired → Show contact info or error message

---

### Landing Page (Marketing - Future)

**Route:** `/` (when not authenticated)  
**Location:** `src/app/features/landing/components/landing-home/`  
**Layout:** Custom landing page layout

**Structure:**
- Hero section:
  - Headline
  - Subheadline
  - "Get Started" CTA button
  - Hero image/illustration
- Features section (3 columns):
  - Feature cards with icons
- How it works section (steps)
- Testimonials section (future)
- Footer with links

**Note:** This is out of scope for MVP, would redirect to dashboard or sign-in

---

## Shared Components

### Navbar Component

**Location:** `src/app/shared/components/layout/navbar/navbar.component.html`

**Structure:**
- Container (full width, fixed top, white background, shadow)
- Left section:
  - Skillmark logo (clickable → home)
  - Workspace selector dropdown (shows current workspace, if on workspace page)
- Center section:
  - Search bar (future feature, placeholder for now)
- Right section:
  - Notifications bell icon (future)
  - User profile dropdown:
    - Avatar image or initials
    - User name
    - Dropdown menu:
      - View Profile
      - Settings
      - Help & Support (future)
      - Divider
      - Sign Out

**Components Used:**
- app-dropdown
- app-button

---

### Sidebar Component

**Location:** `src/app/shared/components/layout/sidebar/sidebar.component.html`

**Structure:**
- Navigation menu (vertical):
  - Dashboard (icon + text, active state styling)
  - My Workspaces (icon + text)
  - My Workshops (icon + text)
  - My Certificates (icon + text)
  - Divider
  - Analytics (icon + text, if ADMIN/INSTRUCTOR)
  - Settings (icon + text)
- Collapse/expand toggle (bottom)

**Components Used:**
- Router link directives with active class
- Icons (Heroicons)

**States:**
- Expanded (default): shows icon + text
- Collapsed: shows icon only

---

### Toast Component

**Location:** `src/app/shared/components/ui/toast/toast.component.html`

**Structure:**
- Fixed position (top-right corner)
- Stack of toast notifications
- Each toast:
  - Icon (success: checkmark, error: X, warning: !, info: i)
  - Message text
  - Close button (X)
  - Auto-dismiss after duration
  - Slide-in animation

**Toast types:**
- Success (green)
- Error (red)
- Warning (yellow)
- Info (blue)

**Components Used:**
- Self-contained component
- Uses ToastService for state management

---

### Pagination Component

**Location:** `src/app/shared/components/ui/pagination/pagination.component.html`

**Structure:**
- Container (centered)
- Previous button
- Page number buttons (show max 7: 1 ... 4 5 6 ... 10)
- Next button
- Items per page selector (10, 20, 50, 100)
- Results count text: "Showing 1-20 of 150 results"

**Components Used:**
- app-button

**User Actions:**
- Click page number → Emit page change event
- Click Previous/Next → Navigate pages
- Select items per page → Emit size change event

---

### Empty State Component

**Location:** `src/app/shared/components/ui/empty-state/empty-state.component.html`

**Structure:**
- Container (centered, padding)
- Illustration or icon (large, gray)
- Heading text (large, bold)
- Description text (smaller, gray)
- Optional action button (primary)

**Usage:**
- No workspaces
- No workshops
- No certificates
- No search results
- No submissions

**Components Used:**
- app-button (optional)

---

### Loading Spinner Component

**Location:** `src/app/shared/components/ui/spinner/spinner.component.html`

**Structure:**
- Spinning circle animation
- Optional loading text below
- Sizes: small, medium (default), large

**Usage:**
- Full-page loading (centered)
- Inline loading (in buttons, cards)
- Table loading

---

### Confirmation Dialog Component

**Location:** `src/app/shared/components/ui/confirmation-dialog/confirmation-dialog.component.html`

**Structure:**
- Modal overlay
- Dialog box (centered):
  - Icon (warning triangle for destructive actions)
  - Title (e.g., "Delete Workspace?")
  - Message text
  - Action buttons:
    - Cancel (secondary)
    - Confirm (primary or danger)

**Usage:**
- Delete workspace
- Delete workshop
- Remove member
- Archive assessment
- Revoke certificate

**Components Used:**
- app-modal base
- app-button

---

### Badge Component

**Location:** `src/app/shared/components/ui/badge/badge.component.html`

**Structure:**
- Small pill-shaped container
- Text (uppercase, small font)
- Colored background based on variant

**Variants:**
- Primary (blue)
- Secondary (gray)
- Success (green)
- Warning (yellow)
- Danger (red)
- Info (light blue)

**Usage:**
- User roles (ADMIN, INSTRUCTOR, MEMBER)
- Status (Published, Draft, Archived)
- Pass/Fail status
- Certificate status (Active, Revoked)

---

### Stats Card Component

**Location:** `src/app/shared/components/dashboard/stats-card/stats-card.component.html`

**Structure:**
- Card container
- Icon (top-left, colored circle background)
- Label text (small, gray)
- Value (large, bold number)
- Optional trend indicator (↑ 12% from last month)
- Optional link ("View all →")

**Variants:**
- Different icon and color per stat type
- Workspace stats
- Workshop stats
- Certificate stats

**Components Used:**
- app-card base

---

### File Upload Component

**Location:** `src/app/shared/components/forms/file-upload/file-upload.component.html`

**Structure:**
- Drag-and-drop area (dashed border):
  - Upload icon
  - "Drag and drop or click to browse" text
  - File type and size restrictions text
- Or:
  - Hidden file input
  - "Choose File" button
- File preview (after selection):
  - Thumbnail (if image)
  - File name
  - File size
  - Remove button (X)
- Upload progress bar (during upload)

**Components Used:**
- app-button

**User Actions:**
- Click area → Open file picker
- Drag file → Highlight drop zone → Drop → Select file
- Click remove → Clear selection
- Auto-upload on selection or manual trigger

---

### Input Component

**Location:** `src/app/shared/components/forms/input/input.component.html`

**Structure:**
- Label (if provided)
- Input field
- Helper text (if provided)
- Error message (if validation fails)
- Icon (optional, left or right)

**Variants:**
- Text input
- Email input
- Password input (with show/hide toggle)
- Number input
- URL input

**States:**
- Default
- Focused (blue border)
- Error (red border)
- Disabled (gray background)

**Components Used:**
- app-validation-error (for error messages)

---

### Textarea Component

**Location:** `src/app/shared/components/forms/textarea/textarea.component.html`

**Structure:**
- Same as input but:
  - Multi-line text area
  - Auto-resize option
  - Character count (optional)

---

### Select/Dropdown Component

**Location:** `src/app/shared/components/forms/select/select.component.html`

**Structure:**
- Label (if provided)
- Select button (shows selected value or placeholder)
- Dropdown menu (on click):
  - Search input (if searchable)
  - Option list (scrollable)
  - Selected option highlighted
- Error message (if validation fails)

**Components Used:**
- app-dropdown base

---

### Table Component (Custom)

**Location:** `src/app/shared/components/ui/table/table.component.html`

**Structure:**
- Table container (responsive, scrollable on mobile)
- Table header:
  - Column headers (clickable for sorting)
  - Sort indicators (↑↓)
- Table body:
  - Data rows
  - Hover effect
  - Click action (if provided)
- Table footer:
  - Pagination component
- Loading overlay (if loading)
- Empty state (if no data)

**Components Used:**
- app-pagination
- app-spinner
- app-empty-state

---

## Responsive Behavior

### Desktop (>= 1024px)
- Sidebar always visible (expanded)
- Multi-column grids (3 columns for cards)
- Tables show all columns
- Modals: medium to large size

### Tablet (768px - 1023px)
- Sidebar collapsible (icon only when collapsed)
- 2-column grids
- Tables scroll horizontally if needed
- Modals: medium size

### Mobile (< 768px)
- Sidebar hidden, accessible via hamburger menu
- 1-column grids (stacked)
- Cards full width
- Tables convert to card view or scroll
- Modals: full width with small padding
- Bottom navigation (future enhancement)

---

## Color Coding Conventions

### Status Colors
- **Draft:** Gray background, dark gray text
- **Published:** Green background, white text
- **Archived:** Yellow background, dark text
- **Active:** Green
- **Revoked:** Red
- **In Progress:** Blue
- **Expired:** Orange

### Role Colors
- **ADMIN:** Purple badge
- **INSTRUCTOR:** Blue badge
- **MEMBER:** Gray badge

### Result Colors
- **Passed:** Green background, checkmark icon
- **Failed:** Red background, X icon
- **Pending:** Yellow background, clock icon

---

## Iconography

**Icon Library:** Heroicons (https://heroicons.com/)

**Common Icons:**
- Dashboard: chart-bar
- Workspaces: building-office
- Workshops: academic-cap
- Certificates: document-check
- Settings: cog-6-tooth
- Users: users
- Add: plus
- Edit: pencil
- Delete: trash
- Search: magnifying-glass
- Filter: funnel
- Sort: arrows-up-down
- Download: arrow-down-tray
- Upload: arrow-up-tray
- Close: x-mark
- Success: check-circle
- Error: x-circle
- Warning: exclamation-triangle
- Info: information-circle

---

## Animation & Transitions

### Page Transitions
- Fade in on route change (300ms)

### Component Animations
- Modal: fade + slide up (200ms)
- Toast: slide in from right (300ms)
- Dropdown: fade + scale (150ms)
- Tooltip: fade (100ms)

### Hover States
- Cards: lift shadow (200ms)
- Buttons: darken background (150ms)
- Links: color change (150ms)

### Loading States
- Spinner: rotate animation (continuous)
- Skeleton screens: shimmer effect (1.5s loop)
- Progress bar: smooth fill (ease-out)

---

## Accessibility Considerations

### Keyboard Navigation
- All interactive elements focusable
- Visible focus indicators (blue outline)
- Tab order follows logical flow
- Escape key closes modals/dropdowns
- Enter/Space activates buttons

### Screen Reader Support
- Semantic HTML (nav, main, article, etc.)
- ARIA labels for icons
- ARIA live regions for toasts
- Alt text for images
- Form labels properly associated

### Color Contrast
- All text meets WCAG AA standards
- Error states use icon + color
- Links distinguishable without color alone

---

## Error States

### Form Validation Errors
- Inline error messages below fields
- Red border on invalid fields
- Error icon next to message
- Focus on first error field

### API Errors
- Toast notification for global errors
- Inline error message in component
- Retry button if applicable
- Contact support link for critical errors

### Network Errors
- "No internet connection" banner (top)
- Offline mode message
- Retry button
- Auto-retry on reconnection

### 404 Not Found
- Full page with:
  - Large 404 text
  - "Page not found" message
  - "Back to dashboard" button
  - Helpful links

### 403 Forbidden
- Full page with:
  - Lock icon
  - "Access denied" message
  - Explanation
  - "Back" button

---

## Loading States

### Page Load
- Full page spinner (centered)
- Or skeleton screens for cards/tables

### Component Load
- Skeleton cards
- Spinner in button during submit
- Disabled form during submit
- Progress bar for file uploads

### Infinite Scroll
- Spinner at bottom of list
- "Loading more..." text

---

## Form Patterns

### Standard Form Layout
- Vertical stack
- Labels above fields
- Helper text below fields (gray, small)
- Error messages below fields (red)
- Required field indicator (*)
- Action buttons at bottom (right-aligned)

### Multi-step Forms
- Progress stepper at top
- Current step highlighted
- Completed steps: checkmark
- Future steps: grayed out
- Back/Next navigation
- Save draft option on each step

### Inline Editing
- Click to edit (pencil icon)
- Convert to input field
- Save/Cancel buttons appear
- Click outside to cancel (optional)

---

This UI documentation provides a complete reference for implementing all frontend pages and components in the Skillmark application using Angular and Tailwind CSS.