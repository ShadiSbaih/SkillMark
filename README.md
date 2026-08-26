# Skillmark - Skills Assessment & Certificate Platform

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.6-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-21.2-red.svg)](https://angular.dev/)
[![Java](https://img.shields.io/badge/Java-17-blue.svg)](https://www.oracle.com/java/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Skillmark** is a multi-tenant enterprise skills assessment and certificate issuance platform. It enables organizations to create structured training programs, design interactive quizzes with automated scoring, track participant performance with real-time analytics, and issue verifiable digital certificates equipped with QR codes for public verification.

---

## 🚀 Features

- **Multi-Tenant Organization Management**: Secure tenant isolation with organization-level roles (`OWNER` vs `PARTICIPANT`).
- **Program & Enrollment Lifecycle**: Publish courses/workshops, manage invitation links, and track participant enrollments.
- **Interactive Quiz & Assessment Engine**:
  - Flexible question types (multiple-choice, single-answer).
  - Server-calculated quiz scoring to prevent client-side tampering.
  - Configurable passing scores and maximum attempt limits.
- **Automated Certificate Issuance & Public Verification**:
  - Auto-generate PDF certificates using OpenPDF upon passing quizzes.
  - Built-in QR codes generated via ZXing for instant public credential verification.
  - Support for manual issuance, revocation, and immutable audit trailing.
- **Rich Analytics & Dashboards**:
  - Global and program-specific performance statistics.
  - Score distribution charts, completion timelines, and question-level metrics.
- **Cloud Storage & Email Integration**:
  - **Cloudflare R2** for secure PDF certificate storage.
  - **Cloudinary** for media and logo handling.
  - **SendGrid** for transactional email delivery and verification.
- **Interactive API Documentation**: Embedded Swagger UI and OpenAPI v3 specs for seamless API exploration.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Java 17, Spring Boot 4, Spring Data JPA, Spring Security
- **Database**: PostgreSQL (Production/Dev), H2 (In-memory dev & unit testing), Flyway Schema Migrations
- **Security**: Native JWT Authentication, Custom Security Guards, BCrypt Hashing
- **Utilities**: OpenPDF (PDF Generation), ZXing (QR Code Generation), SendGrid SDK, AWS S3 SDK (Cloudflare R2)

### Frontend
- **Framework**: Angular 21 (Standalone components, modern signals)
- **State & Data Fetching**: TanStack Query (`@tanstack/angular-query-experimental`), RxJS
- **Data Visualization**: Chart.js
- **UI & Styling**: Modern SCSS, Lucide Icons (`lucide-angular`), Ngx-Sonner toasts

---

## 📁 Repository Structure

```text
.
├── backend/                  # Spring Boot backend API application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/library/Skillmark/  # Application source code
│   │   │   └── resources/                    # Application properties & Flyway migrations
│   │   └── test/                             # Integration and unit test suite
│   ├── build.gradle          # Gradle build file & dependencies
│   ├── gradlew / gradlew.bat # Gradle wrapper scripts
│   └── Readme.md             # Detailed backend setup & developer guide
├── frontend/                 # Angular 21 SPA frontend application
│   ├── src/                  # Angular source code (components, services, assets)
│   ├── public/               # Static assets & public images
│   ├── package.json          # Frontend dependencies & npm scripts
│   └── README.md             # Frontend specific setup guide
└── README.md                 # Project root README
```

---

## ⚙️ Quick Start

### Prerequisites
- **Java**: JDK 17 or higher
- **Node.js**: Node 18+ and `npm`
- **Database** *(Optional for local H2 mode)*: PostgreSQL 15+

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Run in Fast Local Mode (H2 Database)**:
   Does not require an external database setup; uses in-memory H2.
   - **Linux / macOS**:
     ```bash
     ./gradlew bootRun --args="--spring.profiles.active=local"
     ```
   - **Windows (PowerShell)**:
     ```powershell
     .\gradlew.bat bootRun --args="--spring.profiles.active=local"
     ```

3. **Run with Local PostgreSQL**:
   Ensure PostgreSQL is running on `localhost:5432` with database `skillmark`.
   - **Linux / macOS**:
     ```bash
     ./gradlew bootRun --args="--spring.profiles.active=local-postgres"
     ```
   - **Windows (PowerShell)**:
     ```powershell
     .\gradlew.bat bootRun --args="--spring.profiles.active=local-postgres"
     ```

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:4200/`.

---

## 🔑 Environment Variables

For production or customized backend runs, set the following environment variables:

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | JDBC URL for PostgreSQL | `jdbc:postgresql://localhost:5432/Skillmark` |
| `DATABASE_USERNAME` | PostgreSQL username | `postgres` |
| `DATABASE_PASSWORD` | PostgreSQL password | `postgres` |
| `JWT_SECRET` | Secret key for signing JWT tokens | Custom secret string |
| `JWT_EXPIRATION` | Token expiration in milliseconds | `86400000` (24 hours) |

---

## 📖 API Documentation & Swagger UI

When the backend application is running, interact with the API endpoints via Swagger UI:

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI v3 JSON**: `http://localhost:8080/v3/api-docs`
- **Health Check**: `http://localhost:8080/actuator/health`

### Authenticating in Swagger
1. Call `POST /api/v1/auth/register` or `POST /api/v1/auth/login`.
2. Copy the returned JWT token from the response.
3. Click the **Authorize** button at the top of the Swagger UI page and paste your token.

---

## 🧪 Testing

### Backend Tests
The backend test suite uses H2 in-memory database and JUnit 5 with Testcontainers support:
```bash
cd backend
./gradlew test
```

### Frontend Tests
Run unit tests with Vitest:
```bash
cd frontend
npm test -- --run
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
