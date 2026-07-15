# Skillmark User Scenarios — Detailed

## Document Information
**Version:** 1.0  
**Purpose:** Comprehensive user scenarios covering all major user journeys  
**Audience:** Developers, Product Managers, QA Engineers, UX Designers

---

# Table of Contents

1. [Scenario Overview](#scenario-overview)
2. [Persona Definitions](#persona-definitions)
3. [Core User Journeys](#core-user-journeys)
4. [Detailed Scenarios](#detailed-scenarios)
5. [Edge Cases & Variations](#edge-cases--variations)
6. [API Request/Response Examples](#api-requestresponse-examples)

---

# 1. Scenario Overview

## 1.1 Scenario Categories

| Category | Scenarios | Coverage |
|----------|-----------|----------|
| **Onboarding** | 3 scenarios | First-time user experience |
| **Workshop Management** | 5 scenarios | Creation, publishing, enrollment |
| **Assessment & Grading** | 4 scenarios | Quiz taking, submission, grading |
| **Certification** | 3 scenarios | Issuance, download, verification |
| **Administration** | 4 scenarios | Member management, analytics |
| **Edge Cases** | 6 scenarios | Error handling, conflicts |

**Total Scenarios:** 25 detailed user journeys

---

# 2. Persona Definitions

## 2.1 Sarah Chen — Student Club President

```yaml
Name: Sarah Chen
Age: 21
Role: Computer Science Club President
Education: 3rd year Computer Science student
Tech Savvy: High
Goals:
  - Organize monthly technical workshops
  - Track member participation
  - Issue certificates to boost resumes
  - Grow club membership
Pain Points:
  - Manual attendance tracking
  - No proof of workshop completion
  - Hard to measure engagement
Tools Currently Used:
  - Google Forms for registration
  - Excel for tracking
  - WhatsApp for communication
```

## 2.2 Dr. Ahmad Hassan — University Instructor

```yaml
Name: Dr. Ahmad Hassan
Age: 38
Role: Senior Lecturer, Department of Software Engineering
Education: PhD in Computer Science
Tech Savvy: Medium
Goals:
  - Run professional training programs
  - Assess student knowledge
  - Provide verifiable certificates
  - Track student progress
Pain Points:
  - Time-consuming manual grading
  - Students lose certificates
  - Hard to verify completion
  - Limited analytics
Tools Currently Used:
  - Moodle (finds it complex)
  - Email for communication
  - PDF certificates
```

## 2.3 Layla Ibrahim — Training Coordinator

```yaml
Name: Layla Ibrahim
Age: 29
Role: Training & Development Coordinator
Organization: Tech Startup HR Department
Education: MBA
Tech Savvy: Medium
Goals:
  - Manage employee onboarding
  - Track training completion
  - Ensure compliance certifications
  - Report to management
Pain Points:
  - Multiple disconnected systems
  - Manual certificate tracking
  - No audit trail
  - Expensive LMS platforms
```

## 2.4 Omar Ali — Workshop Participant

```yaml
Name: Omar Ali
Age: 20
Role: Computer Engineering Student
Education: 2nd year undergraduate
Tech Savvy: Medium-High
Goals:
  - Learn new technical skills
  - Earn certificates for resume
  - Build portfolio
  - Network with peers
Pain Points:
  - Loses track of enrolled workshops
  - Certificates get lost
  - Unclear assessment criteria
  - No central place for achievements
```

## 2.5 Fatima Noor — HR Recruiter

```yaml
Name: Fatima Noor
Age: 32
Role: Technical Recruiter
Organization: Software Company
Tech Savvy: Medium
Goals:
  - Verify candidate credentials
  - Check training authenticity
  - Reduce hiring fraud
Pain Points:
  - Fake certificates
  - Time-consuming verification
  - Candidates claim unverifiable skills
```

---

# 3. Core User Journeys

## 3.1 Journey Map — Workshop Organizer

```
┌─────────────┐
│   Sign Up   │ → Auth authentication
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Create Workspace│ → Becomes ADMIN automatically
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Create Workshop │ → Draft status
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Add Resources  │ → Upload files, add links
└──────┬──────────┘
       │
       ▼
┌──────────────────┐
│Create Assessment │ → Add questions
└──────┬───────────┘
       │
       ▼
┌─────────────────┐
│Publish Workshop │ → Live for enrollment
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│Generate Invite  │ → Share code with students
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Monitor Progress│ → View stats, issue certificates
└─────────────────┘
```

## 3.2 Journey Map — Workshop Participant

```
┌─────────────┐
│   Sign Up   │ → Auth authentication
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Use Invite Code│ → Join workspace + workshop
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Browse Resources│ → Download materials, watch videos
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Take Assessment │ → Complete quiz
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Get Results    │ → See score, pass/fail
└──────┬──────────┘
       │
       ▼ (if passed)
┌─────────────────┐
│Get Certificate  │ → Download PDF, verify QR
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│Share/Verify     │ → Add to LinkedIn, share with employers
└─────────────────┘
```

---

# 4. Detailed Scenarios

---

## SCENARIO 1: First-Time Workspace Creation

### 👤 Actor
**Sarah Chen** — Student Club President

### 🎯 Goal
Create a new workspace for the Computer Science Club to manage workshops

### 📋 Preconditions
- Sarah has created a Auth account
- Sarah is logged in to the frontend application
- No existing workspaces created by Sarah

### 📝 Detailed Steps

#### Step 1: Navigate to Create Workspace
```
User Action:
  - Sarah clicks "Create Workspace" button on dashboard
  
System Response:
  - Display workspace creation form
  - Show fields: name, slug, description, logo (optional)
  - Slug auto-generates from name in real-time
```

#### Step 2: Fill Workspace Details
```
User Input:
  name: "Computer Science Club"
  slug: "cs-club" (auto-generated, editable)
  description: "Official CS Club at University of Technology. 
                We organize weekly workshops on programming, 
                web development, and emerging technologies."
  logo: [uploads cs-club-logo.png]

Validation:
  - Name: 3-100 characters ✓
  - Slug: 3-50 characters, lowercase, alphanumeric + hyphens ✓
  - Slug uniqueness: Check via API ✓
  - Description: max 1000 characters ✓
  - Logo: max 2MB, image formats only ✓
```

#### Step 3: Upload Logo
```
Frontend Action:
  POST /api/v1/resources/upload-url
  Body: {
    "fileName": "cs-club-logo.png",
    "contentType": "image/png",
    "fileSize": 145678
  }

Backend Response:
  {
    "success": true,
    "data": {
      "uploadUrl": "https://skillmark-files.r2.cloudflarestorage.com/...",
      "publicUrl": "https://files.skillmark.io/workspaces/temp/cs-club-logo.png",
      "expiresIn": 900
    }
  }

Frontend Action:
  PUT [uploadUrl]
  Body: [binary file data]
  Headers: Content-Type: image/png

R2 Response:
  200 OK
```

#### Step 4: Submit Workspace Creation
```
Frontend Action:
  POST /api/v1/workspaces
  Body: {
    "name": "Computer Science Club",
    "slug": "cs-club",
    "description": "Official CS Club at...",
    "logoUrl": "https://files.skillmark.io/workspaces/temp/cs-club-logo.png"
  }
  Headers:
    Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

Backend Processing:
  1. Verify Auth token ✓
  2. Extract user from token (auth_id: user_2a3b4c5d)
  3. Look up local user → User{id: 123e4567-e89b-12d3-a456-426614174000}
  4. Validate slug uniqueness ✓
  5. Create workspace record
  6. Create member record with role=ADMIN
  7. Log activity

Backend Response:
  201 Created
  {
    "success": true,
    "data": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Computer Science Club",
      "slug": "cs-club",
      "description": "Official CS Club at...",
      "logoUrl": "https://files.skillmark.io/workspaces/cs-club/logo.png",
      "createdAt": "2024-01-15T10:30:00Z",
      "role": "ADMIN",
      "membersCount": 1
    },
    "timestamp": "2024-01-15T10:30:00Z"
  }
```

#### Step 5: Redirect to Workspace Dashboard
```
System Action:
  - Store workspace ID in local state
  - Redirect to /workspaces/a1b2c3d4-e5f6-7890-abcd-ef1234567890
  - Display success message: "Workspace created successfully!"
  - Show onboarding tour: "Next: Create your first workshop"
```

### ✅ Success Criteria
- [x] Workspace created in database
- [x] Sarah is ADMIN member
- [x] Logo uploaded to R2
- [x] Activity log created: "workspace.created"
- [x] Sarah redirected to workspace dashboard
- [x] Workspace appears in Sarah's workspace list

### 🔄 Alternative Flows

#### 4.1a: Slug Already Exists
```
User Input: slug = "cs-club"
System Check: Workspace with slug "cs-club" exists

Response: 409 Conflict
{
  "success": false,
  "error": {
    "code": "DUPLICATE_SLUG",
    "message": "Workspace with this slug already exists",
    "details": [{
      "field": "slug",
      "message": "cs-club is already taken. Try cs-club-uot or cs-club-2024"
    }]
  }
}

User Action: Changes slug to "cs-club-uot"
System: Validates and proceeds
```

#### 4.1b: Logo Upload Fails
```
Scenario: R2 upload fails (network error)

System Action:
  - Display error: "Image upload failed. Please try again."
  - Allow retry without losing form data
  - Alternative: Proceed without logo (optional field)
  
User Action:
  - Clicks "Retry Upload" → Success
  - OR clicks "Skip Logo" → Proceed without logo
```

#### 4.1c: User Token Expired During Form Fill
```
Scenario: User spent 10 minutes on form, token expired

Frontend Detection:
  - POST /api/v1/workspaces returns 401
  
Frontend Action:
  - Save form data to localStorage
  - Redirect to Auth login
  - After login, restore form data
  - Submit workspace creation
```

### 📊 Expected Database State After Scenario

**workspaces table:**
```sql
INSERT INTO workspaces VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Computer Science Club',
  'cs-club',
  'Official CS Club at...',
  'https://files.skillmark.io/workspaces/cs-club/logo.png',
  '123e4567-e89b-12d3-a456-426614174000', -- created_by (Sarah's user ID)
  '2024-01-15 10:30:00',
  '2024-01-15 10:30:00'
);
```

**members table:**
```sql
INSERT INTO members VALUES (
  'b2c3d4e5-f6g7-8901-bcde-f12345678901',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', -- workspace_id
  '123e4567-e89b-12d3-a456-426614174000', -- user_id (Sarah)
  'ADMIN',
  '2024-01-15 10:30:00'
);
```

**activity_logs table:**
```sql
INSERT INTO activity_logs VALUES (
  'c3d4e5f6-g7h8-9012-cdef-123456789012',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890', -- workspace_id
  '123e4567-e89b-12d3-a456-426614174000', -- user_id
  'workspace.created',
  'Workspace',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '{"name":"Computer Science Club","slug":"cs-club"}',
  '192.168.1.100',
  'Mozilla/5.0...',
  '2024-01-15 10:30:00'
);
```

---

## SCENARIO 2: Creating and Publishing a Workshop

### 👤 Actor
**Sarah Chen** — Workspace Admin

### 🎯 Goal
Create a workshop on "Introduction to Git & GitHub" and publish it for enrollment

### 📋 Preconditions
- Sarah has workspace "Computer Science Club" (from Scenario 1)
- Sarah is logged in and viewing workspace dashboard
- Sarah is ADMIN of the workspace

### 📝 Detailed Steps

#### Step 1: Initiate Workshop Creation
```
User Action:
  - Sarah navigates to Workshops tab
  - Clicks "Create Workshop" button

System Response:
  GET /api/v1/workspaces/a1b2c3d4-e5f6-7890-abcd-ef1234567890/workshops
  Response: { "data": [], "pagination": {...} } // Empty, first workshop
  
  - Display workshop creation form
  - Status defaults to DRAFT
```

#### Step 2: Fill Workshop Details
```
User Input:
  title: "Introduction to Git & GitHub"
  description: "Learn version control basics, GitHub workflow, 
                and collaborative development practices. 
                Perfect for beginners!"
  coverImage: [uploads workshop-cover.jpg]
  startsAt: "2024-02-01T14:00:00Z"
  endsAt: "2024-02-01T17:00:00Z"
```

#### Step 3: Upload Cover Image
```
Frontend Action:
  POST /api/v1/resources/upload-url
  Body: {
    "fileName": "git-workshop-cover.jpg",
    "contentType": "image/jpeg",
    "fileSize": 234567
  }

Backend Response:
  {
    "success": true,
    "data": {
      "uploadUrl": "https://skillmark-files.r2.cloudflarestorage.com/temp/xyz...",
      "publicUrl": "https://files.skillmark.io/workshops/temp/git-workshop-cover.jpg",
      "expiresIn": 900
    }
  }

Frontend uploads image to R2 → Success
```

#### Step 4: Create Workshop (Draft)
```
Frontend Action:
  POST /api/v1/workspaces/a1b2c3d4-e5f6-7890-abcd-ef1234567890/workshops
  Body: {
    "title": "Introduction to Git & GitHub",
    "description": "Learn version control basics...",
    "coverImageUrl": "https://files.skillmark.io/workshops/temp/git-workshop-cover.jpg",
    "startsAt": "2024-02-01T14:00:00Z",
    "endsAt": "2024-02-01T17:00:00Z"
  }

Backend Processing:
  1. Verify user is ADMIN or INSTRUCTOR of workspace ✓
  2. Validate dates (endsAt > startsAt) ✓
  3. Create workshop with status=DRAFT
  4. Move cover image from temp to permanent location
  5. Log activity

Backend Response:
  201 Created
  {
    "success": true,
    "data": {
      "id": "w1w2w3w4-w5w6-w7w8-w9w0-w1w2w3w4w5w6",
      "workspaceId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "title": "Introduction to Git & GitHub",
      "description": "Learn version control basics...",
      "coverImageUrl": "https://files.skillmark.io/workshops/w1w2w3w4/cover.jpg",
      "status": "DRAFT",
      "startsAt": "2024-02-01T14:00:00Z",
      "endsAt": "2024-02-01T17:00:00Z",
      "createdAt": "2024-01-15T11:00:00Z",
      "enrolledCount": 0,
      "resourcesCount": 0,
      "assessmentsCount": 0
    }
  }
```

#### Step 5: Add Learning Resources
```
Sarah adds 3 resources:

Resource 1 (Link):
  POST /api/v1/workshops/w1w2w3w4-w5w6-w7w8-w9w0-w1w2w3w4w5w6/resources
  Body: {
    "title": "Git Official Documentation",
    "type": "LINK",
    "url": "https://git-scm.com/doc",
    "description": "Official Git documentation",
    "position": 0
  }
  Response: 201 Created

Resource 2 (PDF):
  1. Request upload URL
  2. Upload PDF to R2: "git-cheatsheet.pdf"
  3. Create resource:
     POST /api/v1/workshops/w1w2w3w4.../resources
     Body: {
       "title": "Git Commands Cheat Sheet",
       "type": "DOCUMENT",
       "url": "https://files.skillmark.io/workshops/w1w2w3w4/resources/cheatsheet.pdf",
       "storageKey": "workshops/w1w2w3w4/resources/abc123-cheatsheet.pdf",
       "position": 1
     }

Resource 3 (Video):
  POST /api/v1/workshops/w1w2w3w4.../resources
  Body: {
    "title": "Git Basics Tutorial",
    "type": "VIDEO",
    "url": "https://youtube.com/watch?v=abc123",
    "position": 2
  }
```

#### Step 6: Verify Publishing Requirements
```
Sarah clicks "Publish Workshop"

Frontend Pre-check:
  GET /api/v1/workshops/w1w2w3w4-w5w6-w7w8-w9w0-w1w2w3w4w5w6

Backend Response:
  {
    "data": {
      "id": "w1w2w3w4...",
      "status": "DRAFT",
      "resourcesCount": 3,
      "assessmentsCount": 0,
      "canPublish": false,
      "publishRequirements": {
        "hasTitle": true,
        "hasDescription": true,
        "hasResources": true,
        "hasAssessment": false ← blocking
      }
    }
  }

Frontend displays:
  ⚠️ "Cannot publish: Workshop needs at least one assessment"
  [Create Assessment] button highlighted
```

#### Step 7: Create Assessment (will be detailed in Scenario 3)
```
Sarah creates a 10-question quiz (see Scenario 3)
Assessment ID: "a1a2a3a4-a5a6-a7a8-a9a0-a1a2a3a4a5a6"
Status: PUBLISHED
```

#### Step 8: Publish Workshop
```
Frontend Action:
  PATCH /api/v1/workshops/w1w2w3w4-w5w6-w7w8-w9w0-w1w2w3w4w5w6/publish
  Body: {} // No body needed, action is in URL

Backend Processing:
  1. Verify user permissions (ADMIN or INSTRUCTOR) ✓
  2. Check workshop has resources ✓
  3. Check workshop has at least one assessment ✓
  4. Check assessment is published ✓
  5. Update workshop.status = 'PUBLISHED'
  6. Log activity

Backend Response:
  200 OK
  {
    "success": true,
    "data": {
      "id": "w1w2w3w4...",
      "status": "PUBLISHED",
      "publishedAt": "2024-01-15T11:30:00Z"
    },
    "message": "Workshop published successfully"
  }
```

#### Step 9: Generate Invite Link
```
Sarah clicks "Generate Invite Code"

Frontend Action:
  POST /api/v1/workspaces/a1b2c3d4.../invites
  Body: {
    "workshopId": "w1w2w3w4-w5w6-w7w8-w9w0-w1w2w3w4w5w6",
    "role": "MEMBER"
  }

Backend Processing:
  1. Generate unique 12-char code: "GIT2024WK1AB"
  2. Verify uniqueness
  3. Create invite record

Backend Response:
  201 Created
  {
    "success": true,
    "data": {
      "id": "i1i2i3i4-i5i6-i7i8-i9i0-i1i2i3i4i5i6",
      "code": "GIT2024WK1AB",
      "workshopId": "w1w2w3w4...",
      "inviteUrl": "https://app.skillmark.io/join/GIT2024WK1AB"
    }
  }
```

#### Step 10: Share Invite
```
Frontend displays shareable card:

┌─────────────────────────────────────────┐
│  📚 Join Workshop                       │
│                                         │
│  Introduction to Git & GitHub           │
│  Computer Science Club                  │
│                                         │
│  Code: GIT2024WK1AB                     │
│                                         │
│  🔗 https://app.skillmark.io/join/      │
│      GIT2024WK1AB                       │
│                                         │
│  [Copy Link] [Share via WhatsApp]       │
│  [Share via Email]                      │
└─────────────────────────────────────────┘

Sarah copies link and posts to club WhatsApp group
```

### ✅ Success Criteria
- [x] Workshop created in DRAFT status
- [x] 3 resources added
- [x] Workshop published after adding assessment
- [x] Invite code generated and shareable
- [x] Workshop appears in public workspace workshop list
- [x] Activity logs created for all actions

### 🔄 Alternative Flows

#### 2.1a: Try to Publish Without Assessment
```
User attempts to publish

Response: 422 Unprocessable Entity
{
  "success": false,
  "error": {
    "code": "PUBLISH_REQUIREMENTS_NOT_MET",
    "message": "Workshop cannot be published",
    "details": [
      {
        "requirement": "hasAssessment",
        "message": "Workshop must have at least one published assessment"
      }
    ]
  }
}
```

#### 2.1b: Workshop Date Validation
```
User sets endsAt before startsAt

Response: 400 Bad Request
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid workshop dates",
    "details": [
      {
        "field": "endsAt",
        "message": "End date must be after start date"
      }
    ]
  }
}
```

---

## SCENARIO 3: Participant Joins Workshop Using Invite

### 👤 Actor
**Omar Ali** — Student

### 🎯 Goal
Join the "Introduction to Git & GitHub" workshop using invite code

### 📋 Preconditions
- Omar has created Auth account and logged in
- Sarah has published workshop and generated invite code "GIT2024WK1AB"
- Omar received invite link via WhatsApp

### 📝 Detailed Steps

#### Step 1: Click Invite Link
```
User Action:
  - Omar clicks https://app.skillmark.io/join/GIT2024WK1AB
  
Frontend Action:
  - Extract code from URL: "GIT2024WK1AB"
  - Check if user is authenticated
  - If not, redirect to Auth sign-in with returnTo parameter
  - If yes, fetch invite preview
```

#### Step 2: Preview Invite (Before Accepting)
```
Frontend Action:
  GET /api/v1/invites/GIT2024WK1AB/preview
  Headers: Authorization: Bearer [Omar's token]

Backend Response:
  200 OK
  {
    "success": true,
    "data": {
      "valid": true,
      "workspace": {
        "name": "Computer Science Club",
        "logoUrl": "https://files.skillmark.io/workspaces/cs-club/logo.png"
      },
      "workshop": {
        "title": "Introduction to Git & GitHub",
        "description": "Learn version control basics...",
        "coverImageUrl": "https://files.skillmark.io/workshops/w1w2w3w4/cover.jpg",
        "startsAt": "2024-02-01T14:00:00Z",
        "endsAt": "2024-02-01T17:00:00Z"
      },
      "invite": {
        "valid": true
      }
    }
  }
```

#### Step 3: Display Preview Page
```
Frontend displays:

┌─────────────────────────────────────────────┐
│                                             │
│  [CS Club Logo]                             │
│  Computer Science Club                      │
│                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                             │
│  📚 You're invited to join                  │
│                                             │
│  Introduction to Git & GitHub               │
│                                             │
│  Learn version control basics, GitHub       │
│  workflow, and collaborative development... │
│                                             │
│  📅 Feb 1, 2024 • 2:00 PM - 5:00 PM        │
│  👥 12 participants enrolled                │
│                                             │
│  [ Accept Invitation ]                      │
│                                             │
└─────────────────────────────────────────────┘
```

#### Step 4: Accept Invitation
```
User Action:
  - Omar clicks "Accept Invitation"

Frontend Action:
  POST /api/v1/invites/accept
  Body: {
    "code": "GIT2024WK1AB"
  }
  Headers: Authorization: Bearer [Omar's token]

Backend Processing:
  1. Verify token → User ID: "omar123..."
  2. Find invite by code ✓
  3. Validate invite:
     - Status is active ✓
     - Program is published and not deleted ✓
  4. Check duplicate enrollment:
     SELECT * FROM enrollments 
     WHERE workshop_id = ? AND user_id = ?
     Result: None ✓
  5. Begin transaction:
     a. Check workspace membership:
        SELECT * FROM members 
        WHERE workspace_id = ? AND user_id = ?
        Result: None
     b. Create workspace membership:
        INSERT INTO members (workspace_id, user_id, role)
        VALUES (?, ?, 'MEMBER')
     c. Create workshop enrollment:
        INSERT INTO enrollments (workshop_id, user_id)
        VALUES (?, ?)
  6. Commit transaction
  7. Log activity

Backend Response:
  201 Created
  {
    "success": true,
    "data": {
      "workspace": {
        "id": "a1b2c3d4...",
        "name": "Computer Science Club",
        "role": "MEMBER"
      },
      "workshop": {
        "id": "w1w2w3w4...",
        "title": "Introduction to Git & GitHub",
        "enrolledAt": "2024-01-16T09:15:00Z"
      },
      "enrollment": {
        "id": "e1e2e3e4-e5e6-e7e8-e9e0-e1e2e3e4e5e6",
        "status": "ACTIVE"
      }
    },
    "message": "Successfully joined workshop!"
  }
```

#### Step 5: Redirect to Workshop Page
```
Frontend Action:
  - Store enrollment in local state
  - Redirect to /workshops/w1w2w3w4-w5w6-w7w8-w9w0-w1w2w3w4w5w6
  - Display success toast: "Welcome! You've joined Introduction to Git & GitHub"
```

#### Step 6: View Workshop Dashboard
```
Frontend loads workshop page:

GET /api/v1/workshops/w1w2w3w4-w5w6-w7w8-w9w0-w1w2w3w4w5w6
Headers: Authorization: Bearer [Omar's token]

Backend Response:
  200 OK
  {
    "success": true,
    "data": {
      "id": "w1w2w3w4...",
      "title": "Introduction to Git & GitHub",
      "description": "Learn version control basics...",
      "coverImageUrl": "https://files.skillmark.io/workshops/w1w2w3w4/cover.jpg",
      "status": "PUBLISHED",
      "startsAt": "2024-02-01T14:00:00Z",
      "endsAt": "2024-02-01T17:00:00Z",
      "enrolledCount": 13,
      "resourcesCount": 3,
      "assessmentsCount": 1,
      "userEnrolled": true,
      "userRole": "MEMBER" // in workspace
    }
  }
```

#### Step 7: Browse Resources
```
GET /api/v1/workshops/w1w2w3w4.../resources

Backend checks:
  1. User is enrolled ✓
  2. Filter resources by isVisible = true

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "r1r2r3r4...",
      "title": "Git Official Documentation",
      "type": "LINK",
      "url": "https://git-scm.com/doc",
      "position": 0
    },
    {
      "id": "r2r3r4r5...",
      "title": "Git Commands Cheat Sheet",
      "type": "DOCUMENT",
      "url": "https://files.skillmark.io/workshops/w1w2w3w4/resources/cheatsheet.pdf",
      "fileSize": 524288,
      "mimeType": "application/pdf",
      "position": 1
    },
    {
      "id": "r3r4r5r6...",
      "title": "Git Basics Tutorial",
      "type": "VIDEO",
      "url": "https://youtube.com/watch?v=abc123",
      "position": 2
    }
  ]
}

Omar downloads the PDF and watches the video
```

### ✅ Success Criteria
- [x] Omar created as workspace member with MEMBER role
- [x] Omar enrolled in workshop
- [x] Invite usage count incremented (12 → 13)
- [x] Omar can access workshop resources
- [x] Activity log created
- [x] Email notification sent (if implemented)

### 🔄 Alternative Flows

#### 3.1a: Invite Code Disabled
```
Scenario: Omar tries to use a disabled invite

GET /api/v1/invites/DISABLED123/preview

Response: 422 Unprocessable Entity
{
  "success": false,
  "error": {
    "code": "INVITE_DISABLED",
    "message": "This invitation is no longer active"
  }
}

Frontend displays:
  ⚠️ "This invitation is no longer active. 
      Please contact the organizer for a new invite."
```

#### 3.1b: Already Enrolled
```
Scenario: Omar clicks invite link again

POST /api/v1/invites/accept
Body: {"code": "GIT2024WK1AB"}

Response: 409 Conflict
{
  "success": false,
  "error": {
    "code": "ALREADY_ENROLLED",
    "message": "You are already enrolled in this workshop",
    "details": [{
      "enrolledAt": "2024-01-16T09:15:00Z",
      "workshopUrl": "/workshops/w1w2w3w4..."
    }]
  }
}

Frontend displays:
  "You're already enrolled! Redirecting to workshop..."
  [Auto-redirect after 2 seconds]
```

#### 3.1c: Concurrent Enrollment (Race Condition)
```
Scenario: 2 users click the same invite link simultaneously

User A: POST /api/v1/invites/accept at T+0ms
User B: POST /api/v1/invites/accept at T+5ms

Backend handling:
  Both transactions create enrollments independently.
  Since there's no usage limit, both succeed.

Result: Both users enroll successfully ✓
```

---

## SCENARIO 4: Creating and Publishing an Assessment

### 👤 Actor
**Sarah Chen** — Workshop Creator

### 🎯 Goal
Create a 10-question assessment for the Git workshop

### 📋 Preconditions
- Workshop "Introduction to Git & GitHub" exists
- Sarah is ADMIN of workspace
- Workshop is in DRAFT status (assessment needed for publishing)

### 📝 Detailed Steps

#### Step 1: Start Assessment Creation
```
User Action:
  - Sarah navigates to workshop page
  - Clicks "Assessments" tab
  - Clicks "Create Assessment"

System displays form with fields:
  - Title
  - Description
  - Instructions
  - Passing score (1-100)
  - Duration (minutes)
  - Max attempts
  - Auto-issue certificate (toggle)
```

#### Step 2: Fill Assessment Details
```
User Input:
  title: "Git Fundamentals Quiz"
  description: "Test your understanding of Git basics and GitHub workflow"
  instructions: "- Read each question carefully
                 - You have 30 minutes to complete
                 - You can attempt up to 3 times
                 - Passing score is 70%
                 - Good luck!"
  passingScore: 70
  durationMinutes: 30
  maxAttempts: 3
  autoIssueCertificate: true
```

#### Step 3: Create Assessment
```
POST /api/v1/workshops/w1w2w3w4.../assessments
Body: {
  "title": "Git Fundamentals Quiz",
  "description": "Test your understanding...",
  "instructions": "- Read each question carefully...",
  "passingScore": 70,
  "durationMinutes": 30,
  "maxAttempts": 3,
  "autoIssueCertificate": true
}

Backend Processing:
  1. Verify user has ADMIN or INSTRUCTOR role ✓
  2. Validate passing score (1-100) ✓
  3. Validate duration (min 5 minutes) ✓
  4. Validate max attempts (min 1) ✓
  5. Create assessment with status=DRAFT

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "a1a2a3a4-a5a6-a7a8-a9a0-a1a2a3a4a5a6",
    "workshopId": "w1w2w3w4...",
    "title": "Git Fundamentals Quiz",
    "status": "DRAFT",
    "passingScore": 70,
    "durationMinutes": 30,
    "maxAttempts": 3,
    "autoIssueCertificate": true,
    "questionsCount": 0,
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

#### Step 4: Add Questions (Batch)
```
Sarah uses batch question creation for efficiency:

POST /api/v1/assessments/a1a2a3a4.../questions/batch
Body: {
  "questions": [
    {
      "text": "What does Git stand for?",
      "explanation": "Git is named after the British slang word 'git'",
      "points": 1,
      "position": 0,
      "answers": [
        {"text": "Global Information Tracker", "isCorrect": false, "position": 0},
        {"text": "It's just a name, not an acronym", "isCorrect": true, "position": 1},
        {"text": "General Integration Tool", "isCorrect": false, "position": 2},
        {"text": "Graphics Interface Terminal", "isCorrect": false, "position": 3}
      ]
    },
    {
      "text": "Which command initializes a new Git repository?",
      "points": 1,
      "position": 1,
      "answers": [
        {"text": "git start", "isCorrect": false, "position": 0},
        {"text": "git init", "isCorrect": true, "position": 1},
        {"text": "git create", "isCorrect": false, "position": 2},
        {"text": "git new", "isCorrect": false, "position": 3}
      ]
    },
    {
      "text": "What is a commit in Git?",
      "points": 1,
      "position": 2,
      "answers": [
        {"text": "A snapshot of your repository at a specific point", "isCorrect": true, "position": 0},
        {"text": "A branch in the repository", "isCorrect": false, "position": 1},
        {"text": "A remote server connection", "isCorrect": false, "position": 2},
        {"text": "A merge conflict", "isCorrect": false, "position": 3}
      ]
    },
    {
      "text": "Which command shows the current status of your repository?",
      "points": 1,
      "position": 3,
      "answers": [
        {"text": "git state", "isCorrect": false, "position": 0},
        {"text": "git status", "isCorrect": true, "position": 1},
        {"text": "git info", "isCorrect": false, "position": 2},
        {"text": "git check", "isCorrect": false, "position": 3}
      ]
    },
    {
      "text": "What does 'git clone' do?",
      "points": 1,
      "position": 4,
      "answers": [
        {"text": "Creates a copy of a remote repository", "isCorrect": true, "position": 0},
        {"text": "Duplicates a commit", "isCorrect": false, "position": 1},
        {"text": "Copies a branch", "isCorrect": false, "position": 2},
        {"text": "Clones your SSH keys", "isCorrect": false, "position": 3}
      ]
    },
    {
      "text": "Which command stages changes for commit?",
      "points": 1,
      "position": 5,
      "answers": [
        {"text": "git stage", "isCorrect": false, "position": 0},
        {"text": "git prepare", "isCorrect": false, "position": 1},
        {"text": "git add", "isCorrect": true, "position": 2},
        {"text": "git commit", "isCorrect": false, "position": 3}
      ]
    },
    {
      "text": "What is a branch in Git?",
      "points": 1,
      "position": 6,
      "answers": [
        {"text": "A parallel version of the repository", "isCorrect": true, "position": 0},
        {"text": "A type of commit", "isCorrect": false, "position": 1},
        {"text": "A remote server", "isCorrect": false, "position": 2},
        {"text": "A file in the repository", "isCorrect": false, "position": 3}
      ]
    },
    {
      "text": "Which command pushes changes to a remote repository?",
      "points": 1,
      "position": 7,
      "answers": [
        {"text": "git send", "isCorrect": false, "position": 0},
        {"text": "git upload", "isCorrect": false, "position": 1},
        {"text": "git push", "isCorrect": true, "position": 2},
        {"text": "git sync", "isCorrect": false, "position": 3}
      ]
    },
    {
      "text": "What does 'git pull' do?",
      "points": 1,
      "position": 8,
      "answers": [
        {"text": "Downloads and merges remote changes", "isCorrect": true, "position": 0},
        {"text": "Removes files from staging", "isCorrect": false, "position": 1},
        {"text": "Deletes a branch", "isCorrect": false, "position": 2},
        {"text": "Creates a new commit", "isCorrect": false, "position": 3}
      ]
    },
    {
      "text": "What is GitHub?",
      "points": 1,
      "position": 9,
      "answers": [
        {"text": "A Git command-line tool", "isCorrect": false, "position": 0},
        {"text": "A web-based Git repository hosting service", "isCorrect": true, "position": 1},
        {"text": "A programming language", "isCorrect": false, "position": 2},
        {"text": "A type of database", "isCorrect": false, "position": 3}
      ]
    }
  ]
}

Backend Processing:
  1. Verify assessment ownership ✓
  2. Validate each question:
     - Has text ✓
     - Has 2-6 answers ✓
     - Has exactly one correct answer ✓
     - Points > 0 ✓
  3. Begin transaction
  4. Insert all questions
  5. Insert all answers
  6. Commit transaction

Response: 201 Created
{
  "success": true,
  "data": {
    "questionsCreated": 10,
    "answersCreated": 40,
    "totalPoints": 10
  },
  "message": "Successfully created 10 questions"
}
```

#### Step 5: Review Assessment
```
GET /api/v1/assessments/a1a2a3a4.../questions

Response:
{
  "success": true,
  "data": [
    {
      "id": "q1q2q3q4...",
      "text": "What does Git stand for?",
      "explanation": "Git is named after the British slang word 'git'",
      "points": 1,
      "position": 0,
      "answers": [
        {"id": "ans1...", "text": "Global Information Tracker", "position": 0},
        {"id": "ans2...", "text": "It's just a name, not an acronym", "position": 1},
        {"id": "ans3...", "text": "General Integration Tool", "position": 2},
        {"id": "ans4...", "text": "Graphics Interface Terminal", "position": 3}
      ]
    },
    // ... 9 more questions
  ]
}

Note: isCorrect field is NOT included in response (security)
```

#### Step 6: Publish Assessment
```
Sarah clicks "Publish Assessment"

Frontend Action:
  PATCH /api/v1/assessments/a1a2a3a4.../publish

Backend Validation:
  1. Verify user has ADMIN/INSTRUCTOR role ✓
  2. Count questions: SELECT COUNT(*) FROM questions WHERE assessment_id = ?
     Result: 10 ✓ (minimum 3 required)
  3. Validate each question has 2-6 answers ✓
  4. Validate each question has exactly 1 correct answer ✓
  5. Update status to PUBLISHED

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "a1a2a3a4...",
    "status": "PUBLISHED",
    "publishedAt": "2024-01-15T12:30:00Z",
    "questionsCount": 10,
    "totalPoints": 10,
    "isLive": true
  },
  "message": "Assessment published successfully"
}
```

### ✅ Success Criteria
- [x] Assessment created with correct settings
- [x] 10 questions created with 4 answers each
- [x] Each question has exactly one correct answer
- [x] Assessment published successfully
- [x] Assessment now visible to enrolled participants
- [x] Workshop can now be published (requirement met)

### 🔄 Alternative Flows

#### 4.1a: Try to Publish with Insufficient Questions
```
Scenario: Assessment has only 2 questions

PATCH /api/v1/assessments/a1a2a3a4.../publish

Response: 422 Unprocessable Entity
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_QUESTIONS",
    "message": "Cannot publish assessment",
    "details": [{
      "requirement": "minQuestions",
      "expected": 3,
      "actual": 2,
      "message": "Assessment must have at least 3 questions"
    }]
  }
}
```

#### 4.1b: Question Missing Correct Answer
```
Scenario: Question has no correct answer

POST /api/v1/assessments/a1a2a3a4.../questions/batch

Backend validates:
  Question 5: all answers have isCorrect = false

Response: 400 Bad Request
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid question configuration",
    "details": [{
      "field": "questions[5].answers",
      "message": "Question must have exactly one correct answer"
    }]
  }
}
```

#### 4.1c: Try to Edit Published Assessment with Submissions
```
Scenario: 15 students have already taken the assessment

