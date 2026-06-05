# How To Run Skillmark

This guide explains how to run the Skillmark backend API, run tests, and use Swagger/OpenAPI.

It is written for the next developer who opens this project and wants the fastest path to a working local setup.

## Quick Commands

If you only want the exact commands, use these.

### Windows PowerShell

#### Run the project with local H2

```powershell
.\gradlew.bat bootRun --args="--spring.profiles.active=local"
```

#### Run the project with local PostgreSQL (local-postgres profile)

```powershell
.\gradlew.bat bootRun --args="--spring.profiles.active=local-postgres"
```

#### Run the project with PostgreSQL (Environment Variables)

```powershell
$env:DATABASE_URL="jdbc:postgresql://localhost:5432/Skillmark"
$env:DATABASE_USERNAME="postgres"
$env:DATABASE_PASSWORD="postgres"
$env:JWT_SECRET="change-me-in-production-012345678901234567890123"
$env:JWT_EXPIRATION="86400000"
.\gradlew.bat bootRun
```

#### Run all tests

```powershell
.\gradlew.bat test
```

#### Run one integration test class

```powershell
.\gradlew.bat test --tests "com.library.Skillmark.SkillmarkApiIntegrationTests"
```

#### Build the project

```powershell
.\gradlew.bat clean build
```

#### Run on another port

```powershell
.\gradlew.bat bootRun --args="--server.port=8081 --spring.profiles.active=local"
```

```powershell
.\gradlew.bat bootRun --args="--server.port=8081 --spring.profiles.active=local-postgres"
```

### Open in browser after startup

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Health: `http://localhost:8080/actuator/health`

## Project Summary

- Stack: Spring Boot, Spring Security, Spring Data JPA, Flyway, PostgreSQL
- Build tool: Gradle Wrapper
- Java version: 17
- Default app port: `8080`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Prerequisites

Install the following before running the project:

- Java 17
- Git
- PostgreSQL if you want to run the default database-backed app mode

You do not need to install Gradle separately because the project includes the Gradle Wrapper:

- Windows: `gradlew.bat`
- macOS/Linux: `./gradlew`

## Project Modes

The project currently supports three useful local run modes:

1. `default`
Uses PostgreSQL, Flyway, and `spring.jpa.hibernate.ddl-auto=validate`.

2. `local`
Uses in-memory H2, disables Flyway, and is best for quick local startup without external database setup.

3. `local-postgres`
Uses local PostgreSQL with Flyway enabled, and validates schema with Hibernate. Best for development that requires PostgreSQL-specific features.

## Important Config Files

- Main runtime config: `src/main/resources/application.properties`
- Local dev config (H2): `src/main/resources/application-local.properties`
- Local dev config (PostgreSQL): `src/main/resources/application-local-postgres.properties`
- Test config: `src/test/resources/application-test.properties`
- Build config: `build.gradle`

## Option 1: Fastest Local Start (H2)

Use this when you just want the API running quickly for development or Swagger browsing.

### Windows PowerShell

```powershell
.\gradlew.bat bootRun --args="--spring.profiles.active=local"
```

### What this does

- Starts the app with the `local` profile
- Uses H2 in-memory database
- Disables Flyway
- Uses `create-drop` schema behavior

### URLs

- API base: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Health endpoint: `http://localhost:8080/actuator/health`

## Option 2: Run With Local PostgreSQL (local-postgres profile)

Use this when you want to run with PostgreSQL locally without setting environment variables.

### Prerequisites

- PostgreSQL running on localhost:5432
- Database named `skillmark` created
- User `postgres` with password `postgres` (or update the config file)

### Windows PowerShell

```powershell
.\gradlew.bat bootRun --args="--spring.profiles.active=local-postgres"
```

### What this does

- Starts the app with the `local-postgres` profile
- Uses local PostgreSQL database
- Runs Flyway migrations
- Validates schema with Hibernate
- Runs on port `8080` unless changed

### URLs

- API base: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- Health endpoint: `http://localhost:8080/actuator/health`

## Option 3: Run With PostgreSQL (Environment Variables)

Use this when you want to run closer to production behavior with custom database settings.

### Step 1: Create a PostgreSQL database

Create a database named `Skillmark`, or use your own name and override the environment variable.

Example defaults used by the application:

- Database URL: `jdbc:postgresql://localhost:5432/Skillmark`
- Username: `postgres`
- Password: `postgres`

### Step 2: Set environment variables

The application reads these values:

- `DATABASE_URL`
- `DATABASE_USERNAME`
- `DATABASE_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION`

### Windows PowerShell example

