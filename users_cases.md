# User Cases (Client-Facing)

This file summarizes what each user can do in the client, based on the current backend controllers and authorization checks.

## Global rules

*   All endpoints require authentication except public certificate verification.
*   Organization permissions are based on membership role (OWNER or PARTICIPANT).
*   Program access is based on active enrollment unless the user is an OWNER.

## 1) Public visitor (not logged in)

*   Verify a certificate using a verification code.

## 2) Authenticated user (logged in, no membership required)

*   View own profile.
*   Sync own profile (returns the existing backend user record).
*   Create a new organization (becomes its owner).
*   Join a program using a valid invitation code.
*   Request an R2 upload URL.
*   Request a Cloudinary upload signature.

## 3) Program participant (active enrollment)

*   View organizations where you are an active member.
*   View programs you are enrolled in.
*   View program details for enrolled programs.
*   View active program resources.
*   View published quizzes in enrolled programs.
*   Start a quiz attempt for a published quiz.
*   Submit a quiz attempt.
*   View your own attempts.
*   View your own certificates.
*   View certificate details for your own certificates.
*   Use public certificate verification.

## 4) Organization owner (OWNER membership in an organization)

Organization management:

*   Update organization details.
*   Soft delete an organization.
*   View organization details.
*   List organizations where you are a member.

Memberships:

*   Add participants to the organization.
*   List members.
*   Remove participants (cannot remove an owner).

Programs:

*   Create, update, publish, archive, and delete programs in the organization.
*   List programs in the organization.
*   View program details.

Enrollments:

*   Manually enroll a user into a program.
*   List program enrollments.
*   Remove a user from a program.

Invitations:

*   Create invitation links for a program.
*   List invitations.
*   Disable invitations.

Resources:

*   Add program resources (links, files, images, video links).
*   List all resources in owned programs (including archived).
*   Archive resources.

Quizzes:

*   Create quizzes.
*   Add questions and options (SINGLE\_CHOICE only).
*   Update quiz settings (restricted after attempts exist).
*   Publish quizzes.
*   Archive quizzes.
*   View any quiz in owned programs (published or draft).

Attempts:

*   View all attempts for a quiz in owned programs.
*   View any attempt in owned programs.

Certificates:

*   Manually issue certificates for eligible passing attempts (MANUAL quizzes).
*   View certificates issued under owned organizations.
*   View any certificate in owned organizations.
*   Revoke certificates.

Statistics:

*   View organization, program, and quiz statistics.