PATCH /api/v1/questions/q1q2q3q4...
Body: {"text": "Updated question text"}

Backend checks:
  SELECT COUNT(*) FROM submissions WHERE assessment_id = ?
  Result: 15

Response: 422 Unprocessable Entity
{
  "success": false,
  "error": {
    "code": "ASSESSMENT_HAS_SUBMISSIONS",
    "message": "Cannot modify published assessment with submissions",
    "details": [{
      "submissionsCount": 15,
      "suggestion": "Archive this assessment and create a new version"
    }]
  }
}
```

---

## SCENARIO 5: Taking an Assessment

### 👤 Actor
**Omar Ali** — Student

### 🎯 Goal
Complete the "Git Fundamentals Quiz" and pass with score ≥ 70%

### 📋 Preconditions
- Omar is enrolled in workshop
- Assessment is published
- Omar has not exceeded max attempts (3)
- Omar has no active (IN_PROGRESS) submission

### 📝 Detailed Steps

#### Step 1: View Available Assessments
```
Omar navigates to workshop → Assessments tab

GET /api/v1/workshops/w1w2w3w4.../assessments
Headers: Authorization: Bearer [Omar's token]

Backend checks:
  1. User is enrolled in workshop ✓
  2. Filter: status = 'PUBLISHED'

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "a1a2a3a4-a5a6-a7a8-a9a0-a1a2a3a4a5a6",
      "title": "Git Fundamentals Quiz",
      "description": "Test your understanding...",
      "instructions": "- Read each question carefully...",
      "passingScore": 70,
      "durationMinutes": 30,
      "maxAttempts": 3,
      "questionsCount": 10,
      "totalPoints": 10,
      "userAttempts": 0,
      "remainingAttempts": 3,
      "bestScore": null,
      "canAttempt": true
    }
  ]
}
```

#### Step 2: Start Assessment
```
Omar clicks "Start Assessment"