```powershell
$env:DATABASE_URL="jdbc:postgresql://localhost:5432/Skillmark"
$env:DATABASE_USERNAME="postgres"
$env:DATABASE_PASSWORD="postgres"
$env:JWT_SECRET="change-me-in-production-012345678901234567890123"
$env:JWT_EXPIRATION="86400000"
.\gradlew.bat bootRun
```

### What this does

- Uses PostgreSQL
- Runs Flyway migrations
- Validates schema with Hibernate
- Runs on port `8080` unless changed

## Running Tests

The test suite uses the `test` profile and H2 in-memory database, so PostgreSQL is not required for normal test runs.

### Run all tests

```powershell
.\gradlew.bat test
```

### Useful notes

- Tests run with `@ActiveProfiles("test")`
- Test database is H2 in-memory
- Flyway is disabled in tests
- Test schema is created and dropped automatically

### Current test coverage includes

- application context load
- authentication protection checks
- core training flow integration
- tenant isolation checks
- Swagger endpoint visibility and OpenAPI metadata checks

## Running Swagger

Swagger is already integrated through `springdoc-openapi`.

### Swagger URLs

- UI: `http://localhost:8080/swagger-ui.html`
- JSON docs: `http://localhost:8080/v3/api-docs`

### Security behavior

- Swagger UI is public
- `/v3/api-docs` is public
- Most API endpoints require JWT authentication
- Public auth endpoints:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`

### How to authorize in Swagger

1. Start the app
2. Open Swagger UI
3. Call `POST /api/v1/auth/register` or `POST /api/v1/auth/login`
4. Copy the returned JWT token
5. Click `Authorize` in Swagger UI
6. Paste the token value

The API is configured with a bearer JWT security scheme.

## Quick API Smoke Test

After the app starts, use these steps to confirm everything is working.

### 1. Health check

Open:

```text
http://localhost:8080/actuator/health
```

### 2. Open Swagger UI

Open:

```text
http://localhost:8080/swagger-ui.html
```

### 3. Inspect OpenAPI JSON

Open:

```text
http://localhost:8080/v3/api-docs
```

## Example Auth Requests

### Register

`POST /api/v1/auth/register`

```json
{
  "name": "Owner One",
  "email": "owner1@example.com",
  "password": "password123",
  "role": "OWNER"
}
```

### Login

`POST /api/v1/auth/login`

```json
{
  "email": "owner1@example.com",
  "password": "password123"
}
```

## Common Commands

### Clean and build

```powershell
.\gradlew.bat clean build
```

### Run tests only

```powershell
.\gradlew.bat test
```

### Run one test class

```powershell
.\gradlew.bat test --tests "com.library.Skillmark.SkillmarkApiIntegrationTests"
```

### Run the app on another port

```powershell
.\gradlew.bat bootRun --args="--server.port=8081 --spring.profiles.active=local"
```

## Troubleshooting

### Port `8080` is already in use

Run on another port:

```powershell
.\gradlew.bat bootRun --args="--server.port=8081 --spring.profiles.active=local"
```

Then open:

- `http://localhost:8081/swagger-ui.html`
- `http://localhost:8081/v3/api-docs`

### PostgreSQL connection refused

Check the following:

- PostgreSQL is running
- database name exists
- username and password are correct
- `DATABASE_URL` points to the correct host and port

If you only need local development, switch to the `local` profile instead.

### Flyway or schema validation errors

These usually happen in default mode when:

- the database is empty but migrations did not run
- the schema does not match the entities
- the wrong database is being targeted

Start with the `local` profile if you want a clean dev environment quickly.

### Swagger opens but secured endpoints fail

This is expected until you authorize with a JWT token from:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

## Recommended Developer Workflow

For day-to-day development:

1. Start with the `local` profile
2. Open Swagger UI
3. Register or log in
4. Authorize Swagger with the JWT token
5. Develop and test endpoints
6. Run `.\gradlew.bat test` before pushing changes

For database-sensitive work:

1. Run PostgreSQL mode
2. Verify migrations and schema
3. Re-run integration tests

## File References

- Main config: `src/main/resources/application.properties`
- Local config: `src/main/resources/application-local.properties`
- Test config: `src/test/resources/application-test.properties`
- Security config: `src/main/java/com/library/Skillmark/config/SecurityConfig.java`
- OpenAPI config: `src/main/java/com/library/Skillmark/config/OpenApiConfig.java`
- Integration tests: `src/test/java/com/library/Skillmark/SkillmarkApiIntegrationTests.java`

## Final Notes

- Use the `local` profile for the fastest onboarding
- Use default mode when validating PostgreSQL behavior
- Use Swagger UI for manual endpoint exploration
- Use Gradle tests before opening a PR or merging work
