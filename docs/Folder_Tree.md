│
├── README.md
├── AGENTS.md
├── PRD.md
├── DB_Design.md
├── Architecture.md
├── API_Design.md
├── Backend_Business_Scenarios.md
│
├── pom.xml
├── .env.example
├── .gitignore
│
└── src
    ├── main
    │   ├── java
    │   │   └── com
    │   │       └── Skillmark
    │   │           └── backend
    │   │               │
    │   │               ├── SkillmarkBackendApplication.java
    │   │               │
    │   │               ├── auth
    │   │               │   ├── controller
    │   │               │   │   └── AuthController.java
    │   │               │   │
    │   │               │   ├── dto
    │   │               │   │   ├── LoginRequest.java
    │   │               │   │   ├── RegisterRequest.java
    │   │               │   │   ├── AuthResponse.java
    │   │               │   │   ├── RefreshTokenRequest.java
    │   │               │   │   ├── ForgotPasswordRequest.java
    │   │               │   │   ├── ResetPasswordRequest.java
    │   │               │   │   └── VerifyEmailRequest.java
    │   │               │   │
    │   │               │   ├── entity
    │   │               │   │   ├── RefreshToken.java
    │   │               │   │   ├── PasswordResetToken.java
    │   │               │   │   └── EmailVerificationToken.java
    │   │               │   │
    │   │               │   ├── repository
    │   │               │   │   ├── RefreshTokenRepository.java
    │   │               │   │   ├── PasswordResetTokenRepository.java
    │   │               │   │   └── EmailVerificationTokenRepository.java
    │   │               │   │
    │   │               │   └── service
    │   │               │       ├── AuthService.java
    │   │               │       ├── RefreshTokenService.java
    │   │               │       ├── PasswordResetService.java
    │   │               │       └── EmailVerificationService.java
    │   │               │
    │   │               ├── user
    │   │               │   ├── controller
    │   │               │   │   └── UserController.java
    │   │               │   │
    │   │               │   ├── dto
    │   │               │   │   ├── UserResponse.java
    │   │               │   │   └── UpdateUserRequest.java
    │   │               │   │
    │   │               │   ├── entity
    │   │               │   │   └── User.java
    │   │               │   │
    │   │               │   ├── enums
    │   │               │   │   └── UserStatus.java
    │   │               │   │
    │   │               │   ├── repository
    │   │               │   │   └── UserRepository.java
    │   │               │   │
    │   │               │   └── service
    │   │               │       └── UserService.java
    │   │               │
    │   │               ├── organization
    │   │               │   ├── controller
    │   │               │   │   └── OrganizationController.java
    │   │               │   │
    │   │               │   ├── dto
    │   │               │   │   ├── CreateOrganizationRequest.java
    │   │               │   │   ├── UpdateOrganizationRequest.java
    │   │               │   │   └── OrganizationResponse.java
    │   │               │   │
    │   │               │   ├── entity
    │   │               │   │   └── Organization.java
    │   │               │   │
    │   │               │   ├── enums
    │   │               │   │   └── OrganizationStatus.java
    │   │               │   │
    │   │               │   ├── repository
    │   │               │   │   └── OrganizationRepository.java
    │   │               │   │
    │   │               │   └── service
    │   │               │       └── OrganizationService.java
    │   │               │
    │   │               ├── membership
    │   │               │   ├── controller
    │   │               │   │   └── MembershipController.java
    │   │               │   │
    │   │               │   ├── dto
    │   │               │   │   ├── AddMemberRequest.java
    │   │               │   │   └── MembershipResponse.java
    │   │               │   │
    │   │               │   ├── entity
    │   │               │   │   └── OrganizationMembership.java
    │   │               │   │
    │   │               │   ├── enums
    │   │               │   │   ├── MembershipRole.java
    │   │               │   │   └── MembershipStatus.java
    │   │               │   │
    │   │               │   ├── repository
    │   │               │   │   └── OrganizationMembershipRepository.java
    │   │               │   │
    │   │               │   └── service
    │   │               │       └── MembershipService.java
    │   │               │
    │   │               ├── quiz
    │   │               │   ├── controller
    │   │               │   │   └── QuizController.java
    │   │               │   │
    │   │               │   ├── dto
    │   │               │   │   ├── CreateQuizRequest.java
    │   │               │   │   ├── UpdateQuizRequest.java
    │   │               │   │   ├── QuizResponse.java
    │   │               │   │   ├── CreateQuestionRequest.java
    │   │               │   │   ├── QuestionResponse.java
    │   │               │   │   ├── CreateOptionRequest.java
    │   │               │   │   └── OptionResponse.java
    │   │               │   │
    │   │               │   ├── entity
    │   │               │   │   ├── Quiz.java
    │   │               │   │   ├── QuizQuestion.java
    │   │               │   │   └── QuizOption.java
    │   │               │   │
    │   │               │   ├── enums
    │   │               │   │   ├── QuizStatus.java
    │   │               │   │   ├── QuestionType.java
    │   │               │   │   └── CertificateIssueMode.java
    │   │               │   │
    │   │               │   ├── repository
    │   │               │   │   ├── QuizRepository.java
    │   │               │   │   ├── QuizQuestionRepository.java
    │   │               │   │   └── QuizOptionRepository.java
    │   │               │   │
    │   │               │   └── service
    │   │               │       ├── QuizService.java
    │   │               │       └── QuizValidationService.java
    │   │               │
    │   │               ├── attempt
    │   │               │   ├── controller
    │   │               │   │   └── QuizAttemptController.java
    │   │               │   │
    │   │               │   ├── dto
    │   │               │   │   ├── StartAttemptResponse.java
    │   │               │   │   ├── SubmitAttemptRequest.java
    │   │               │   │   ├── SubmitAnswerRequest.java
    │   │               │   │   ├── AttemptResponse.java
    │   │               │   │   └── AttemptResultResponse.java
    │   │               │   │
    │   │               │   ├── entity
    │   │               │   │   ├── QuizAttempt.java
    │   │               │   │   └── QuizAttemptAnswer.java
    │   │               │   │
    │   │               │   ├── enums
    │   │               │   │   └── AttemptStatus.java
    │   │               │   │
    │   │               │   ├── repository
    │   │               │   │   ├── QuizAttemptRepository.java
    │   │               │   │   └── QuizAttemptAnswerRepository.java
    │   │               │   │
    │   │               │   └── service
    │   │               │       ├── QuizAttemptService.java
    │   │               │       └── ScoringService.java
    │   │               │
    │   │               ├── certificate
    │   │               │   ├── controller
    │   │               │   │   ├── CertificateController.java
    │   │               │   │   └── PublicCertificateController.java
    │   │               │   │
    │   │               │   ├── dto
    │   │               │   │   ├── IssueCertificateRequest.java
    │   │               │   │   ├── RevokeCertificateRequest.java
    │   │               │   │   ├── CertificateResponse.java
    │   │               │   │   └── PublicCertificateVerificationResponse.java
    │   │               │   │
    │   │               │   ├── entity
    │   │               │   │   └── Certificate.java
    │   │               │   │
    │   │               │   ├── enums
    │   │               │   │   └── CertificateStatus.java
    │   │               │   │
    │   │               │   ├── repository
    │   │               │   │   └── CertificateRepository.java
    │   │               │   │
    │   │               │   └── service
    │   │               │       ├── CertificateService.java
    │   │               │       └── CertificateVerificationService.java
    │   │               │
    │   │               ├── audit
    │   │               │   ├── entity
    │   │               │   │   └── AuditLog.java
    │   │               │   │
    │   │               │   ├── enums
    │   │               │   │   └── AuditAction.java
    │   │               │   │
    │   │               │   ├── repository
    │   │               │   │   └── AuditLogRepository.java
    │   │               │   │
    │   │               │   └── service
    │   │               │       └── AuditLogService.java
    │   │               │
    │   │               ├── security
    │   │               │   ├── config
    │   │               │   │   └── SecurityConfig.java
    │   │               │   │
    │   │               │   ├── jwt
    │   │               │   │   ├── JwtAuthenticationFilter.java
    │   │               │   │   ├── JwtService.java
    │   │               │   │   └── JwtProperties.java
    │   │               │   │
    │   │               │   ├── service
    │   │               │   │   ├── CustomUserDetailsService.java
    │   │               │   │   └── AuthorizationService.java
    │   │               │   │
    │   │               │   └── model
    │   │               │       └── AuthUser.java
    │   │               │
    │   │               ├── common
    │   │               │   ├── response
    │   │               │   │   ├── ApiResponse.java
    │   │               │   │   └── PageResponse.java
    │   │               │   │
    │   │               │   ├── exception
    │   │               │   │   ├── GlobalExceptionHandler.java
    │   │               │   │   ├── NotFoundException.java
    │   │               │   │   ├── BadRequestException.java
    │   │               │   │   ├── UnauthorizedException.java
    │   │               │   │   ├── ForbiddenException.java
    │   │               │   │   ├── ConflictException.java
    │   │               │   │   └── BusinessRuleException.java
    │   │               │   │
    │   │               │   ├── dto
    │   │               │   │   └── ErrorResponse.java
    │   │               │   │
    │   │               │   ├── enums
    │   │               │   │   └── EntityStatus.java
    │   │               │   │
    │   │               │   └── util
    │   │               │       ├── TokenGenerator.java
    │   │               │       └── HashUtil.java
    │   │               │
    │   │               └── config
    │   │                   ├── OpenApiConfig.java
    │   │                   ├── CorsConfig.java
    │   │                   └── AppProperties.java
    │   │
    │   └── resources
    │       ├── application.yml
    │       ├── application-dev.yml
    │       ├── application-prod.yml
    │       │
    │       └── db
    │           └── migration
    │               ├── V1__create_users_table.sql
    │               ├── V2__create_auth_tokens_tables.sql
    │               ├── V3__create_organizations_table.sql
    │               ├── V4__create_memberships_table.sql
    │               ├── V5__create_quizzes_tables.sql
    │               ├── V6__create_attempts_tables.sql
    │               ├── V7__create_certificates_table.sql
    │               └── V8__create_audit_logs_table.sql
    │
    └── test
        └── java
            └── com
                └── Skillmark
                    └── backend
                        ├── auth
                        │   └── AuthServiceTest.java
                        │
                        ├── organization
                        │   └── OrganizationServiceTest.java
                        │
                        ├── membership
                        │   └── MembershipServiceTest.java
                        │
                        ├── quiz
                        │   └── QuizServiceTest.java
                        │
                        ├── attempt
                        │   └── QuizAttemptServiceTest.java
                        │
                        ├── certificate
                        │   └── CertificateServiceTest.java
                        │
                        └── security
                            └── AuthorizationServiceTest.java