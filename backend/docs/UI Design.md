# Skillmark Frontend — UI Design Document

## Angular Frontend Design Document — Version 1.0

---

# 1. Introduction

## 1.1 Purpose

This document defines the UI design, layout structure, page inventory, component architecture, and user interaction flows for the **Skillmark Angular frontend**.

The frontend consumes the Skillmark backend REST API and provides:

- a dashboard for organization owners to manage their organizations, programs, quizzes, and certificates
- a participant portal for enrolled users to view programs, take quizzes, and download certificates
- a public certificate verification page accessible without login

---

## 1.2 Frontend Stack

| Technology | Purpose |
| --- | --- |
| Angular 17+ | Frontend framework |
| Angular Router | Client-side routing |
| Angular Reactive Forms | Form management and validation |
| Angular HTTP Client | API communication |
| Clerk Angular SDK | Authentication and session management |
| TailwindCSS | Utility-first styling |
| Angular Material or PrimeNG | UI component library |
| Chart.js or NgRx Charts | Statistics charts |
| ngx-qrcode or similar | QR code display |
| NgRx or Angular Signals | State management |

---

## 1.3 Authentication Strategy

The frontend uses **Clerk** for authentication.

Clerk responsibilities:

- sign up page
- sign in page
- password reset
- email verification
- session management
- JWT token issuance

Frontend responsibilities:

- attach Clerk JWT token to every API request via HTTP interceptor
- redirect unauthenticated users to Clerk sign-in
- detect session expiry and re-authenticate
- call backend user sync on first login

---

## 1.4 Design Principles

- Mobile-responsive layout
- Clean and minimal university-style design
- Role-aware navigation (owner sees management tools, participant sees learning tools)
- Consistent loading states, error states, and empty states on all pages
- Accessible (ARIA labels, keyboard navigation)
- Paginated lists everywhere
- Toast notifications for actions (success, error, warning)

---

# 2. Application Layout

## 2.1 Layout Zones

The application has three main layout zones:

```
┌─────────────────────────────────────────────────┐
│                   TOP NAV BAR                   │
├──────────────┬──────────────────────────────────┤
│              │                                  │
│   SIDEBAR    │         MAIN CONTENT AREA        │
│              │                                  │
│              │                                  │
│              │                                  │
└──────────────┴──────────────────────────────────┘
```

---

## 2.2 Top Navigation Bar

Always visible after login.

Contents:

```
Left:
  - Skillmark logo / brand name
  - Current organization selector (dropdown if user belongs to multiple)

Center:
  - (empty or search bar in future)

Right:
  - Notification bell (future feature placeholder)
  - User avatar and name
  - Dropdown menu:
      → View Profile
      → Sign Out
```

---

## 2.3 Sidebar Navigation

Visible after login on medium and large screens.

On mobile: collapsible hamburger menu.

Sidebar items depend on the current context:

### Owner Sidebar

```
Dashboard
─────────────────
My Organizations
  └── [Current Org Name]
       ├── Overview
       ├── Members
       ├── Programs
       └── Settings

Programs (in current org)
  └── [Program Name]
       ├── Overview
       ├── Enrollments
       ├── Invitations
       ├── Resources
       ├── Quizzes
       └── Statistics

─────────────────
Certificates
Audit Logs
```

### Participant Sidebar

```
Dashboard
─────────────────
My Programs
  └── [Program Name]
       ├── Resources
       └── Quizzes

─────────────────
My Certificates
My Attempts
```

---

## 2.4 Main Content Area

The main content area renders the active route.

It always has:

- page header (title + breadcrumb)
- action buttons (top right of the page header)
- content body
- pagination controls at the bottom of lists

---

## 2.5 Public Layout (No Sidebar)

Used for:

- Certificate Verification page
- Sign In / Sign Up pages (Clerk hosted or embedded)
- 404 page
- Landing page (optional)