Frontend displays pre-assessment screen:
┌─────────────────────────────────────────┐
│  Git Fundamentals Quiz                  │
│                                         │
│  Instructions:                          │
│  - Read each question carefully         │
│  - You have 30 minutes to complete      │
│  - You can attempt up to 3 times        │
│  - Passing score is 70%                 │
│  - Good luck!                           │
│                                         │
│  📊 10 questions • 10 points total      │
│  ⏱️ 30 minutes duration                 │
│  🎯 70% passing score                   │
│  🔄 3 attempts allowed                  │
│                                         │
│  [ Cancel ]    [ Start Assessment ]     │
└─────────────────────────────────────────┘

Omar clicks "Start Assessment"

POST /api/v1/assessments/a1a2a3a4.../submissions

Backend Processing:
  1. Verify user is enrolled ✓
  2. Check assessment is published ✓
  3. Count existing attempts:
     SELECT COUNT(*) FROM submissions 
     WHERE assessment_id = ? AND user_id = ?
     Result: 0 ✓
  4. Check max attempts: 0 < 3 ✓
  5. Check for active submission:
     SELECT * FROM submissions 
     WHERE assessment_id = ? AND user_id = ? AND status = 'IN_PROGRESS'
     Result: None ✓
  6. Calculate expiry:
     expiresAt = NOW() + 30 minutes = 2024-01-16 10:45:00
  7. Create submission:
     attempt_number = 1
     status = 'IN_PROGRESS'
     started_at = 2024-01-16 10:15:00
     expires_at = 2024-01-16 10:45:00

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "s1s2s3s4-s5s6-s7s8-s9s0-s1s2s3s4s5s6",
    "assessmentId": "a1a2a3a4...",
    "attemptNumber": 1,
    "status": "IN_PROGRESS",
    "startedAt": "2024-01-16T10:15:00Z",
    "expiresAt": "2024-01-16T10:45:00Z",
    "timeRemaining": 1800 // seconds
  }
}
```

#### Step 3: Load Questions
```
GET /api/v1/assessments/a1a2a3a4.../questions
Headers: Authorization: Bearer [Omar's token]

Backend checks:
  - User is enrolled ✓
  - Assessment is published ✓
  - Exclude isCorrect field from responses (security)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "q1q2q3q4...",
      "text": "What does Git stand for?",
      "points": 1,
      "position": 0,
      "answers": [
        {"id": "a1a1a1a1...", "text": "Global Information Tracker", "position": 0},
        {"id": "a2a2a2a2...", "text": "It's just a name, not an acronym", "position": 1},
        {"id": "a3a3a3a3...", "text": "General Integration Tool", "position": 2},
        {"id": "a4a4a4a4...", "text": "Graphics Interface Terminal", "position": 3}
      ]
    },
    // ... 9 more questions (isCorrect NOT included)
  ]
}
```

#### Step 4: Answer Questions
```
Frontend displays quiz interface with timer:

