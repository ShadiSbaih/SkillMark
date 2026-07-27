package com.library.Skillmark;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.Skillmark.attempt.enums.AttemptStatus;
import com.library.Skillmark.attempt.repository.QuizAttemptRepository;
import com.library.Skillmark.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
@Testcontainers(disabledWithoutDocker = true)
class SkillmarkApiIntegrationTests {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void postgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", postgres::getDriverClassName);
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
        registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.PostgreSQLDialect");
    }

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizAttemptRepository attemptRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    void protectedEndpointsRequireToken() throws Exception {
        mockMvc.perform(get("/api/v1/programs"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));

        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));

        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void devTokenCreatesAndUpdatesLocalUserProfile() throws Exception {
        String token = token("owner_user", "owner@example.com", "Owner_One");

        getJson("/api/v1/users/me", token)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email", is("owner@example.com")));

        patchJson("/api/v1/users/me", token, """
                {
                  "name": "Owner Updated",
                  "avatarUrl": "https://example.com/avatar.png"
                }
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name", is("Owner Updated")))
                .andExpect(jsonPath("$.data.avatarUrl", is("https://example.com/avatar.png")))
                .andExpect(jsonPath("$.data.email", is("owner@example.com")));

        patchJson("/api/v1/users/me", token, """
                {
                  "email": "owner.updated@example.com"
                }
                """)
                .andExpect(status().isBadRequest());
    }

    @Test
    void apiDocsAndScalarArePublic() throws Exception {
        mockMvc.perform(get("/docs.html"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title", is("Skillmark Backend API")))
                .andExpect(jsonPath("$.paths['/api/v1/users/me'].patch").exists())
                .andExpect(jsonPath("$.paths['/api/v1/programs'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/programs/{programId}/quizzes'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/storage/upload-urls'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/media/signatures'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/public/certificates/verify/{verificationCode}'].get").exists());
    }

    @Test
    void ownerCanCreateProgramInviteParticipantAndShareResource() throws Exception {
        String ownerToken = token("owner_user", "owner@example.com", "Owner_One");
        String programId = createPublishedProgram(ownerToken);



        patchJson("/api/v1/programs/" + programId + "/status", ownerToken, """
                {
                  "status": "PUBLISHED"
                }
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isPublished", is(true)));

        String invitationCode = read(postJson("/api/v1/programs/" + programId + "/invitations", ownerToken, """
                {}
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/code");

        String participantToken = token("student_user", "student@example.com", "Jane_Student");
        postJson("/api/v1/invitations/" + invitationCode + "/join", participantToken, "{}")
                .andExpect(status().isOk());

        postJson("/api/v1/programs/" + programId + "/resources", ownerToken, """
                {
                  "title": "Slides",
                  "type": "LINK",
                  "url": "https://example.com/slides",
                  "position": 1
                }
                """)
                .andExpect(status().isCreated());

        getJson("/api/v1/programs/" + programId + "/resources", participantToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[0].title", is("Slides")));

        getJson("/api/v1/stats", ownerToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalPrograms", is(1)));
    }

    @Test
    void fullProgramQuizAttemptCertificateFlowUsesEnrollment() throws Exception {
        String ownerToken = token("owner_user", "owner@example.com", "Owner_One");
        String programId = createPublishedProgram(ownerToken);

        String participantToken = token("student_user", "student@example.com", "Jane_Student");
        joinProgram(ownerToken, participantToken, programId);

        String quizId = read(postJson("/api/v1/programs/" + programId + "/quizzes", ownerToken, """
                {
                  "title": "Git Basics Final Quiz",
                  "description": "Final assessment",
                  "passingScore": 70,
                  "durationMinutes": 30,
                  "maxAttempts": 1,
                  "certificateIssueMode": "AUTO"
                }
                """)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.programId", is(programId)))
                .andReturn(), "/data/id");

        String correctOptionId = read(postJson("/api/v1/quizzes/" + quizId + "/questions", ownerToken, """
                {
                  "text": "Which command creates a branch?",
                  "type": "SINGLE_CHOICE",
                  "points": 1,
                  "position": 1,
                  "options": [
                    {"text": "git branch feature", "isCorrect": true, "position": 1},
                    {"text": "git make feature", "isCorrect": false, "position": 2}
                  ]
                }
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/options/0/id");

        patchJson("/api/v1/quizzes/" + quizId + "/status", ownerToken, """
                {
                  "status": "PUBLISHED"
                }
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isPublished", is(true)));

        String questionId = read(getJson("/api/v1/quizzes/" + quizId, participantToken)
                .andExpect(status().isOk())
                .andReturn(), "/data/questions/0/id");

        String attemptId = read(postJson("/api/v1/quizzes/" + quizId + "/attempts", participantToken, "{}")
                .andExpect(status().isCreated())
                .andReturn(), "/data/attemptId");

        String certificateId = read(postJson("/api/v1/quiz-attempts/" + attemptId + "/submit", participantToken, """
                {
                  "answers": [
                    {
                      "questionId": "%s",
                      "selectedOptionId": "%s"
                    }
                  ]
                }
                """.formatted(questionId, correctOptionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.passed", is(true)))
                .andExpect(jsonPath("$.data.certificateIssued", is(true)))
                .andReturn(), "/data/certificateId");

        putJson("/api/v1/quizzes/" + quizId + "/questions/" + questionId, ownerToken, """
                {
                  "text": "Changed after submit?",
                  "type": "SINGLE_CHOICE",
                  "points": 1,
                  "position": 1,
                  "options": [
                    {"text": "A", "isCorrect": true, "position": 1},
                    {"text": "B", "isCorrect": false, "position": 2}
                  ]
                }
                """)
                .andExpect(status().isUnprocessableEntity());

        MvcResult certificateResult = getJson("/api/v1/certificates/" + certificateId, participantToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.programTitleSnapshot", is("Git Workshop")))
                .andReturn();

        mockMvc.perform(get("/api/v1/public/certificates/verify/" + read(certificateResult, "/data/verificationCode")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.programTitle", is("Git Workshop")));


        getJson("/api/v1/quizzes/" + quizId + "/stats", ownerToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.submittedAttempts", is(1)));
    }

    @Test
    void expiredAttemptIsRejectedAndCountsTowardMaxAttempts() throws Exception {
        String ownerToken = token("owner_user", "owner@example.com", "Owner_One");
        String programId = createPublishedProgram(ownerToken);
        String participantToken = token("student_user", "student@example.com", "Jane_Student");
        joinProgram(ownerToken, participantToken, programId);

        String quizId = read(postJson("/api/v1/programs/" + programId + "/quizzes", ownerToken, """
                {
                  "title": "Timed Quiz",
                  "passingScore": 70,
                  "durationMinutes": 1,
                  "maxAttempts": 1,
                  "certificateIssueMode": "NONE"
                }
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/id");

        String correctOptionId = read(postJson("/api/v1/quizzes/" + quizId + "/questions", ownerToken, """
                {
                  "text": "Pick one",
                  "type": "SINGLE_CHOICE",
                  "points": 1,
                  "position": 1,
                  "options": [
                    {"text": "A", "isCorrect": true, "position": 1},
                    {"text": "B", "isCorrect": false, "position": 2}
                  ]
                }
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/options/0/id");

        patchJson("/api/v1/quizzes/" + quizId + "/status", ownerToken, """
                {
                  "status": "PUBLISHED"
                }
                """)
                .andExpect(status().isOk());
        String questionId = read(getJson("/api/v1/quizzes/" + quizId, participantToken)
                .andExpect(status().isOk())
                .andReturn(), "/data/questions/0/id");
        String attemptId = read(postJson("/api/v1/quizzes/" + quizId + "/attempts", participantToken, "{}")
                .andExpect(status().isCreated())
                .andReturn(), "/data/attemptId");

        var attempt = attemptRepository.findById(java.util.UUID.fromString(attemptId)).orElseThrow();
        attempt.setExpiresAt(Instant.now().minusSeconds(1));
        attemptRepository.save(attempt);

        postJson("/api/v1/quiz-attempts/" + attemptId + "/submit", participantToken, """
                {
                  "answers": [
                    {"questionId": "%s", "selectedOptionId": "%s"}
                  ]
                }
                """.formatted(questionId, correctOptionId))
                .andExpect(status().isUnprocessableEntity());

        org.assertj.core.api.Assertions.assertThat(attemptRepository.findById(java.util.UUID.fromString(attemptId)).orElseThrow().getStatus())
                .isEqualTo(AttemptStatus.EXPIRED);

        postJson("/api/v1/quizzes/" + quizId + "/attempts", participantToken, "{}")
                .andExpect(status().isUnprocessableEntity());
    }

    @Test
    void concurrentInvitationJoinsBothSucceed() throws Exception {
        String ownerToken = token("owner_user", "owner@example.com", "Owner_One");
        String programId = createPublishedProgram(ownerToken);
        String invitationCode = read(postJson("/api/v1/programs/" + programId + "/invitations", ownerToken, """
                {}
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/code");

        var executor = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);
        List<java.util.concurrent.Callable<Integer>> tasks = List.of(
                () -> joinConcurrently(invitationCode, token("student_user_1", "student1@example.com", "Student_One"), ready, start),
                () -> joinConcurrently(invitationCode, token("student_user_2", "student2@example.com", "Student_Two"), ready, start)
        );
        var futures = tasks.stream().map(executor::submit).toList();
        org.assertj.core.api.Assertions.assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue();
        start.countDown();
        var statuses = futures.stream().map(future -> {
            try {
                return future.get(10, TimeUnit.SECONDS);
            } catch (Exception ex) {
                throw new RuntimeException(ex);
            }
        }).toList();
        executor.shutdownNow();

        org.assertj.core.api.Assertions.assertThat(statuses).containsExactly(200, 200);
    }

    @Test
    void ownerCanRevokeCertificate() throws Exception {
        String ownerToken = token("owner_user", "owner@example.com", "Owner_One");
        String programId = createPublishedProgram(ownerToken);

        String participantToken = token("student_user", "student@example.com", "Jane_Student");
        joinProgram(ownerToken, participantToken, programId);

        String quizId = read(postJson("/api/v1/programs/" + programId + "/quizzes", ownerToken, """
                {
                  "title": "Certificate Quiz",
                  "description": "Earn a certificate",
                  "passingScore": 70,
                  "durationMinutes": 30,
                  "maxAttempts": 1,
                  "certificateIssueMode": "AUTO"
                }
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/id");

        String correctOptionId = read(postJson("/api/v1/quizzes/" + quizId + "/questions", ownerToken, """
                {
                  "text": "Pick A",
                  "type": "SINGLE_CHOICE",
                  "points": 1,
                  "position": 1,
                  "options": [
                    {"text": "A", "isCorrect": true, "position": 1},
                    {"text": "B", "isCorrect": false, "position": 2}
                  ]
                }
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/options/0/id");

        patchJson("/api/v1/quizzes/" + quizId + "/status", ownerToken, """
                {
                  "status": "PUBLISHED"
                }
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isPublished", is(true)));

        String questionId = read(getJson("/api/v1/quizzes/" + quizId, participantToken)
                .andExpect(status().isOk())
                .andReturn(), "/data/questions/0/id");

        String attemptId = read(postJson("/api/v1/quizzes/" + quizId + "/attempts", participantToken, "{}")
                .andExpect(status().isCreated())
                .andReturn(), "/data/attemptId");

        String certificateId = read(postJson("/api/v1/quiz-attempts/" + attemptId + "/submit", participantToken, """
                {
                  "answers": [
                    {"questionId": "%s", "selectedOptionId": "%s"}
                  ]
                }
                """.formatted(questionId, correctOptionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.passed", is(true)))
                .andExpect(jsonPath("$.data.certificateIssued", is(true)))
                .andReturn(), "/data/certificateId");

        getJson("/api/v1/certificates", ownerToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items.length()", is(1)))
                .andExpect(jsonPath("$.data.items[0].id", is(certificateId)));

        postJson("/api/v1/certificates/" + certificateId + "/revoke", ownerToken, """
                {
                  "reason": "Test revocation"
                }
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("REVOKED")));

        MvcResult certificateResult = getJson("/api/v1/certificates/" + certificateId, participantToken)
                .andExpect(status().isOk())
                .andReturn();

        mockMvc.perform(get("/api/v1/public/certificates/verify/" + read(certificateResult, "/data/verificationCode")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("REVOKED")));
    }

    @Test
    void ownerCanUpdateAndArchiveResource() throws Exception {
        String ownerToken = token("owner_user", "owner@example.com", "Owner_One");
        String programId = createPublishedProgram(ownerToken);

        String participantToken = token("student_user", "student@example.com", "Jane_Student");
        joinProgram(ownerToken, participantToken, programId);

        String resourceId = read(postJson("/api/v1/programs/" + programId + "/resources", ownerToken, """
                {
                  "title": "Slides",
                  "type": "LINK",
                  "url": "https://example.com/slides",
                  "position": 1
                }
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/id");

        putJson("/api/v1/resources/" + resourceId, ownerToken, """
                {
                  "title": "Updated Slides",
                  "type": "LINK",
                  "url": "https://example.com/updated",
                  "position": 2
                }
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title", is("Updated Slides")));

        patchJson("/api/v1/resources/" + resourceId + "/visibility", ownerToken, """
                {
                  "visibleToParticipants": false
                }
                """)
                .andExpect(status().isOk());

        getJson("/api/v1/programs/" + programId + "/resources", participantToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items.length()", is(0)));

        deleteJson("/api/v1/resources/" + resourceId, ownerToken)
                .andExpect(status().isOk());

        getJson("/api/v1/programs/" + programId + "/resources", ownerToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items.length()", is(0)));
    }



    @Test
    void ownerCanToggleQuizVisibility() throws Exception {
        String ownerToken = token("owner_user", "owner@example.com", "Owner_One");
        String programId = createPublishedProgram(ownerToken);

        String participantToken = token("student_user", "student@example.com", "Jane_Student");
        joinProgram(ownerToken, participantToken, programId);

        String quizId = read(postJson("/api/v1/programs/" + programId + "/quizzes", ownerToken, """
                {
                  "title": "Visible Quiz",
                  "description": "Toggle visibility",
                  "passingScore": 70,
                  "durationMinutes": 30,
                  "maxAttempts": 1,
                  "certificateIssueMode": "NONE"
                }
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/id");

        postJson("/api/v1/quizzes/" + quizId + "/questions", ownerToken, """
                {
                  "text": "Pick A",
                  "type": "SINGLE_CHOICE",
                  "points": 1,
                  "position": 1,
                  "options": [
                    {"text": "A", "isCorrect": true, "position": 1},
                    {"text": "B", "isCorrect": false, "position": 2}
                  ]
                }
                """)
                .andExpect(status().isCreated());

        patchJson("/api/v1/quizzes/" + quizId + "/status", ownerToken, """
                {
                  "status": "PUBLISHED"
                }
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isPublished", is(true)));

        getJson("/api/v1/quizzes/" + quizId, participantToken)
                .andExpect(status().isOk());

        patchJson("/api/v1/quizzes/" + quizId + "/visibility", ownerToken, """
                {
                  "visibleToParticipants": false
                }
                """)
                .andExpect(status().isOk());

        getJson("/api/v1/quizzes/" + quizId, participantToken)
                .andExpect(status().isNotFound());

        patchJson("/api/v1/quizzes/" + quizId + "/visibility", ownerToken, """
                {
                  "visibleToParticipants": true
                }
                """)
                .andExpect(status().isOk());

        getJson("/api/v1/quizzes/" + quizId, participantToken)
                .andExpect(status().isOk());
    }

    @Test
    void ownerCanRemoveEnrollment() throws Exception {
        String ownerToken = token("owner_user", "owner@example.com", "Owner_One");
        String programId = createPublishedProgram(ownerToken);

        String participantToken = token("student_user", "student@example.com", "Jane_Student");
        joinProgram(ownerToken, participantToken, programId);

        String participantUserId = read(getJson("/api/v1/users/me", participantToken)
                .andExpect(status().isOk())
                .andReturn(), "/data/id");

        deleteJson("/api/v1/programs/" + programId + "/enrollments/" + participantUserId, ownerToken)
                .andExpect(status().isOk());

        getJson("/api/v1/programs/" + programId + "/resources", participantToken)
                .andExpect(status().isNotFound());
    }

    @Test
    void joiningInvitationCreatesProgramEnrollment() throws Exception {
        String ownerToken = token("owner_user", "owner@example.com", "Owner_One");
        String programId = createPublishedProgram(ownerToken);

        String participantToken = token("student_user", "student@example.com", "Jane_Student");
        String participantUserId = read(getJson("/api/v1/users/me", participantToken)
                .andExpect(status().isOk())
                .andReturn(), "/data/id");

        String invitationCode = read(postJson("/api/v1/programs/" + programId + "/invitations", ownerToken, """
                {}
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/code");

        postJson("/api/v1/invitations/" + invitationCode + "/join", participantToken, "{}")
                .andExpect(status().isOk());

        getJson("/api/v1/programs/" + programId + "/enrollments", ownerToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.items[*].userId", org.hamcrest.Matchers.hasItem(participantUserId)));
    }

    @Test
    void passingAutoModeQuizIssuesCertificateImmediately() throws Exception {
        String ownerToken = token("owner_user", "owner@example.com", "Owner_One");
        String programId = createPublishedProgram(ownerToken);

        String participantToken = token("student_user", "student@example.com", "Jane_Student");
        joinProgram(ownerToken, participantToken, programId);

        String quizId = read(postJson("/api/v1/programs/" + programId + "/quizzes", ownerToken, """
                {
                  "title": "Auto Certificate Quiz",
                  "description": "Auto issue",
                  "passingScore": 70,
                  "durationMinutes": 30,
                  "maxAttempts": 1,
                  "certificateIssueMode": "AUTO"
                }
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/id");

        String correctOptionId = read(postJson("/api/v1/quizzes/" + quizId + "/questions", ownerToken, """
                {
                  "text": "Pick A",
                  "type": "SINGLE_CHOICE",
                  "points": 1,
                  "position": 1,
                  "options": [
                    {"text": "A", "isCorrect": true, "position": 1},
                    {"text": "B", "isCorrect": false, "position": 2}
                  ]
                }
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/options/0/id");

        patchJson("/api/v1/quizzes/" + quizId + "/status", ownerToken, """
                {
                  "status": "PUBLISHED"
                }
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isPublished", is(true)));

        String questionId = read(getJson("/api/v1/quizzes/" + quizId, participantToken)
                .andExpect(status().isOk())
                .andReturn(), "/data/questions/0/id");

        String attemptId = read(postJson("/api/v1/quizzes/" + quizId + "/attempts", participantToken, "{}")
                .andExpect(status().isCreated())
                .andReturn(), "/data/attemptId");

        postJson("/api/v1/quiz-attempts/" + attemptId + "/submit", participantToken, """
                {
                  "answers": [
                    {"questionId": "%s", "selectedOptionId": "%s"}
                  ]
                }
                """.formatted(questionId, correctOptionId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.passed", is(true)))
                .andExpect(jsonPath("$.data.certificateIssued", is(true)))
                .andExpect(jsonPath("$.data.certificateId").exists());
    }



    private String createPublishedProgram(String ownerToken) throws Exception {
        String programId = read(postJson("/api/v1/programs", ownerToken, """
                {
                  "title": "Git Workshop",
                  "description": "Intro workshop"
                }
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/id");
        patchJson("/api/v1/programs/" + programId + "/status", ownerToken, """
                {
                  "status": "PUBLISHED"
                }
                """)
                .andExpect(status().isOk());
        return programId;
    }

    private void joinProgram(String ownerToken, String participantToken, String programId) throws Exception {
        String invitationCode = read(postJson("/api/v1/programs/" + programId + "/invitations", ownerToken, """
                {}
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/code");
        postJson("/api/v1/invitations/" + invitationCode + "/join", participantToken, "{}")
                .andExpect(status().isOk());
    }

    private String token(String userId, String email, String name) {
        UUID deterministicId = UUID.nameUUIDFromBytes(userId.getBytes(StandardCharsets.UTF_8));
        return "dev:" + deterministicId + ":" + email + ":" + name;
    }

    private org.springframework.test.web.servlet.ResultActions postJson(String path, String token, String json) throws Exception {
        var request = post(path).contentType(MediaType.APPLICATION_JSON).content(json);
        if (token != null) {
            request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        }
        return mockMvc.perform(request);
    }

    private org.springframework.test.web.servlet.ResultActions putJson(String path, String token, String json) throws Exception {
        var request = put(path).contentType(MediaType.APPLICATION_JSON).content(json);
        if (token != null) {
            request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        }
        return mockMvc.perform(request);
    }

    private org.springframework.test.web.servlet.ResultActions getJson(String path, String token) throws Exception {
        var request = get(path).accept(MediaType.APPLICATION_JSON);
        if (token != null) {
            request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        }
        return mockMvc.perform(request);
    }

    private org.springframework.test.web.servlet.ResultActions deleteJson(String path, String token) throws Exception {
        var request = delete(path);
        if (token != null) {
            request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        }
        return mockMvc.perform(request);
    }

    private org.springframework.test.web.servlet.ResultActions patchJson(String path, String token, String json) throws Exception {
        var request = patch(path).contentType(MediaType.APPLICATION_JSON).content(json);
        if (token != null) {
            request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        }
        return mockMvc.perform(request);
    }

    private int joinConcurrently(String invitationCode, String token, CountDownLatch ready, CountDownLatch start) throws Exception {
        ready.countDown();
        org.assertj.core.api.Assertions.assertThat(start.await(5, TimeUnit.SECONDS)).isTrue();
        return postJson("/api/v1/invitations/" + invitationCode + "/join", token, "{}")
                .andReturn()
                .getResponse()
                .getStatus();
    }

    private String read(MvcResult result, String pointer) throws Exception {
        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.at(pointer).asText();
    }
}