```
┌─────────────────────────────────────────────────┐
│              MINIMAL TOP BAR (logo only)        │
├─────────────────────────────────────────────────┤
│                                                 │
│              CENTERED CONTENT CARD              │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

# 3. Page Inventory

## 3.1 Public Pages

| Page | Route | Description |
| --- | --- | --- |
| Landing Page | `/` | Product intro, sign in / sign up CTA |
| Sign In | `/sign-in` | Clerk sign in (embedded or hosted) |
| Sign Up | `/sign-up` | Clerk sign up (embedded or hosted) |
| Certificate Verification | `/verify/:verificationCode` | Public certificate lookup |
| 404 Not Found | `/**` | Fallback not found page |

---

## 3.2 Authenticated Pages (Common)

| Page | Route | Description |
| --- | --- | --- |
| Dashboard | `/dashboard` | Role-aware landing after login |
| User Profile | `/profile` | View and edit own profile |
| My Enrollments | `/my-enrollments` | List of enrolled programs |
| My Attempts | `/my-attempts` | List of own quiz attempts |
| My Certificates | `/my-certificates` | List of own certificates |

---

## 3.3 Organization Owner Pages

| Page | Route | Description |
| --- | --- | --- |
| Create Organization | `/organizations/new` | Create a new organization |
| Organization Overview | `/organizations/:orgId` | Organization dashboard |
| Organization Members | `/organizations/:orgId/members` | Manage members |
| Organization Settings | `/organizations/:orgId/settings` | Update organization details |
| Organization Audit Logs | `/organizations/:orgId/audit-logs` | View audit history |
| Organization Statistics | `/organizations/:orgId/stats` | View org-level stats |

---

## 3.4 Program Pages (Owner)

| Page | Route | Description |
| --- | --- | --- |
| Create Program | `/organizations/:orgId/programs/new` | Create new program |
| Program Overview | `/programs/:programId` | Program dashboard |
| Program Enrollments | `/programs/:programId/enrollments` | View and manage enrollments |
| Program Invitations | `/programs/:programId/invitations` | Manage invitation links |
| Program Resources | `/programs/:programId/resources` | Manage learning resources, including visibility toggles |
| Program Quizzes | `/programs/:programId/quizzes` | List and manage quizzes, including visibility toggles |
| Program Statistics | `/programs/:programId/stats` | Program-level stats |
| Program Settings | `/programs/:programId/settings` | Update program details |

---

## 3.5 Quiz Pages (Owner)

| Page | Route | Description |
| --- | --- | --- |
| Create Quiz | `/programs/:programId/quizzes/new` | Create a new quiz |
| Quiz Builder | `/quizzes/:quizId/builder` | Add questions and options |
| Quiz Overview | `/quizzes/:quizId` | Quiz dashboard |
| Quiz Attempts (Owner) | `/quizzes/:quizId/attempts` | View all attempts |
| Quiz Statistics | `/quizzes/:quizId/stats` | Quiz-level stats |
| Quiz Settings | `/quizzes/:quizId/settings` | Update quiz settings |

---

## 3.6 Certificate Pages (Owner)

| Page | Route | Description |
| --- | --- | --- |
| Organization Certificates | `/organizations/:orgId/certificates` | All certificates in org |

---

## 3.7 Participant Pages

| Page | Route | Description |
| --- | --- | --- |
| Program View (Participant) | `/programs/:programId/learn` | Participant view of program |
| Quiz View (Participant) | `/quizzes/:quizId/view` | View quiz before attempting |
| Quiz Attempt | `/quizzes/:quizId/attempt` | Take the quiz |
| Attempt Result | `/attempts/:attemptId/result` | View scored result |
| Certificate View | `/certificates/:certificateId` | View certificate details |

---

# 4. Page Designs

---

## 4.1 Landing Page

**Route:** `/`

**Purpose:** Introduce Skillmark and direct users to sign in or sign up.

**Layout:** Centered, full-width public layout.

**Sections:**

```
┌─────────────────────────────────────────────────┐
│  Skillmark Logo                [Sign In] [Sign Up]│
├─────────────────────────────────────────────────┤
│                                                 │
│     Hero Section                                │
│     Headline: "Train. Assess. Certify."         │
│     Subtext: One-line pitch                     │
│     [Get Started] [Verify a Certificate]        │
│                                                 │
├─────────────────────────────────────────────────┤
│     Features Section (3 columns)                │
│     ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│     │ Manage   │ │  Run     │ │  Issue   │     │
│     │ Programs │ │  Quizzes │ │  Certs   │     │
│     └──────────┘ └──────────┘ └──────────┘     │
├─────────────────────────────────────────────────┤
│     Use Cases Section                           │
│     University clubs, bootcamps, companies...   │
├─────────────────────────────────────────────────┤
│     Footer                                      │
│     © Skillmark · Verify Certificate · Sign In  │
└─────────────────────────────────────────────────┘
```

---

## 4.2 Certificate Verification Page

**Route:** `/verify/:verificationCode`

**Purpose:** Allow anyone to verify a certificate by entering or scanning a verification code.

**Layout:** Minimal public layout with centered card.

**Sections:**

```
┌─────────────────────────────────────────────────┐
│  Skillmark Logo                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│         Certificate Verification                │
│                                                 │
│    ┌─────────────────────────────────────┐      │
│    │  Enter Verification Code            │      │
│    │  [___________________________] [Go] │      │
│    └─────────────────────────────────────┘      │
│                                                 │
│    ── OR ──                                     │
│                                                 │
│    If code is in URL, auto-load on page open    │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │  ✅ Certificate Valid                     │  │
│  │                                           │  │
│  │  Participant:  Ahmad Al-Rashid            │  │
│  │  Quiz:         Git Basics Final Quiz      │  │
│  │  Program:      Git & GitHub Workshop      │  │
│  │  Organization: Computer Science Club      │  │
│  │  Issued:       January 15, 2024           │  │
│  │  Status:       ACTIVE                     │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ❌ If revoked:                                 │
│  ┌───────────────────────────────────────────┐  │
│  │  ❌ Certificate Revoked                   │  │
│  │  Revoked on: February 1, 2024             │  │
│  │  Reason: Issued in error                  │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  ❓ If not found:                               │
│  ┌───────────────────────────────────────────┐  │
│  │  ❓ Certificate Not Found                 │  │
│  │  No certificate matches this code.        │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Behavior:**

- If the route has `:verificationCode`, auto-call verification API on load.
- If no code in route, show input form.
- Show loading spinner while API call is in progress.
- No authentication required.

---

## 4.3 Dashboard Page

**Route:** `/dashboard`

**Purpose:** Role-aware landing page after login.

**Layout:** Sidebar + main content.

### Owner Dashboard

```
┌──────────────────────────────────────────────────┐
│  Welcome back, Ahmad 👋                          │
├──────────────────────────────────────────────────┤
│                                                  │
│  My Organizations              [+ New Org]       │
│  ┌─────────────┐ ┌─────────────┐                 │
│  │ CS Club     │ │ AI Workshop │                 │
│  │ 3 programs  │ │ 1 program   │                 │
│  │ 45 members  │ │ 12 members  │                 │
│  │ [Open]      │ │ [Open]      │                 │
│  └─────────────┘ └─────────────┘                 │
│                                                  │
│  Recent Activity                                 │
│  ─────────────────────────────────────           │
│  • Ahmad issued a certificate     2 min ago      │
│  • Sara joined Git Workshop       1 hr ago       │
│  • Quiz "Git Basics" published    3 hrs ago      │
│                                                  │
│  Quick Stats (for first org)                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│  │  3   │ │  45  │ │  12  │ │  38  │            │
│  │Progs │ │Membs │ │Quizs │ │Certs │            │
│  └──────┘ └──────┘ └──────┘ └──────┘            │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Participant Dashboard

```
┌──────────────────────────────────────────────────┐
│  Welcome back, Sara 👋                           │
├──────────────────────────────────────────────────┤
│                                                  │
│  My Enrolled Programs                            │
│  ┌──────────────────────────────────────────┐    │
│  │ Git & GitHub Workshop                    │    │
│  │ Computer Science Club                    │    │
│  │ 3 resources · 1 quiz                     │    │
│  │ [Continue Learning]                      │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  My Recent Certificates                          │
│  ┌──────────────────────────────────────────┐    │
│  │ 🏆 Git & GitHub Workshop Completion      │    │
│  │ Issued: Jan 15, 2024                     │    │
│  │ [View] [Download PDF]                    │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  My Recent Attempts                              │
│  ┌──────────────────────────────────────────┐    │
│  │ Git Basics Quiz · Score: 85% · ✅ Passed │    │
│  │ Jan 15, 2024                             │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 4.4 Organization Overview Page

**Route:** `/organizations/:orgId`

**Layout:** Sidebar + main content.

```
┌──────────────────────────────────────────────────┐
│  Computer Science Club              [Edit] [⚙️]  │
│  Breadcrumb: My Organizations > CS Club          │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │  3   │  │  45  │  │  12  │  │  38  │         │
│  │Progs │  │Membs │  │Quizs │  │Certs │         │
│  └──────┘  └──────┘  └──────┘  └──────┘         │
│                                                  │
│  Programs                       [+ New Program]  │
│  ┌──────────────────────────────────────────┐    │
│  │ Git & GitHub Workshop  PUBLISHED         │    │
│  │ 15 enrolled · Jan 10 – Jan 31            │    │
│  │ [Manage]                                 │    │
│  ├──────────────────────────────────────────┤    │
│  │ Python Basics Workshop  DRAFT            │    │
│  │ 0 enrolled · Feb 1 – Feb 28             │    │
│  │ [Manage]                                 │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  Recent Members                  [View All]      │
│  • Ahmad Al-Rashid (Owner)                       │
│  • Sara Mohammed (Participant)                   │
│  • Khalid Hassan (Participant)                   │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 4.5 Organization Members Page

**Route:** `/organizations/:orgId/members`

```
┌──────────────────────────────────────────────────┐
│  Members                              [+ Add]    │
│  Breadcrumb: CS Club > Members                   │
├──────────────────────────────────────────────────┤
│  Search: [___________________]                   │
│  Filter: [All Roles ▼]                           │
├──────────────────────────────────────────────────┤
│  Avatar  Name              Role         Actions  │
│  ──────  ──────────────    ──────       ───────  │
│  [A]     Ahmad Al-Rashid   OWNER        —        │
│  [S]     Sara Mohammed     PARTICIPANT  [Remove] │
│  [K]     Khalid Hassan     PARTICIPANT  [Remove] │
├──────────────────────────────────────────────────┤
│  « 1 2 3 »                                       │
└──────────────────────────────────────────────────┘
```

**Add Member Modal:**

```
┌────────────────────────────────┐
│  Add Member                 ✕ │
├────────────────────────────────┤
│  Search User by Email:         │
│  [_________________________]   │
│  [Search]                      │
│                                │
│  Found: Sara Mohammed          │
│  [Add as Participant]          │
└────────────────────────────────┘
```

---

## 4.6 Program Overview Page

**Route:** `/programs/:programId`

```
┌──────────────────────────────────────────────────┐
│  Git & GitHub Workshop              [Edit] [⚙️]  │
│  CS Club > Programs > Git Workshop               │
│  Status: PUBLISHED   Jan 10 – Jan 31             │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐         │
│  │  15  │  │  3   │  │  1   │  │  12  │         │
│  │Enrol │  │Resrc │  │Quiz  │  │Certs │         │
│  └──────┘  └──────┘  └──────┘  └──────┘         │
│                                                  │
│  Description:                                    │
│  A hands-on workshop covering Git basics...      │
│                                                  │
│  Quick Actions:                                  │
│  [Manage Enrollments]  [Manage Resources]        │
│  [Manage Quizzes]      [View Statistics]         │
│  [Manage Invitations]                            │
│                                                  │
│  [Archive Program]   [Delete Program]            │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 4.7 Program Enrollments Page

**Route:** `/programs/:programId/enrollments`

```
┌──────────────────────────────────────────────────┐
│  Enrollments                    [+ Enroll User]  │
│  CS Club > Git Workshop > Enrollments            │
├──────────────────────────────────────────────────┤
│  Search: [___________________]                   │
├──────────────────────────────────────────────────┤
│  Avatar  Name           Enrolled At    Actions   │
│  ──────  ──────────     ───────────    ───────   │
│  [S]     Sara Mohammed  Jan 10, 2024   [Remove]  │
│  [K]     Khalid Hassan  Jan 11, 2024   [Remove]  │
├──────────────────────────────────────────────────┤
│  « 1 2 »                                         │
└──────────────────────────────────────────────────┘
```

---

## 4.8 Program Invitations Page

**Route:** `/programs/:programId/invitations`

```
┌──────────────────────────────────────────────────┐
│  Invitation Links           [+ Create Invitation]│
│  CS Club > Git Workshop > Invitations            │
├──────────────────────────────────────────────────┤
│  Code         Uses     Expires       Status      │
│  ──────────   ──────   ───────────   ──────      │
│  A3FX9KL2MN8P  5/50   Jan 31, 2024  ACTIVE      │
│  [Copy Link]  [Disable]                          │
│  ─────────────────────────────────────────────   │
│  B7KP3NM4QR2S  0/20   Feb 15, 2024  ACTIVE      │
│  [Copy Link]  [Disable]                          │
└──────────────────────────────────────────────────┘
```

**Create Invitation Modal:**

```
┌────────────────────────────────┐
│  Create Invitation Link      ✕ │
├────────────────────────────────┤
│  Description (optional):       │
│  [_________________________]   │
│                                │
│  Max Uses (leave blank = ∞):   │
│  [_________________________]   │
│                                │
│  Expires At (optional):        │
│  [Date Picker_______________]  │
│                                │
│  [Cancel]  [Create]            │
└────────────────────────────────┘
```

---

## 4.9 Program Resources Page

**Route:** `/programs/:programId/resources`

```
┌──────────────────────────────────────────────────┐
│  Resources                    [+ Add Resource]   │
│  CS Club > Git Workshop > Resources              │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │ 📄 Git Slides                            │    │
│  │ Type: LINK   Position: 1                 │    │
│  │ https://slides.example.com/git           │    │
│  │ [Edit]  [Delete]                         │    │
│  ├──────────────────────────────────────────┤    │
│  │ 📦 Workshop Notes PDF                    │    │
│  │ Type: FILE   Provider: R2                │    │
│  │ [Download]  [Edit]  [Delete]             │    │
│  ├──────────────────────────────────────────┤    │
│  │ 🖼️ Setup Screenshot                     │    │
│  │ Type: IMAGE  Provider: Cloudinary        │    │
│  │ [View]  [Edit]  [Delete]                 │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Add Resource Modal:**

```
┌────────────────────────────────────┐
│  Add Resource                    ✕ │
├────────────────────────────────────┤
│  Title: [_______________________]  │
│                                    │
│  Type: [LINK ▼]                    │
│     Options: LINK / FILE /         │
│              IMAGE / VIDEO_LINK    │
│                                    │
│  If LINK or VIDEO_LINK:            │
│  URL: [____________________]       │
│                                    │
│  If FILE:                          │
│  [Upload File to R2 ⬆️]           │
│                                    │
│  If IMAGE:                         │
│  [Upload Image to Cloudinary ⬆️]  │
│                                    │
│  Description (optional):           │
│  [____________________________]    │
│                                    │
│  [Cancel]  [Save]                  │
└────────────────────────────────────┘
```

---

## 4.10 Quiz Builder Page

**Route:** `/quizzes/:quizId/builder`

**Purpose:** Owner adds and manages questions and options for a quiz.

```
┌──────────────────────────────────────────────────┐
│  Quiz Builder: Git Basics Quiz    [Publish Quiz] │
│  CS Club > Git Workshop > Quizzes > Builder      │
│                                                  │
│  Settings summary:                               │
│  Passing Score: 70%  Duration: 30 min  Max: 3   │
├──────────────────────────────────────────────────┤
│                                                  │
│  Questions                       [+ Add Question]│
│                                                  │
│  Q1. What does "git init" do?          [Edit][✕] │
│  Type: SINGLE_CHOICE   Points: 1                 │
│  ┌───────────────────────────────────────────┐   │
│  │ ○ Creates a new branch                    │   │
│  │ ● Initializes a new repository ✅         │   │
│  │ ○ Clones a repository                     │   │
│  │ ○ Deletes all commits                     │   │
│  │                          [+ Add Option]   │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  Q2. What command stages all changes?  [Edit][✕] │
│  Type: SINGLE_CHOICE   Points: 2                 │
│  ┌───────────────────────────────────────────┐   │
│  │ ○ git commit                              │   │
│  │ ● git add .   ✅                          │   │
│  │ ○ git push                                │   │
│  │                          [+ Add Option]   │   │
│  └───────────────────────────────────────────┘   │
│                                                  │
│  [+ Add Question]                                │
│                                                  │
│  Publish Readiness:                              │
│  ✅ 2 questions added                            │
│  ✅ All questions have correct answers           │
│  ✅ Settings are valid                           │
│  [Publish Quiz]                                  │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Add Question Modal:**

```
┌─────────────────────────────────────┐
│  Add Question                     ✕ │
├─────────────────────────────────────┤
│  Question Text:                     │
│  [__________________________________]│
│                                     │
│  Type: [SINGLE_CHOICE ▼]            │
│                                     │
│  Points: [1]                        │
│                                     │
│  Position: [auto]                   │
│                                     │
│  [Cancel]  [Add Question]           │
└─────────────────────────────────────┘
```

---

## 4.11 Quiz Attempt Page (Participant)

**Route:** `/quizzes/:quizId/attempt`

**Purpose:** Participant takes the quiz.

```
┌──────────────────────────────────────────────────┐
│  Git Basics Final Quiz                           │
│  Time Remaining: 24:35 ⏱️                       │
│  Question 2 of 5                                 │
├──────────────────────────────────────────────────┤
│                                                  │
│  What command stages all changes?                │
│                                                  │
│  ○ git commit                                    │
│  ○ git add .                                     │
│  ○ git push                                      │
│  ○ git clone                                     │
│                                                  │
├──────────────────────────────────────────────────┤
│  [← Previous]          [Next →]                  │
│                                                  │
│  Question Navigator:                             │
│  [1✓] [2 ] [3 ] [4 ] [5 ]                        │
│                                                  │
│  [Submit Quiz]                                   │
└──────────────────────────────────────────────────┘
```

**Behaviors:**

- Timer counts down from `durationMinutes`.
- Timer reaching zero triggers automatic submission prompt.
- Navigator shows answered vs unanswered questions.
- Submit confirmation dialog before final submission.
- Cannot go back after submission.

**Submit Confirmation Dialog:**

```
┌──────────────────────────────────────┐
│  Submit Quiz?                        │
│                                      │
│  You have answered 4 of 5 questions. │
│  1 question is unanswered.           │
│                                      │
│  Are you sure you want to submit?    │
│                                      │
│  [Go Back]   [Submit]                │
└──────────────────────────────────────┘
```

---

## 4.12 Attempt Result Page

**Route:** `/attempts/:attemptId/result`

```
┌──────────────────────────────────────────────────┐
│  Quiz Result: Git Basics Final Quiz              │
│  Submitted: January 15, 2024 at 10:45 AM         │
├──────────────────────────────────────────────────┤
│                                                  │
│           ✅ PASSED                              │
│                                                  │
│         Score: 85%                               │
│         Points: 17 / 20                          │
│         Attempt #: 1                             │
│                                                  │
│  ────────────────────────────────────────────    │
│                                                  │
│  🏆 Certificate Issued!                          │
│  Git & GitHub Workshop Completion Certificate    │
│  [View Certificate]  [Download PDF]              │
│                                                  │
│  ────────────────────────────────────────────    │
│                                                  │
│  Answer Review:                                  │
│  Q1. What does "git init" do?                    │
│  Your Answer: Initializes a new repository ✅    │
│                                                  │
│  Q2. What command stages all changes?            │
│  Your Answer: git commit ❌                      │
│  Correct Answer: git add .                       │
│                                                  │
│  [Back to Program]                               │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 4.13 My Certificates Page

**Route:** `/my-certificates`

```
┌──────────────────────────────────────────────────┐
│  My Certificates                                 │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │ 🏆 Git & GitHub Workshop Certificate     │    │
│  │ Organization: Computer Science Club      │    │
│  │ Program:      Git & GitHub Workshop      │    │
│  │ Quiz:         Git Basics Final Quiz      │    │
│  │ Issued:       January 15, 2024           │    │
│  │ Status:       ✅ ACTIVE                  │    │
│  │ Cert #:       CERT-2024-AX93KL2P         │    │
│  │                                          │    │
│  │ [View] [Download PDF] [Verify Publicly]  │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │ 🏆 Python Basics Certificate             │    │
│  │ Status: ❌ REVOKED                       │    │
│  │ Revoked: Feb 1, 2024                     │    │
│  │ Reason: Issued in error                  │    │
│  │ [View]                                   │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 4.14 Certificate Detail Page

**Route:** `/certificates/:certificateId`

```
┌──────────────────────────────────────────────────┐
│  Certificate Detail                              │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │                                            │  │
│  │     🏆  CERTIFICATE OF COMPLETION          │  │
│  │                                            │  │
│  │     This certifies that                    │  │
│  │     Ahmad Al-Rashid                        │  │
│  │     has successfully completed             │  │
│  │     Git Basics Final Quiz                  │  │
│  │     in the program                         │  │
│  │     Git & GitHub Workshop                  │  │
│  │     offered by                             │  │
│  │     Computer Science Club                  │  │
│  │                                            │  │
│  │     Issued: January 15, 2024               │  │
│  │     Certificate #: CERT-2024-AX93KL2P      │  │
│  │                                            │  │
│  │     [QR Code Image]                        │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  [Download PDF]  [Verify Publicly]  [Share Link] │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 4.15 Statistics Pages

### Organization Statistics

**Route:** `/organizations/:orgId/stats`

```
┌──────────────────────────────────────────────────┐
│  Organization Statistics: CS Club                │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│  │  3   │ │  45  │ │  78  │ │  12  │ │  38  │   │
│  │Progs │ │Membs │ │Enrol │ │Quiz  │ │Certs │   │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘   │
│                                                  │
│  Average Score: 82%                              │
│  Overall Pass Rate: 76%                          │
│                                                  │
│  [Bar Chart: Attempts per Quiz]                  │
│  [Donut Chart: Pass vs Fail]                     │
│  [Line Chart: Certificates over time]            │
│                                                  │
└──────────────────────────────────────────────────┘
```

### Quiz Statistics

**Route:** `/quizzes/:quizId/stats`

```
┌──────────────────────────────────────────────────┐
│  Quiz Statistics: Git Basics Final Quiz          │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│  │  25  │ │  82% │ │  95% │ │  60% │            │
│  │Atmpt │ │ Avg  │ │ High │ │ Low  │            │
│  └──────┘ └──────┘ └──────┘ └──────┘            │
│                                                  │
│  Pass Count: 19    Fail Count: 6                 │
│  Pass Rate: 76%                                  │
│                                                  │
│  [Donut Chart: Pass vs Fail]                     │
│  [Histogram: Score Distribution]                 │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 4.16 Audit Logs Page

**Route:** `/organizations/:orgId/audit-logs`

```
┌──────────────────────────────────────────────────┐
│  Audit Logs: CS Club                             │
├──────────────────────────────────────────────────┤
│  Filter by Action: [All ▼]                       │
│  Filter by Date:   [Date Range Picker]           │
├──────────────────────────────────────────────────┤
│  Time              Actor        Action           │
│  ──────────────    ──────────   ──────────────   │
│  Jan 15 10:45 AM   Ahmad        CERTIFICATE_ISSUED│
│  Jan 15 10:30 AM   Sara         ATTEMPT_SUBMITTED │
│  Jan 15 09:00 AM   Ahmad        QUIZ_PUBLISHED    │
│  Jan 14 08:00 AM   Ahmad        PROGRAM_CREATED   │
├──────────────────────────────────────────────────┤
│  « 1 2 3 »                                       │
└──────────────────────────────────────────────────┘
```

---

# 5. Component Architecture

## 5.1 Shared Components

| Component | Description |
| --- | --- |
| `AppNavbarComponent` | Top navigation bar |
| `AppSidebarComponent` | Collapsible sidebar |
| `PageHeaderComponent` | Page title + breadcrumb + action buttons |
| `StatCardComponent` | Single stat display card |
| `DataTableComponent` | Reusable paginated table |
| `ConfirmDialogComponent` | Reusable confirmation modal |
| `ToastComponent` | Success/error/warning toasts |
| `LoadingSpinnerComponent` | Full-page and inline loading states |
| `EmptyStateComponent` | Empty list placeholder with CTA |
| `PaginationComponent` | Page navigation controls |
| `StatusBadgeComponent` | Colored status badges (ACTIVE, REVOKED, etc.) |
| `AvatarComponent` | User avatar with initials fallback |
| `FileUploadComponent` | File upload with R2 presigned URL support |
| `ImageUploadComponent` | Image upload with Cloudinary support |

---

## 5.2 Feature Module Structure

```
src/
  app/
    core/
      interceptors/
        auth.interceptor.ts       ← Attaches Clerk JWT to requests
        error.interceptor.ts      ← Global HTTP error handling
      guards/
        auth.guard.ts             ← Requires Clerk session
        owner.guard.ts            ← Requires OWNER role in org
      services/
        api.service.ts            ← Base HTTP service
        auth.service.ts           ← Clerk session management
        user.service.ts           ← Current user profile

    shared/
      components/                 ← Shared UI components
      pipes/                      ← Date, status, truncate pipes
      models/                     ← TypeScript interfaces for API models

    features/
      landing/                    ← Landing page module
      auth/                       ← Sign in / sign up
      dashboard/                  ← Dashboard module
      profile/                    ← User profile
      organizations/              ← Organization management
      programs/                   ← Program management
      enrollments/                ← Enrollment management
      invitations/                ← Invitation links
      resources/                  ← Program resources
      quizzes/                    ← Quiz management and taking
      attempts/                   ← Attempt history and results
      certificates/               ← Certificate viewing
      statistics/                 ← Charts and stats
      audit-logs/                 ← Audit log viewer
      verification/               ← Public certificate verification
```

---

## 5.3 Angular Services

| Service | Responsibilities |
| --- | --- |
| `AuthService` | Clerk sign in, sign out, session, current user |
| `UserService` | Backend user profile, sync |
| `OrganizationService` | CRUD for organizations, member management |
| `ProgramService` | CRUD for programs, status changes |
| `EnrollmentService` | Enrollment management |
| `InvitationService` | Invitation creation, disable, join |
| `ResourceService` | Resource CRUD, file/image upload |
| `QuizService` | Quiz CRUD, publish, archive |
| `QuestionService` | Question CRUD |
| `OptionService` | Option CRUD |
| `AttemptService` | Start attempt, submit, view results |
| `CertificateService` | Issue, revoke, view certificates |
| `VerificationService` | Public certificate verification |
| `StatisticsService` | Fetch statistics data |
| `AuditLogService` | Fetch audit logs |
| `StorageService` | R2 presigned URLs, Cloudinary signatures |
| `ToastService` | Global toast notification management |

---

## 5.4 HTTP Interceptors

### Auth Interceptor

```typescript
// Attaches Clerk JWT token to every outgoing request
// Reads token from Clerk session
// Adds Authorization: Bearer <token> header
```

### Error Interceptor

```typescript
// Handles HTTP error responses globally
// 401 → redirect to sign-in
// 403 → show forbidden toast
// 404 → show not found page or toast
// 422 → show business rule error toast
// 500 → show generic error toast
```

---

## 5.5 Route Guards

### AuthGuard

```typescript
// Checks if user has an active Clerk session
// Redirects to /sign-in if not authenticated
```

### OwnerGuard

```typescript
// Checks if current user is OWNER of the organization in the route
// Redirects to /dashboard if not owner
```

---

# 6. State Management

## 6.1 Strategy

For the MVP, use **Angular Signals** with service-level state.

For complex state (quiz attempts, real-time timer), consider **NgRx**.

---

## 6.2 Key State Slices

| State | Location | Description |
| --- | --- | --- |
| Current user | `UserService` signal | Logged-in user profile |
| Current organization | `OrganizationService` signal | Selected organization context |
| Current program | `ProgramService` signal | Selected program context |
| Active attempt | `AttemptService` signal | In-progress quiz attempt + timer |
| Toast messages | `ToastService` signal | Active toast queue |

---

## 6.3 Quiz Attempt Timer

The quiz attempt timer runs client-side:

```typescript
// On attempt start:
// Store startedAt and expiresAt from API response
// Calculate remaining seconds = expiresAt - now
// Start countdown interval
// At 0: show expired warning and submit or prompt user
// Send submit request to backend
// Backend validates expires_at server-side regardless of client timer
```

---

# 7. User Flows

## 7.1 Owner: Create and Publish a Quiz

```
1. Navigate to Programs > Git Workshop > Quizzes
2. Click [+ Create Quiz]
3. Fill in title, passing score, duration, max attempts, certificate settings
4. Click [Create Quiz]
5. Redirected to Quiz Builder
6. Click [+ Add Question]
7. Fill in question text, type, points
8. Click [Add Question]
9. Click [+ Add Option] for each option
10. Mark one option as correct
11. Repeat for all questions
12. Review publish readiness checklist
13. Click [Publish Quiz]
14. Confirmation toast: "Quiz published successfully"
15. Quiz now visible to enrolled participants
```

---

## 7.2 Participant: Join and Complete a Quiz

```
1. Open invitation link
2. If not logged in → redirected to Clerk sign-in
3. After login → redirected to invitation join flow
4. Click [Join Program]
5. Enrollment created → redirected to program page
6. View program resources
7. Click on quiz → Quiz View page
8. Click [Start Quiz]
9. Answer each question
10. Click [Submit Quiz]
11. Confirm submission dialog
12. Attempt submitted
13. Redirected to Result page
14. If passed → certificate auto-issued
15. Click [View Certificate]
16. Certificate detail page with PDF download and QR code
```

---

## 7.3 Visitor: Verify a Certificate

```
1. Open /verify/A3FX9KL2MN8PQR7Z
2. Page auto-loads and calls verification API
3. If found and ACTIVE → show green valid card
4. If found and REVOKED → show red revoked card with reason
5. If not found → show gray not found card
6. No login required at any step
```

---

# 8. UI/UX Conventions

## 8.1 Status Badge Colors

| Status | Color |
| --- | --- |
| ACTIVE | Green |
| PUBLISHED | Blue |
| DRAFT | Gray |
| ARCHIVED | Orange |
| DELETED | Red |
| REVOKED | Red |
| IN\_PROGRESS | Yellow |
| SUBMITTED | Blue |
| EXPIRED | Orange |
| COMPLETED | Green |
| REMOVED | Gray |
| DISABLED | Gray |

---

## 8.2 Empty States

Every list page must show an empty state when there is no data:

```
┌──────────────────────────────────────┐
│                                      │
│    📋 No programs yet                │
│    Create your first program to      │
│    get started.                      │
│    [+ Create Program]                │
│                                      │
└──────────────────────────────────────┘
```

---

## 8.3 Loading States

Every data-dependent component must show a loading state:

- Skeleton loaders for list items
- Spinner for single resource loads
- Disabled buttons during form submission

---

## 8.4 Toast Notifications

| Trigger | Toast Type | Message Example |
| --- | --- | --- |
| Organization created | Success | "Organization created successfully" |
| Quiz published | Success | "Quiz is now published" |
| Certificate issued | Success | "Certificate issued to participant" |
| Certificate revoked | Warning | "Certificate has been revoked" |
| Validation error | Error | "Please fill in all required fields" |
| Business rule error | Error | "Max attempts reached" |
| Server error | Error | "Something went wrong. Please try again" |
| Link copied | Info | "Invitation link copied to clipboard" |

---

## 8.5 Confirmation Dialogs

Destructive actions must always show a confirmation dialog:

- Delete organization
- Remove member
- Archive program
- Archive quiz
- Revoke certificate
- Remove enrollment
- Disable invitation

---

## 8.6 Form Validation

All forms must show:

- inline field-level validation errors
- required field indicators (`*`)
- character counters for text fields with limits
- disabled submit button when form is invalid

---

## 8.7 Responsive Breakpoints

| Breakpoint | Behavior |
| --- | --- |
| Mobile (< 768px) | Sidebar hidden, hamburger menu, single column |
| Tablet (768–1024px) | Sidebar collapsible, two column grids |
| Desktop (> 1024px) | Full sidebar, multi-column grids, full tables |

---

# 9. Navigation and Routing Summary

```
/                                → Landing Page
/sign-in                         → Clerk Sign In
/sign-up                         → Clerk Sign Up
/verify/:code                    → Public Certificate Verification

/dashboard                       → Role-aware Dashboard
/profile                         → User Profile

/organizations/new               → Create Organization
/organizations/:orgId            → Organization Overview
/organizations/:orgId/members    → Members Management
/organizations/:orgId/settings   → Organization Settings
/organizations/:orgId/stats      → Organization Statistics
/organizations/:orgId/audit-logs → Audit Logs
/organizations/:orgId/certificates → Organization Certificates

/organizations/:orgId/programs/new  → Create Program
/programs/:programId             → Program Overview
/programs/:programId/enrollments → Enrollments
/programs/:programId/invitations → Invitations
/programs/:programId/resources   → Resources
/programs/:programId/quizzes     → Quizzes List
/programs/:programId/stats       → Program Statistics
/programs/:programId/settings    → Program Settings
/programs/:programId/learn       → Participant View

/programs/:programId/quizzes/new → Create Quiz
/quizzes/:quizId                 → Quiz Overview
/quizzes/:quizId/builder         → Quiz Builder (Owner)
/quizzes/:quizId/view            → Quiz View (Participant)
/quizzes/:quizId/attempt         → Take Quiz
/quizzes/:quizId/attempts        → All Attempts (Owner)
/quizzes/:quizId/stats           → Quiz Statistics
/quizzes/:quizId/settings        → Quiz Settings

/attempts/:attemptId/result      → Attempt Result

/my-enrollments                  → My Enrolled Programs
/my-attempts                     → My Quiz Attempts
/my-certificates                 → My Certificates
/certificates/:certificateId     → Certificate Detail
```

---

# 10. Final Notes

The Skillmark Angular frontend is designed to:

- consume the Skillmark REST API exclusively
- use Clerk for all authentication flows
- present different views based on organization role context
- provide a clean owner management experience
- provide a simple participant learning experience
- allow public certificate verification without login
- handle all API errors gracefully with user-friendly messages
- scale with the backend as new features are added in later phases