┌─────────────────────────────────────────┐
│  Git Fundamentals Quiz                  │
│  ⏱️ Time Remaining: 29:45               │
│  Progress: 1/10                         │
│                                         │
│  Question 1 of 10 (1 point)             │
│                                         │
│  What does Git stand for?               │
│                                         │
│  ○ Global Information Tracker           │
│  ○ It's just a name, not an acronym     │
│  ○ General Integration Tool             │
│  ○ Graphics Interface Terminal          │
│                                         │
│  [ Previous ]  [ Next ]  [ Submit ]     │
└─────────────────────────────────────────┘

Omar selects answers for all 10 questions:
  Q1: a2a2a2a2... (correct)
  Q2: a2a2a2a2... (correct) 
  Q3: a1a1a1a1... (correct)
  Q4: a2a2a2a2... (correct)
  Q5: a1a1a1a1... (correct)
  Q6: a3a3a3a3... (correct)
  Q7: a1a1a1a1... (correct)
  Q8: a1a1a1a1... (incorrect - selected "git send" instead of "git push")
  Q9: a1a1a1a1... (correct)
  Q10: a2a2a2a2... (correct)

Frontend stores selections in local state (not sent to backend yet)
```

#### Step 5: Submit Assessment
```
Omar clicks "Submit Assessment"

Frontend shows confirmation:
┌─────────────────────────────────────────┐
│  Submit Assessment?                     │
│                                         │
│  You've answered 10/10 questions        │
│  Time remaining: 12:23                  │
│                                         │
│  Once submitted, you cannot change      │
│  your answers.                          │
│                                         │
│  [ Cancel ]    [ Submit ]               │
└─────────────────────────────────────────┘

Omar confirms

POST /api/v1/submissions/s1s2s3s4.../submit
Body: {
  "responses": [
    {"questionId": "q1q2q3q4...", "answerId": "a2a2a2a2..."},
    {"questionId": "q2q3q4q5...", "answerId": "a2a2a2a2..."},
    {"questionId": "q3q4q5q6...", "answerId": "a1a1a1a1..."},
    {"questionId": "q4q5q6q7...", "answerId": "a2a2a2a2..."},
    {"questionId": "q5q6q7q8...", "answerId": "a1a1a1a1..."},
    {"questionId": "q6q7q8q9...", "answerId": "a3a3a3a3..."},
    {"questionId": "q7q8q9q0...", "answerId": "a1a1a1a1..."},
    {"questionId": "q8q9q0q1...", "answerId": "a1a1a1a1..."},
    {"questionId": "q9q0q1q2...", "answerId": "a1a1a1a1..."},
    {"questionId": "q0q1q2q3...", "answerId": "a2a2a2a2..."}
  ]
}

Backend Processing:
  1. Verify submission ownership ✓
  2. Check submission status = IN_PROGRESS ✓
  3. Check not expired: NOW() < expires_at ✓
  4. Validate all questions answered:
     - Expected: 10 questions
     - Received: 10 responses ✓
  5. Validate no duplicate responses ✓
  6. Begin transaction
  7. For each response, grade and store:
     
     Response 1:
       questionId: q1q2q3q4...
       answerId: a2a2a2a2...
       Look up correct answer for question q1q2q3q4...
         → correct answer: a2a2a2a2... ✓
       isCorrect: true
       pointsEarned: 1
       
     Response 2:
       questionId: q2q3q4q5...
       answerId: a2a2a2a2...
       Correct answer: a2a2a2a2... ✓
       isCorrect: true
       pointsEarned: 1
     
     ... (continue for all responses)
     
     Response 8:
       questionId: q8q9q0q1...
       answerId: a1a1a1a1... (user selected "git send")
       Correct answer: a3a3a3a3... (should be "git push") ✗
       isCorrect: false
       pointsEarned: 0
     
     ... (continue)
     
  8. Insert all responses into responses table
  
  9. Calculate final score:
     totalPoints = SUM(questions.points) = 10
     earnedPoints = SUM(responses.pointsEarned) = 9
     percentage = (9 / 10) × 100 = 90.00
     passed = 90.00 >= 70 = TRUE ✓
     
  10. Update submission:
      status = 'SUBMITTED'
      submitted_at = NOW()
      score = 9
      max_score = 10
      percentage = 90.00
      passed = TRUE
      
  11. Check auto-certificate eligibility:
      assessment.autoIssueCertificate = TRUE ✓
      submission.passed = TRUE ✓
      
      Check for existing certificate:
        SELECT * FROM certificates 
        WHERE assessment_id = ? AND user_id = ? AND status = 'ACTIVE'
        Result: None ✓
      
      Issue certificate:
        certificate_number = generate() → "CERT-2024-A7B9C2D1"
        verification_code = generate() → "VX8K2MN9PQR7Z3A1B5C7D9E2F4G6H8J0"
        
        Snapshot data:
          recipientName = "Omar Ali"
          workshopTitle = "Introduction to Git & GitHub"
          workspaceName = "Computer Science Club"
          score = 90
        
        INSERT INTO certificates (...)
        
        certificateId = "c1c2c3c4-c5c6-c7c8-c9c0-c1c2c3c4c5c6"
      
  12. Update enrollment:
      UPDATE enrollments 
      SET completed_at = NOW() 
      WHERE workshop_id = ? AND user_id = ?
      
  13. Log activities:
      - assessment.submitted
      - certificate.issued
      
  14. Commit transaction

