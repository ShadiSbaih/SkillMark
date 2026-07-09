# Remove Clerk Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every remaining Clerk reference from Skillmark's frontend, backend, database schema, config, tests, and docs.

**Architecture:** Clean up the already-migrated native JWT auth stack by deleting Clerk columns, fields, repository methods, test helpers, properties, and documentation. Add a single Flyway migration to drop the orphaned `clerk_user_id` column.

**Tech Stack:** Angular 21, Spring Boot 4, Java 17, Flyway, PostgreSQL/H2, Vitest, JUnit.

---

### Task 1: Database migration to drop `clerk_user_id`

**Files:**
- Create: `backend/src/main/resources/db/migration/V11__remove_clerk_user_id.sql`

- [ ] **Step 1: Write migration**

```sql
ALTER TABLE users
    DROP COLUMN IF EXISTS clerk_user_id;
```

- [ ] **Step 2: Verify migration syntax**

Run: `cd backend && ./gradlew flywayMigrate -Pflyway.configFiles=src/main/resources/application-test.properties`
Expected: migration succeeds (or is skipped if H2/local profile differs).

---

### Task 2: Remove Clerk from backend Java code

**Files:**
- Modify: `backend/src/main/java/com/library/Skillmark/user/entity/User.java`
- Modify: `backend/src/main/java/com/library/Skillmark/user/repository/UserRepository.java`
- Modify (if needed): `backend/src/main/java/com/library/Skillmark/user/dto/UserResponse.java`
- Modify: `backend/src/main/java/com/library/Skillmark/user/service/UserService.java`
- Modify: `backend/src/main/java/com/library/Skillmark/auth/service/AuthService.java`
- Search and modify any other Java file referencing `clerkUserId`/`clerk_user_id`.

- [ ] **Step 1: Remove `clerkUserId` field/getter/setter from `User.java`**

- [ ] **Step 2: Remove `findByClerkUserId` and `existsByClerkUserId` from `UserRepository.java`**

- [ ] **Step 3: Remove any DTO/service usage of `clerkUserId`**

- [ ] **Step 4: Compile backend**

Run: `cd backend && ./gradlew compileJava`
Expected: BUILD SUCCESSFUL

---

### Task 3: Remove Clerk configuration from properties

**Files:**
- Modify: `backend/src/main/resources/application-local.properties`
- Modify: `backend/src/main/resources/application-local-postgres.properties`
- Modify: `backend/src/test/resources/application-test.properties`

- [ ] **Step 1: Delete all `clerk.*` properties**

- [ ] **Step 2: Run backend tests**

Run: `cd backend && ./gradlew test`
Expected: tests pass

---

### Task 4: Remove Clerk from backend integration tests

**Files:**
- Modify: `backend/src/test/java/com/library/Skillmark/SkillmarkApiIntegrationTests.java`

- [ ] **Step 1: Rename Clerk-named test methods** (`protectedEndpointsRequireClerkToken`, `devClerkTokenCreatesAndSyncsLocalUserProfile`, `clerkWebhookRequiresValidSignatureAndSyncsUserLifecycle`, `swaggerEndpointsArePublicAndDescribeClerkScopedApi`) to native-auth names.

- [ ] **Step 2: Replace `token("clerk_*", ...)` helper usage with native token generation that does not encode Clerk IDs**

- [ ] **Step 3: Remove or repurpose the `/api/v1/webhooks/clerk` test**

- [ ] **Step 4: Run backend tests**

Run: `cd backend && ./gradlew test`
Expected: tests pass

---

### Task 5: Remove Clerk from frontend model and tests

**Files:**
- Modify: `frontend/src/app/core/models/user.model.ts`
- Modify: `frontend/src/app/pages/profile/profile.spec.ts`
- Search for any other TypeScript reference to `clerkUserId`.

- [ ] **Step 1: Remove `clerkUserId` from `UserResponse` interface**

- [ ] **Step 2: Remove `clerkUserId` from profile test fixture**

- [ ] **Step 3: Run frontend type-check/tests**

Run: `cd frontend && npm run test -- --run`
Expected: tests pass

---

### Task 6: Remove Clerk from seed data and migrations

**Files:**
- Modify: `backend/src/main/resources/db/migration/V6__seed_demo_data.sql`
- Modify: `backend/src/main/resources/db/migration/V2__seed_realistic_data.sql`

- [ ] **Step 1: Remove Clerk IDs from seed `INSERT INTO users` statements and use placeholder local UUIDs or NULL**

- [ ] **Step 2: Remove Clerk-related Q&A rows from demo data if any**

---

### Task 7: Remove Clerk references from docs

**Files:**
- Modify: `docs/api-gap-audit.md`
- Modify: `frontend/docs/UI.md`
- Modify: `frontend/docs/skillmark-angular-tech-stack.md`
- Modify: `backend/docs/Skillmark_User_Scenarios.md`
- Modify: `backend/docs/DB_Design.md`
- Modify: `backend/docs/PRD.md`
- Modify: `backend/AGENTS.md`

- [ ] **Step 1: Replace Clerk auth descriptions with native JWT auth descriptions, or remove sections entirely if they only describe Clerk**

- [ ] **Step 2: Verify no remaining `clerk|Clerk|@clerk` matches in docs**

Run: `grep -R -i "clerk" docs frontend/docs backend/docs backend/AGENTS.md || echo "No matches"`
Expected: "No matches"

---

### Task 8: Final verification

- [ ] **Step 1: Global Clerk reference search**

Run:
```bash
grep -R -i "clerk" \
  backend/src \
  frontend/src \
  docs \
  frontend/docs \
  backend/docs \
  --include="*.{java,ts,tsx,md,properties,sql,yml,yaml}" || echo "No matches"
```
Expected: "No matches"

- [ ] **Step 2: Full backend test suite**

Run: `cd backend && ./gradlew test`
Expected: BUILD SUCCESSFUL

- [ ] **Step 3: Full frontend test suite**

Run: `cd frontend && npm run test -- --run`
Expected: tests pass

- [ ] **Step 4: Stage and commit**

```bash
git add -A
git commit -m "chore: remove Clerk integration and legacy clerk_user_id column"
```

---

## Self-Review

- Spec coverage: every acceptance criterion has a corresponding task.
- Placeholder scan: no TBD/TODO; exact commands and file paths included.
- Type consistency: removing `clerkUserId` consistently from entity, repository, DTO, and frontend model.