Response: 200 OK
{
  "success": true,
  "data": {
    "submission": {
      "id": "s1s2s3s4...",
      "status": "SUBMITTED",
      "attemptNumber": 1,
      "score": 9,
      "maxScore": 10,
      "percentage": 90.00,
      "passed": true,
      "submittedAt": "2024-01-16T10:27:15Z"
    },
    "certificate": {
      "id": "c1c2c3c4-c5c6-c7c8-c9c0-c1c2c3c4c5c6",
      "certificateNumber": "CERT-2024-A7B9C2D1",
      "issuedAt": "2024-01-16T10:27:15Z",
      "pdfUrl": null, // PDF generation happens async
      "verificationUrl": "https://verify.skillmark.io/VX8K2MN9PQR7Z3A1B5C7D9E2F4G6H8J0"
    }
  },
  "message": "Congratulations! You passed with 90%"
}
```

#### Step 6: View Results
```
Frontend displays results screen:

┌─────────────────────────────────────────┐
│  🎉 Assessment Complete!                │
│                                         │
│  Git Fundamentals Quiz                  │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│  Your Score: 90%                        │
│  Status: PASSED ✅                      │
│                                         │
│  Correct Answers: 9/10                  │
│  Points Earned: 9/10                    │
│  Time Taken: 12 minutes                 │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│  🏆 Certificate Earned!                 │
│  CERT-2024-A7B9C2D1                     │
│                                         │
│  [ View Certificate ]                   │
│  [ Review Answers ]                     │
│  [ Back to Workshop ]                   │
└─────────────────────────────────────────┘
```

#### Step 7: Review Incorrect Answers
```
Omar clicks "Review Answers"

GET /api/v1/submissions/s1s2s3s4.../result

Backend checks:
  - Submission belongs to user ✓
  - Submission is submitted ✓

Response: 200 OK
{
  "success": true,
  "data": {
    "submission": {
      "id": "s1s2s3s4...",
      "score": 9,
      "maxScore": 10,
      "percentage": 90.00,
      "passed": true
    },
    "responses": [
      {
        "question": {
          "id": "q1q2q3q4...",
          "text": "What does Git stand for?",
          "explanation": "Git is named after the British slang word 'git'",
          "points": 1
        },
        "selectedAnswer": {
          "id": "a2a2a2a2...",
          "text": "It's just a name, not an acronym"
        },
        "correctAnswer": {
          "id": "a2a2a2a2...",
          "text": "It's just a name, not an acronym"
        },
        "isCorrect": true,
        "pointsEarned": 1
      },
      // ... 7 more correct answers
      {
        "question": {
          "id": "q8q9q0q1...",
          "text": "Which command pushes changes to a remote repository?",
          "points": 1
        },
        "selectedAnswer": {
          "id": "a1a1a1a1...",
          "text": "git send"
        },
        "correctAnswer": {
          "id": "a3a3a3a3...",
          "text": "git push"
        },
        "isCorrect": false,
        "pointsEarned": 0
      },
      // ... 1 more correct answer
    ]
  }
}

Frontend highlights incorrect answer in red, correct answer in green
```

### ✅ Success Criteria
- [x] Submission created and started
- [x] Questions loaded without revealing correct answers
- [x] All answers submitted before expiry
- [x] Automatic grading completed correctly
- [x] Score calculated: 9/10 = 90%
- [x] Pass status determined: 90% >= 70% = PASSED
- [x] Certificate auto-issued
- [x] Enrollment marked as completed
- [x] Omar can review answers with explanations

### 🔄 Alternative Flows

#### 5.1a: Submission Expires Before Submitting
```
Scenario: Omar starts at 10:15, timer runs out at 10:45, 
          but Omar tries to submit at 10:46

POST /api/v1/submissions/s1s2s3s4.../submit
Body: {"responses": [...]}

Backend checks:
  NOW() = 2024-01-16 10:46:00
  submission.expiresAt = 2024-01-16 10:45:00
  NOW() > expiresAt ✗

Backend automatically updates:
  UPDATE submissions 
  SET status = 'EXPIRED' 
  WHERE id = ? AND NOW() > expires_at

Response: 422 Unprocessable Entity
{
  "success": false,
  "error": {
    "code": "SUBMISSION_EXPIRED",
    "message": "Time limit exceeded. Submission has been marked as expired.",
    "details": [{
      "expiresAt": "2024-01-16T10:45:00Z",
      "attemptNumber": 1,
      "remainingAttempts": 2
    }]
  }
}

Frontend displays:
  "⏰ Time's up! You can try again. You have 2 attempts remaining."
  [ Try Again ]
```

#### 5.1b: Failed Assessment (Score < 70%)
```
Scenario: Omar scores 6/10 = 60%

Grading result:
  percentage = 60.00
  passed = 60.00 >= 70 = FALSE

Response: 200 OK
{
  "success": true,
  "data": {
    "submission": {
      "id": "s1s2s3s4...",
      "status": "SUBMITTED",
      "attemptNumber": 1,
      "score": 6,
      "maxScore": 10,
      "percentage": 60.00,
      "passed": false
    },
    "certificate": null // Not issued
  },
  "message": "You scored 60%. Passing score is 70%. You have 2 attempts remaining."
}

Frontend displays:
  "❌ Not Passed - 60%
   You need 70% to pass.
   [ Try Again ] (2 attempts left)"
```

#### 5.1c: Maximum Attempts Reached
```
Scenario: Omar failed 3 times

Attempt 4 start request:
POST /api/v1/assessments/a1a2a3a4.../submissions

Backend checks:
  SELECT COUNT(*) FROM submissions WHERE assessment_id = ? AND user_id = ?
  Result: 3
  
  3 >= maxAttempts (3) ✗

Response: 422 Unprocessable Entity
{
  "success": false,
  "error": {
    "code": "MAX_ATTEMPTS_REACHED",
    "message": "You have used all 3 attempts for this assessment",
    "details": [{
      "attempts": [
        {"attemptNumber": 1, "score": 60, "passed": false},
        {"attemptNumber": 2, "score": 65, "passed": false},
        {"attemptNumber": 3, "score": 68, "passed": false}
      ],
      "bestScore": 68,
      "contactMessage": "Please contact the instructor for assistance"
    }]
  }
}
```

#### 5.1d: Active Submission Exists
```
Scenario: Omar started assessment but didn't submit, then tries to start again

POST /api/v1/assessments/a1a2a3a4.../submissions

Backend checks:
  SELECT * FROM submissions 
  WHERE assessment_id = ? AND user_id = ? AND status = 'IN_PROGRESS'
  Result: Found submission from 10 minutes ago

Response: 409 Conflict
{
  "success": false,
  "error": {
    "code": "ACTIVE_SUBMISSION_EXISTS",
    "message": "You have an active submission in progress",
    "details": [{
      "submissionId": "s1s2s3s4...",
      "startedAt": "2024-01-16T10:15:00Z",
      "expiresAt": "2024-01-16T10:45:00Z",
      "timeRemaining": 1200
    }]
  }
}

Frontend displays:
  "You have an active submission
   Time remaining: 20:00
   [ Continue Submission ]"
```

---

## SCENARIO 6: Public Certificate Verification

### 👤 Actor
**Fatima Noor** — HR Recruiter (Not authenticated)

### 🎯 Goal
Verify a certificate that a job applicant included in their resume

### 📋 Preconditions
- Candidate submitted resume with certificate number or QR code
- Certificate exists and is ACTIVE (not revoked)
- Verification endpoint is public (no authentication required)

### 📝 Detailed Steps

#### Step 1: Scan QR Code
```
Scenario: Fatima receives PDF certificate with QR code

QR Code contains URL:
https://verify.skillmark.io/VX8K2MN9PQR7Z3A1B5C7D9E2F4G6H8J0

Fatima scans with phone → Redirects to verification page
```

#### Step 2: Load Verification Page
```
Frontend loads:
https://verify.skillmark.io/VX8K2MN9PQR7Z3A1B5C7D9E2F4G6H8J0

Frontend extracts verification code and calls API:

GET /api/v1/public/verify/VX8K2MN9PQR7Z3A1B5C7D9E2F4G6H8J0
Headers: None (public endpoint)

Backend Processing:
  1. No authentication check (public)
  2. Look up certificate by verification_code
  3. Return sanitized public data (no sensitive info)

Response: 200 OK
{
  "success": true,
  "data": {
    "valid": true,
    "certificateNumber": "CERT-2024-A7B9C2D1",
    "recipientName": "Omar Ali",
    "workshopTitle": "Introduction to Git & GitHub",
    "workspaceName": "Computer Science Club",
    "score": 90,
    "issuedAt": "2024-01-16T10:27:15Z",
    "status": "ACTIVE",
    "verifiedAt": "2024-01-20T14:30:00Z"
  }
}
```

#### Step 3: Display Verification Result
```
Frontend displays:

┌─────────────────────────────────────────┐
│  ✅ Certificate Verified                │
│                                         │
│  Certificate Number:                    │
│  CERT-2024-A7B9C2D1                     │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│  Recipient: Omar Ali                    │
│                                         │
│  Workshop:                              │
│  Introduction to Git & GitHub           │
│                                         │
│  Issued by:                             │
│  Computer Science Club                  │
│                                         │
│  Score: 90%                             │
│                                         │
│  Issued: January 16, 2024               │
│                                         │
│  Status: Active ✅                      │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│  Verified on: January 20, 2024          │
│                                         │
└─────────────────────────────────────────┘

Fatima confirms the certificate is legitimate
```

### ✅ Success Criteria
- [x] Public endpoint accessible without authentication
- [x] Verification code validated
- [x] Certificate details returned
- [x] No sensitive data exposed (emails, user IDs, etc.)
- [x] Verification timestamp recorded
- [x] Clear visual indication of validity

### 🔄 Alternative Flows

#### 6.1a: Invalid Verification Code
```
GET /api/v1/public/verify/INVALID123ABC

Backend: Code not found in database

Response: 404 Not Found
{
  "success": false,
  "error": {
    "code": "CERTIFICATE_NOT_FOUND",
    "message": "Certificate not found",
    "details": [{
      "reason": "Invalid verification code"
    }]
  }
}

Frontend displays:
┌─────────────────────────────────────────┐
│  ❌ Certificate Not Found               │
│                                         │
│  The verification code you entered      │
│  is invalid or does not exist.          │
│                                         │
│  Please check:                          │
│  • Code is entered correctly            │
│  • QR code is not damaged               │
│  • Certificate is genuine               │
│                                         │
│  ⚠️ Warning: This may be a fake         │
│     certificate                         │
│                                         │
└─────────────────────────────────────────┘
```

#### 6.1b: Revoked Certificate
```
Scenario: Certificate was revoked for fraud

GET /api/v1/public/verify/VX8K2MN9PQR7Z3A1B5C7D9E2F4G6H8J0

Response: 200 OK
{
  "success": true,
  "data": {
    "valid": false,
    "certificateNumber": "CERT-2024-A7B9C2D1",
    "recipientName": "Omar Ali",
    "workshopTitle": "Introduction to Git & GitHub",
    "workspaceName": "Computer Science Club",
    "score": 90,
    "issuedAt": "2024-01-16T10:27:15Z",
    "status": "REVOKED",
    "revokedAt": "2024-01-18T16:00:00Z",
    "revokeReason": "Violation of academic integrity policy",
    "verifiedAt": "2024-01-20T14:30:00Z"
  }
}

Frontend displays:
┌─────────────────────────────────────────┐
│  ⛔ Certificate Revoked                 │
│                                         │
│  CERT-2024-A7B9C2D1                     │
│                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│  This certificate has been revoked      │
│  and is no longer valid.                │
│                                         │
│  Recipient: Omar Ali                    │
│  Workshop: Introduction to Git & GitHub │
│                                         │
│  Revoked: January 18, 2024              │
│  Reason: Violation of academic          │
│          integrity policy               │
│                                         │
│  ⚠️ This certificate is NOT valid       │
│                                         │
└─────────────────────────────────────────┘
```

#### 6.1c: Verification by Certificate Number
```
Scenario: Fatima doesn't have QR code, only certificate number

Frontend provides search form:
┌─────────────────────────────────────────┐
│  Verify Certificate                     │
│                                         │
│  Enter certificate number:              │
│  [ CERT-2024-A7B9C2D1          ]        │
│                                         │
│  [ Verify ]                             │
└─────────────────────────────────────────┘

Alternative endpoint:
GET /api/v1/public/certificates/CERT-2024-A7B9C2D1

Backend looks up by certificate_number instead of verification_code
Returns same response format as verification code lookup
```

---

## SCENARIO 7: Instructor Views Analytics

### 👤 Actor
**Sarah Chen** — Workspace Admin

### 🎯 Goal
Review workshop performance and participant progress

### 📋 Preconditions
- Workshop has been running for 2 weeks
- 45 participants enrolled
- 32 completed the assessment
- 28 passed and received certificates

### 📝 Detailed Steps

#### Step 1: View Workspace Statistics
```
Sarah navigates to Workspace Dashboard → Analytics

GET /api/v1/workspaces/a1b2c3d4.../stats
Headers: Authorization: Bearer [Sarah's token]

Backend Processing:
  1. Verify user is ADMIN or INSTRUCTOR ✓
  2. Calculate metrics:
  
  SELECT COUNT(*) FROM members WHERE workspace_id = ?
  → 45 members
  
  SELECT COUNT(*) FROM workshops WHERE workspace_id = ?
  → 3 workshops
  
  SELECT COUNT(*) FROM workshops WHERE workspace_id = ? AND status = 'PUBLISHED'
  → 2 active workshops
  
  SELECT COUNT(*) FROM certificates WHERE workspace_id = ?
  → 28 certificates issued
  
  SELECT COUNT(*) FROM enrollments e
  JOIN workshops w ON e.workshop_id = w.id
  WHERE w.workspace_id = ?
  → 67 total enrollments

Response: 200 OK
{
  "success": true,
  "data": {
    "membersCount": 45,
    "workshopsCount": 3,
    "activeWorkshopsCount": 2,
    "totalEnrollments": 67,
    "certificatesIssued": 28,
    "assessmentsCount": 4,
    "totalSubmissions": 52
  }
}
```

#### Step 2: View Workshop-Specific Stats
```
Sarah clicks on "Introduction to Git & GitHub" workshop

GET /api/v1/workshops/w1w2w3w4.../stats

Backend Processing:
  Enrollments:
    SELECT COUNT(*) FROM enrollments WHERE workshop_id = ?
    → 45 enrolled
    
    SELECT COUNT(*) FROM enrollments 
    WHERE workshop_id = ? AND completed_at IS NOT NULL
    → 32 completed
  
  Assessment Performance:
    SELECT 
      AVG(percentage) as avg_score,
      MIN(percentage) as lowest_score,
      MAX(percentage) as highest_score,
      COUNT(*) as total_submissions,
      SUM(CASE WHEN passed = TRUE THEN 1 ELSE 0 END) as passed_count
    FROM submissions s
    JOIN assessments a ON s.assessment_id = a.id
    WHERE a.workshop_id = ? AND s.status = 'SUBMITTED'
    
    Result:
      avg_score: 78.5
      lowest_score: 45.0
      highest_score: 100.0
      total_submissions: 32
      passed_count: 28
  
  Certificates:
    SELECT COUNT(*) FROM certificates WHERE workshop_id = ?
    → 28

Response: 200 OK
{
  "success": true,
  "data": {
    "enrolledCount": 45,
    "completedCount": 32,
    "completionRate": 71.1,
    "resourcesCount": 3,
    "assessmentsCount": 1,
    "submissions": {
      "total": 32,
      "passed": 28,
      "failed": 4,
      "passRate": 87.5,
      "averageScore": 78.5,
      "highestScore": 100.0,
      "lowestScore": 45.0
    },
    "certificates": {
      "issued": 28,
      "active": 28,
      "revoked": 0
    },
    "timeline": {
      "startedAt": "2024-02-01T14:00:00Z",
      "endedAt": "2024-02-01T17:00:00Z",
      "durationDays": 1
    }
  }
}
```

#### Step 3: View Assessment Details
```
Sarah clicks "Git Fundamentals Quiz"

GET /api/v1/assessments/a1a2a3a4.../stats

Backend Processing:
  Attempt Distribution:
    SELECT 
      attempt_number,
      COUNT(*) as count
    FROM submissions
    WHERE assessment_id = ?
    GROUP BY attempt_number
    
    Result:
      Attempt 1: 30 submissions
      Attempt 2: 7 submissions
      Attempt 3: 2 submissions
  
  Score Distribution:
    SELECT 
      FLOOR(percentage / 10) * 10 as score_range,
      COUNT(*) as count
    FROM submissions
    WHERE assessment_id = ? AND status = 'SUBMITTED'
    GROUP BY score_range
    ORDER BY score_range
    
    Result:
      40-49%: 2 students
      50-59%: 1 student
      60-69%: 1 student
      70-79%: 8 students
      80-89%: 12 students
      90-100%: 8 students

Response: 200 OK
{
  "success": true,
  "data": {
    "totalSubmissions": 39,
    "uniqueParticipants": 32,
    "averageScore": 78.5,
    "medianScore": 80.0,
    "highestScore": 100.0,
    "lowestScore": 45.0,
    "passedCount": 28,
    "failedCount": 4,
    "expiredCount": 0,
    "passRate": 87.5,
    "attemptDistribution": [
      {"attemptNumber": 1, "count": 30},
      {"attemptNumber": 2, "count": 7},
      {"attemptNumber": 3, "count": 2}
    ],
    "scoreDistribution": [
      {"range": "40-49%", "count": 2},
      {"range": "50-59%", "count": 1},
      {"range": "60-69%", "count": 1},
      {"range": "70-79%", "count": 8},
      {"range": "80-89%", "count": 12},
      {"range": "90-100%", "count": 8}
    ],
    "averageAttempts": 1.2,
    "firstAttemptPassRate": 83.3
  }
}
```

#### Step 4: View Participant List
```
Sarah navigates to Participants tab

GET /api/v1/workshops/w1w2w3w4.../enrollments?page=0&size=20&sort=enrolledAt

Backend checks:
  - User is ADMIN or INSTRUCTOR ✓

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "enrollment": {
        "id": "e1e2e3e4...",
        "enrolledAt": "2024-01-16T09:15:00Z",
        "completedAt": "2024-01-16T10:27:15Z",
        "status": "ACTIVE"
      },
      "user": {
        "id": "omar123...",
        "name": "Omar Ali",
        "email": "omar.ali@university.edu",
        "avatarUrl": "https://..."
      },
      "progress": {
        "resourcesViewed": 3,
        "assessmentsTaken": 1,
        "bestScore": 90.0,
        "attempts": 1,
        "passed": true,
        "certificateIssued": true
      }
    },
    {
      "enrollment": {
        "id": "e2e3e4e5...",
        "enrolledAt": "2024-01-16T09:20:00Z",
        "completedAt": null,
        "status": "ACTIVE"
      },
      "user": {
        "id": "user456...",
        "name": "Layla Ibrahim",
        "email": "layla@university.edu"
      },
      "progress": {
        "resourcesViewed": 2,
        "assessmentsTaken": 0,
        "bestScore": null,
        "attempts": 0,
        "passed": false,
        "certificateIssued": false
      }
    }
    // ... 18 more enrollments
  ],
  "pagination": {
    "page": 0,
    "size": 20,
    "totalElements": 45,
    "totalPages": 3,
    "hasNext": true
  }
}
```

#### Step 5: Export Analytics Report
```
Sarah clicks "Export Report"

GET /api/v1/workshops/w1w2w3w4.../report?format=csv
Headers: Authorization: Bearer [Sarah's token]

Backend generates CSV:

Name,Email,Enrolled Date,Score,Attempts,Status,Certificate
Omar Ali,omar.ali@university.edu,2024-01-16,90%,1,Passed,CERT-2024-A7B9C2D1
Layla Ibrahim,layla@university.edu,2024-01-16,—,0,In Progress,—
...

Response: 200 OK
Content-Type: text/csv
Content-Disposition: attachment; filename="git-workshop-report-2024-01-20.csv"

[CSV data]
```

### ✅ Success Criteria
- [x] Sarah can view workspace-level metrics
- [x] Sarah can view workshop-specific stats
- [x] Sarah can view assessment performance
- [x] Sarah can see participant progress
- [x] Sarah can export reports
- [x] All calculations are accurate
- [x] Only authorized users can access

---

## SCENARIO 8: Revoking a Certificate

### 👤 Actor
**Sarah Chen** — Workspace Admin

### 🎯 Goal
Revoke a certificate due to academic integrity violation

### 📋 Preconditions
- Certificate was issued to participant
- Evidence of cheating/plagiarism found
- Sarah is ADMIN of workspace

### 📝 Detailed Steps

#### Step 1: Find Certificate
```
Sarah navigates to Workspace → Certificates → Search

GET /api/v1/workspaces/a1b2c3d4.../certificates?search=Omar

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "c1c2c3c4-c5c6-c7c8-c9c0-c1c2c3c4c5c6",
      "certificateNumber": "CERT-2024-A7B9C2D1",
      "recipientName": "Omar Ali",
      "workshopTitle": "Introduction to Git & GitHub",
      "score": 90,
      "status": "ACTIVE",
      "issuedAt": "2024-01-16T10:27:15Z"
    }
  ]
}
```

#### Step 2: View Certificate Details
```
Sarah clicks certificate

GET /api/v1/certificates/c1c2c3c4-c5c6-c7c8-c9c0-c1c2c3c4c5c6

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "c1c2c3c4...",
    "certificateNumber": "CERT-2024-A7B9C2D1",
    "verificationCode": "VX8K2MN9PQR7Z3A1B5C7D9E2F4G6H8J0",
    "recipientName": "Omar Ali",
    "workshopTitle": "Introduction to Git & GitHub",
    "workspaceName": "Computer Science Club",
    "score": 90,
    "status": "ACTIVE",
    "issuedAt": "2024-01-16T10:27:15Z",
    "issuedBy": {
      "name": "System",
      "automated": true
    },
    "submission": {
      "id": "s1s2s3s4...",
      "attemptNumber": 1,
      "submittedAt": "2024-01-16T10:27:15Z"
    }
  }
}
```

#### Step 3: Revoke Certificate
```
Sarah clicks "Revoke Certificate"

Frontend shows confirmation modal:
┌─────────────────────────────────────────┐
│  Revoke Certificate?                    │
│                                         │
│  CERT-2024-A7B9C2D1                     │
│  Recipient: Omar Ali                    │
│                                         │
│  This action cannot be undone.          │
│  The certificate will be marked as      │
│  revoked and will fail verification.    │
│                                         │
│  Reason for revocation (required):      │
│  [____________________________]         │
│                                         │
│  [ Cancel ]    [ Revoke Certificate ]   │
└─────────────────────────────────────────┘

Sarah enters reason: "Violation of academic integrity policy - evidence of answer sharing"

POST /api/v1/certificates/c1c2c3c4.../revoke
Body: {
  "reason": "Violation of academic integrity policy - evidence of answer sharing"
}
Headers: Authorization: Bearer [Sarah's token]

Backend Processing:
  1. Verify certificate ownership:
     - Check certificate.workspace_id matches user's workspace ✓
     - Check user has ADMIN or INSTRUCTOR role ✓
  2. Check certificate is not already revoked:
     - status != 'REVOKED' ✓
  3. Validate reason is provided ✓
  4. Update certificate:
     UPDATE certificates
     SET 
       status = 'REVOKED',
       revoked_at = NOW(),
       revoke_reason = ?
     WHERE id = ?
  5. Log activity:
     INSERT INTO activity_logs (...)
     VALUES (..., 'certificate.revoked', ...)

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "c1c2c3c4...",
    "status": "REVOKED",
    "revokedAt": "2024-01-18T16:00:00Z",
    "revokeReason": "Violation of academic integrity policy - evidence of answer sharing"
  },
  "message": "Certificate revoked successfully"
}
```

#### Step 4: Verify Revocation
```
Anyone verifying this certificate now sees:

GET /api/v1/public/verify/VX8K2MN9PQR7Z3A1B5C7D9E2F4G6H8J0

Response: 200 OK
{
  "success": true,
  "data": {
    "valid": false,
    "status": "REVOKED",
    "certificateNumber": "CERT-2024-A7B9C2D1",
    "recipientName": "Omar Ali",
    "workshopTitle": "Introduction to Git & GitHub",
    "workspaceName": "Computer Science Club",
    "issuedAt": "2024-01-16T10:27:15Z",
    "revokedAt": "2024-01-18T16:00:00Z",
    "revokeReason": "Violation of academic integrity policy"
  }
}

Note: Full detailed reason is visible (consider privacy implications)
```

### ✅ Success Criteria
- [x] Certificate status updated to REVOKED
- [x] Revocation timestamp recorded
- [x] Reason stored and visible
- [x] Public verification reflects revoked status
- [x] Activity log created
- [x] Revocation is permanent (cannot be undone)

---

## SCENARIO 9: Adding a Co-Instructor

### 👤 Actor
**Sarah Chen** — Workspace Admin

### 🎯 Goal
Add Dr. Ahmad Hassan as an instructor to help manage workshops

### 📝 Detailed Steps

#### Step 1: Invite by Email
```
Sarah navigates to Workspace → Members → Add Member

POST /api/v1/workspaces/a1b2c3d4.../members
Body: {
  "email": "ahmad.hassan@university.edu",
  "role": "INSTRUCTOR"
}

Backend Processing:
  1. Verify Sarah is ADMIN ✓
  2. Look up user by email:
     SELECT * FROM users WHERE email = ?
     
     Case A: User exists
       - Add membership with role INSTRUCTOR
       
     Case B: User doesn't exist
       - Create invite link
       - Send email invitation (if email service configured)

Response (Case A - User Exists): 201 Created
{
  "success": true,
  "data": {
    "member": {
      "id": "m5m6m7m8...",
      "userId": "ahmad789...",
      "name": "Dr. Ahmad Hassan",
      "email": "ahmad.hassan@university.edu",
      "role": "INSTRUCTOR",
      "joinedAt": "2024-01-20T15:00:00Z"
    }
  },
  "message": "Member added successfully"
}
```

#### Step 2: New Instructor Accesses Workspace
```
Dr. Ahmad logs in and navigates to My Workspaces

GET /api/v1/workspaces

Response includes:
{
  "success": true,
  "data": [
    {
      "id": "a1b2c3d4...",
      "name": "Computer Science Club",
      "slug": "cs-club",
      "role": "INSTRUCTOR", ← Can create workshops, assessments
      "membersCount": 46,
      "workshopsCount": 3
    }
  ]
}

Dr. Ahmad can now:
  ✓ Create workshops
  ✓ Create assessments
  ✓ Issue certificates
  ✓ View analytics
  ✓ Invite members
  
  ✗ Cannot delete workspace
  ✗ Cannot remove/change admin
```

### ✅ Success Criteria
- [x] Instructor added with correct role
- [x] Instructor has appropriate permissions
- [x] Workspace visible in instructor's workspace list

---

## SCENARIO 10: Handling Concurrent Invite Acceptance

### 👤 Actors
**User A** and **User B** — Two students clicking invite simultaneously

### 🎯 Goal
Ensure both students can join successfully when clicking the same invite link at the same time

### 📝 Detailed Steps

```
Initial State:
  invite is ACTIVE, no usage limits

At T+0ms:
  User A: POST /api/v1/invites/accept {"code": "GIT2024WK1AB"}
  User B: POST /api/v1/invites/accept {"code": "GIT2024WK1AB"}

Backend Processing (Transaction A):
  1. BEGIN TRANSACTION
  2. Find invite by code
  3. Validate: status is active ✓
  4. Create enrollment
  5. COMMIT
  → User A succeeds ✓

Backend Processing (Transaction B):
  1. BEGIN TRANSACTION
  2. Find invite by code
  3. Validate: status is active ✓
  4. Create enrollment
  5. COMMIT
  → User B succeeds ✓

Result:
  ✓ Both users enrolled successfully
  ✓ No race condition
  ✓ Database integrity maintained
```

### ✅ Success Criteria
- [x] Both users enroll successfully
- [x] No duplicate enrollments
- [x] No errors for concurrent access

---

# 5. Edge Cases & Variations

## 5.1 Workshop Lifecycle Edge Cases

### 5.1.1 Publishing Draft Workshop Without Resources
```
Scenario: Organizer tries to publish empty workshop

PATCH /api/v1/workshops/w1w2w3w4.../publish

Backend Check:
  SELECT COUNT(*) FROM resources WHERE workshop_id = ?
  → 0 resources
  
  SELECT COUNT(*) FROM assessments WHERE workshop_id = ?
  → 0 assessments

Response: 422 Unprocessable Entity
{
  "success": false,
  "error": {
    "code": "PUBLISH_REQUIREMENTS_NOT_MET",
    "message": "Workshop must have at least one resource or assessment"
  }
}
```

### 5.1.2 Archiving Workshop with Active Enrollments
```
Scenario: 45 active participants, Sarah archives workshop

PATCH /api/v1/workshops/w1w2w3w4.../archive

Backend:
  - Sets status = 'ARCHIVED'
  - Preserves all enrollments
  - Prevents new enrollments
  - Assessments become read-only
  - Certificates remain valid

Response: 200 OK
{
  "success": true,
  "data": {
    "status": "ARCHIVED",
    "archivedAt": "2024-02-15T10:00:00Z",
    "activeEnrollments": 45,
    "certificatesIssued": 28
  },
  "message": "Workshop archived. Existing participants retain access."
}
```

### 5.1.3 Attempting to Enroll in Archived Workshop
```
Scenario: New user tries to join archived workshop

POST /api/v1/invites/accept
Body: {"code": "ARCHIVED123"}

Backend Check:
  Workshop status = 'ARCHIVED'

Response: 422 Unprocessable Entity
{
  "success": false,
  "error": {
    "code": "WORKSHOP_ARCHIVED",
    "message": "This workshop has been archived and is no longer accepting enrollments"
  }
}
```

---

## 5.2 Assessment Timing Edge Cases

### 5.2.1 Browser Crash During Assessment
```
Scenario: Omar's browser crashes at 15 minutes into 30-minute assessment

Recovery Flow:
  1. Omar reopens browser, logs back in
  2. Frontend checks for active submission:
  
     GET /api/v1/assessments/a1a2a3a4.../submissions
     Filter: status = 'IN_PROGRESS' AND user = current_user
     
     Response: {
       "data": [{
         "id": "s1s2s3s4...",
         "startedAt": "2024-01-16T10:15:00Z",
         "expiresAt": "2024-01-16T10:45:00Z",
         "timeRemaining": 900 // 15 minutes left
       }]
     }
  
  3. Frontend displays:
     "You have an active assessment in progress.
      Time remaining: 15:00
      [ Resume Assessment ]"
  
  4. Omar clicks Resume
  5. Questions load (answers may be lost if not auto-saved)
  6. Timer continues from remaining time
```

### 5.2.2 Network Failure During Submission
```
Scenario: Network drops exactly when Omar clicks Submit

Frontend Implementation:
  1. Store answers in localStorage before submitting
  2. POST /api/v1/submissions/s1s2s3s4.../submit
  3. Network timeout after 30 seconds
  4. Frontend retries with exponential backoff
  5. If still fails:
     - Display: "Submission failed. Retrying..."
     - Keep answers in localStorage
     - Retry every 10 seconds
  6. Once network recovers, submission succeeds
  7. Clear localStorage after 200 OK

Edge Case: Submission expires during network outage
  - Backend returns 422 Submission Expired
  - Frontend displays: "Time expired during network issue. 
                        Your attempt has been marked expired."
```

### 5.2.3 Clock Skew Between Client and Server
```
Scenario: User's clock is 5 minutes ahead

Problem: Frontend timer shows 0:00 but backend still has 5 minutes

Solution:
  - Backend is source of truth for expiration
  - Frontend syncs time from server on start:
    
    Response to start submission:
    {
      "expiresAt": "2024-01-16T10:45:00Z",
      "serverTime": "2024-01-16T10:15:00Z",
      "durationSeconds": 1800
    }
  
  - Frontend calculates offset:
    offset = serverTime - clientTime
  
  - Frontend adjusts timer using offset
```

---

## 5.3 Certificate Generation Edge Cases

### 5.3.1 PDF Generation Failure
```
Scenario: R2 upload fails during certificate generation

Backend Implementation:
  try {
    // Generate PDF
    byte[] pdfBytes = generatePdf(certificate);
    
    // Upload to R2
    String pdfUrl = storageService.uploadBytes(
      "certificates/" + certId + "/certificate.pdf",
      pdfBytes,
      "application/pdf"
    );
    
    // Update certificate
    certificate.setPdfUrl(pdfUrl);
    certificateRepository.save(certificate);
    
  } catch (StorageException e) {
    // Log error but don't fail certificate issuance
    log.error("PDF upload failed for certificate {}", certId, e);
    
    // Certificate record exists, PDF can be regenerated later
    // Mark for retry
    certificate.setPdfGenerationStatus("FAILED");
    certificateRepository.save(certificate);
  }

Response to user:
{
  "success": true,
  "data": {
    "certificate": {
      "id": "c1c2c3c4...",
      "certificateNumber": "CERT-2024-A7B9C2D1",
      "pdfUrl": null,
      "pdfStatus": "GENERATING",
      "message": "Certificate issued. PDF will be available shortly."
    }
  }
}

Background Job:
  - Retry PDF generation every 5 minutes
  - Max 3 retries
  - If still fails, send alert to admin
```

### 5.3.2 Duplicate Certificate Prevention
```
Scenario: Network retry causes duplicate certificate issuance attempt

Backend Implementation:
  @Transactional
  public Certificate issueCertificate(UUID assessmentId, UUID userId) {
    // Check for existing certificate
    Optional<Certificate> existing = certificateRepository
      .findByAssessmentAndUserAndStatus(assessmentId, userId, "ACTIVE");
    
    if (existing.isPresent()) {
      // Return existing instead of creating duplicate
      log.info("Certificate already exists for user {} assessment {}", 
               userId, assessmentId);
      return existing.get();
    }
    
    // Create new certificate
    Certificate cert = new Certificate();
    cert.setCertificateNumber(generateUniqueCertNumber());
    cert.setVerificationCode(generateUniqueVerificationCode());
    // ... set other fields
    
    return certificateRepository.save(cert);
  }

Result: Idempotent operation, safe to retry
```

---

## 5.4 Permission and Access Edge Cases

### 5.4.1 User Removed During Active Session
```
Scenario: Sarah removes Omar from workspace while Omar is taking assessment

Sequence:
  T+0:   Omar starts assessment
  T+10:  Sarah removes Omar from workspace
  T+15:  Omar tries to submit

Omar's submission request:
  POST /api/v1/submissions/s1s2s3s4.../submit

Backend checks (in order):
  1. Get submission ✓
  2. Verify submission belongs to requesting user ✓
  3. Check enrollment exists:
     SELECT * FROM enrollments WHERE workshop_id = ? AND user_id = ?
     Result: None (was deleted)
  4. Return 403 Forbidden

Response: 403 Forbidden
{
  "success": false,
  "error": {
    "code": "ACCESS_DENIED",
    "message": "You no longer have access to this workshop"
  }
}

Best Practice:
  - Don't hard-delete enrollments
  - Soft-delete or mark as REMOVED
  - Allow submission if started before removal
```

### 5.4.2 Role Changed During Session
```
Scenario: Sarah demotes Dr. Ahmad from INSTRUCTOR to MEMBER

Impact:
  - Dr. Ahmad's current session still has INSTRUCTOR token
  - Token doesn't refresh until expiry (e.g., 1 hour)

Mitigation Options:

Option A (Simple - JWT expiry):
  - Dr. Ahmad keeps INSTRUCTOR permissions until token expires
  - New token on refresh will have MEMBER role
  - Acceptable for most use cases

Option B (Real-time - Database check):
  - Every protected endpoint checks current role from database
  - Slower but real-time enforcement
  
  @PreAuthorize("@authService.hasRole(#workspaceId, 'INSTRUCTOR')")
  public void createWorkshop(UUID workspaceId, ...) {
    // Real-time role check
  }

Implementation (Option A recommended for MVP):
  - Token expires after 1 hour
  - Role changes take effect on next login
  - For critical actions (delete workspace), force DB check
```

### 5.4.3 Workspace Deleted During Active Workshop
```
Scenario: ADMIN deletes workspace with active workshops

DELETE /api/v1/workspaces/a1b2c3d4...

Backend Implementation:
  @Transactional
  public void deleteWorkspace(UUID workspaceId) {
    // Check for active workshops with enrollments
    long activeEnrollments = workshopRepository
      .countActiveEnrollmentsByWorkspace(workspaceId);
    
    if (activeEnrollments > 0) {
      throw new ValidationException(
        "Cannot delete workspace with active enrollments. " +
        "Archive workshops first."
      );
    }
    
    // Soft delete workspace
    workspace.setDeletedAt(Instant.now());
    workspaceRepository.save(workspace);
    
    // Cascade soft-delete to workshops
    workshopRepository.softDeleteByWorkspace(workspaceId);
  }

Alternative: Prevent deletion, require archival
  "This workspace has 45 active participants across 3 workshops. 
   You must archive all workshops before deletion."
```

---

## 5.5 Data Integrity Edge Cases

### 5.5.1 Question Deleted After Submissions Exist
```
Scenario: ADMIN tries to delete question with 50 submissions

DELETE /api/v1/questions/q1q2q3q4...

Backend Check:
  1. Get question
  2. Count submissions using this question:
     SELECT COUNT(DISTINCT s.id) 
     FROM submissions s
     JOIN responses r ON s.id = r.submission_id
     WHERE r.question_id = ?
     
     Result: 50 submissions
  
  3. Reject deletion

Response: 422 Unprocessable Entity
{
  "success": false,
  "error": {
    "code": "QUESTION_HAS_RESPONSES",
    "message": "Cannot delete question that has been answered",
    "details": [{
      "responsesCount": 50,
      "suggestion": "Archive the entire assessment instead"
    }]
  }
}
```

### 5.5.2 Answer Correctness Changed After Grading
```
Scenario: ADMIN accidentally changes wrong answer to correct

Prevention:
  - Lock questions/answers once assessment is published
  - Require unpublishing to edit (clears submissions)
  - OR create versioned questions/answers

Implementation:
  PATCH /api/v1/answers/a1a1a1a1...
  Body: {"isCorrect": true}

  Backend Check:
    1. Get answer
    2. Get question → Get assessment
    3. Check assessment status:
       IF status = 'PUBLISHED' AND submission_count > 0
       THEN reject

  Response: 422 Unprocessable Entity
  {
    "error": {
      "code": "CANNOT_MODIFY_GRADED_CONTENT",
      "message": "Cannot modify answers after students have submitted"
    }
  }
```

---

# 6. API Request/Response Examples

## 6.1 Complete Workshop Creation Flow

```http
### Step 1: Create Workspace
POST /api/v1/workspaces
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "name": "AI Research Lab",
  "slug": "ai-lab",
  "description": "University AI and Machine Learning Research Lab",
  "logoUrl": "https://files.skillmark.io/logos/ai-lab.png"
}

HTTP/1.1 201 Created
{
  "success": true,
  "data": {
    "id": "ws-123...",
    "name": "AI Research Lab",
    "slug": "ai-lab",
    "role": "ADMIN"
  }
}

### Step 2: Create Workshop
POST /api/v1/workspaces/ws-123.../workshops
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "title": "Neural Networks Fundamentals",
  "description": "Introduction to neural networks and deep learning",
  "startsAt": "2024-03-01T09:00:00Z",
  "endsAt": "2024-03-01T17:00:00Z"
}

HTTP/1.1 201 Created
{
  "success": true,
  "data": {
    "id": "wk-456...",
    "title": "Neural Networks Fundamentals",
    "status": "DRAFT"
  }
}

### Step 3: Add Resource
POST /api/v1/workshops/wk-456.../resources
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "title": "Deep Learning Textbook",
  "type": "DOCUMENT",
  "url": "https://files.skillmark.io/workshops/wk-456/textbook.pdf",
  "position": 0
}

HTTP/1.1 201 Created

### Step 4: Create Assessment
POST /api/v1/workshops/wk-456.../assessments
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "title": "Neural Networks Quiz",
  "passingScore": 75,
  "durationMinutes": 45,
  "maxAttempts": 2,
  "autoIssueCertificate": true
}

HTTP/1.1 201 Created
{
  "success": true,
  "data": {
    "id": "as-789...",
    "status": "DRAFT"
  }
}

### Step 5: Add Questions (Batch)
POST /api/v1/assessments/as-789.../questions/batch
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "questions": [
    {
      "text": "What is a perceptron?",
      "points": 1,
      "position": 0,
      "answers": [
        {"text": "The simplest type of artificial neuron", "isCorrect": true, "position": 0},
        {"text": "A type of activation function", "isCorrect": false, "position": 1},
        {"text": "A loss function", "isCorrect": false, "position": 2}
      ]
    }
  ]
}

HTTP/1.1 201 Created

### Step 6: Publish Assessment
PATCH /api/v1/assessments/as-789.../publish
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

HTTP/1.1 200 OK
{
  "success": true,
  "data": {
    "status": "PUBLISHED"
  }
}

### Step 7: Publish Workshop
PATCH /api/v1/workshops/wk-456.../publish
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

HTTP/1.1 200 OK

### Step 8: Create Invite
POST /api/v1/workspaces/ws-123.../invites
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "workshopId": "wk-456...",
  "role": "MEMBER"
}

HTTP/1.1 201 Created
{
  "success": true,
  "data": {
    "code": "NEURAL2024AI",
    "inviteUrl": "https://app.skillmark.io/join/NEURAL2024AI"
  }
}
```

---

## 6.2 Complete Assessment Taking Flow

```http
### Step 1: Preview Invite
GET /api/v1/invites/NEURAL2024AI/preview

HTTP/1.1 200 OK
{
  "success": true,
  "data": {
    "valid": true,
    "workshop": {
      "title": "Neural Networks Fundamentals",
      "description": "..."
    },
    "workspace": {
      "name": "AI Research Lab"
    }
  }
}

### Step 2: Accept Invite
POST /api/v1/invites/accept
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "code": "NEURAL2024AI"
}

HTTP/1.1 201 Created
{
  "success": true,
  "message": "Successfully joined workshop!"
}

### Step 3: View Assessments
GET /api/v1/workshops/wk-456.../assessments
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

HTTP/1.1 200 OK
{
  "success": true,
  "data": [
    {
      "id": "as-789...",
      "title": "Neural Networks Quiz",
      "passingScore": 75,
      "durationMinutes": 45,
      "userAttempts": 0,
      "remainingAttempts": 2,
      "canAttempt": true
    }
  ]
}

### Step 4: Start Submission
POST /api/v1/assessments/as-789.../submissions
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

HTTP/1.1 201 Created
{
  "success": true,
  "data": {
    "id": "sub-101...",
    "attemptNumber": 1,
    "status": "IN_PROGRESS",
    "expiresAt": "2024-01-20T16:00:00Z"
  }
}

### Step 5: Load Questions
GET /api/v1/assessments/as-789.../questions
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

HTTP/1.1 200 OK
{
  "success": true,
  "data": [
    {
      "id": "q-201...",
      "text": "What is a perceptron?",
      "points": 1,
      "answers": [
        {"id": "ans-301...", "text": "The simplest type of artificial neuron"},
        {"id": "ans-302...", "text": "A type of activation function"},
        {"id": "ans-303...", "text": "A loss function"}
      ]
    }
  ]
}

### Step 6: Submit Answers
POST /api/v1/submissions/sub-101.../submit
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
Content-Type: application/json

{
  "responses": [
    {"questionId": "q-201...", "answerId": "ans-301..."}
  ]
}

HTTP/1.1 200 OK
{
  "success": true,
  "data": {
    "submission": {
      "status": "SUBMITTED",
      "score": 8,
      "maxScore": 10,
      "percentage": 80.0,
      "passed": true
    },
    "certificate": {
      "certificateNumber": "CERT-2024-B3X7Y9Z2",
      "verificationUrl": "https://verify.skillmark.io/ABC..."
    }
  },
  "message": "Congratulations! You passed with 80%"
}
```

---

This comprehensive user scenario document provides:
- ✅ 10 detailed primary scenarios
- ✅ 10+ edge case scenarios
- ✅ Realistic persona-based narratives
- ✅ Complete API request/response examples
- ✅ Error handling and recovery flows
- ✅ Concurrent operation handling
- ✅ Data integrity scenarios
- ✅ Security and permission edge cases

**Total coverage: 25+ scenarios spanning all major platform features**