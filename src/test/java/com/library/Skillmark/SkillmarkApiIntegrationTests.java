package com.library.Skillmark;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.Skillmark.attempt.enums.AttemptStatus;
import com.library.Skillmark.attempt.repository.QuizAttemptRepository;
import com.library.Skillmark.user.enums.UserStatus;
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

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
    void protectedEndpointsRequireClerkToken() throws Exception {
        mockMvc.perform(get("/api/v1/organizations"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));

        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void devClerkTokenCreatesAndSyncsLocalUserProfile() throws Exception {
        String token = token("clerk_owner", "owner@example.com", "Owner_One");

        getJson("/api/v1/users/me", token)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.clerkUserId", is("clerk_owner")))
                .andExpect(jsonPath("$.data.email", is("owner@example.com")));

        postJson("/api/v1/users/sync", token, """
                {
                  "name": "Owner Updated",
                  "email": "owner.updated@example.com",
                  "avatarUrl": "https://example.com/avatar.png"
                }
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name", is("Owner Updated")))
                .andExpect(jsonPath("$.data.avatarUrl", is("https://example.com/avatar.png")));
    }

    @Test
    void clerkWebhookRequiresValidSignatureAndSyncsUserLifecycle() throws Exception {
        String createPayload = """
                {
                  "type": "user.created",
                  "data": {
                    "id": "clerk_webhook_user",
                    "first_name": "Webhook",
                    "last_name": "User",
                    "image_url": "https://example.com/webhook.png",
                    "primary_email_address_id": "email_1",
                    "email_addresses": [
                      {"id": "email_1", "email_address": "webhook@example.com"}
                    ]
                  }
                }
                """;

        postWebhook(createPayload, "bad-signature")
                .andExpect(status().isUnauthorized());

        postWebhook(createPayload, signature("msg_1", "123", createPayload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        var created = userRepository.findByClerkUserId("clerk_webhook_user").orElseThrow();
        org.assertj.core.api.Assertions.assertThat(created.getEmail()).isEqualTo("webhook@example.com");
        org.assertj.core.api.Assertions.assertThat(created.getName()).isEqualTo("Webhook User");

        String deletePayload = """
                {
                  "type": "user.deleted",
                  "data": {"id": "clerk_webhook_user"}
                }
                """;
        postWebhook(deletePayload, signature("msg_1", "123", deletePayload))
                .andExpect(status().isOk());

        org.assertj.core.api.Assertions.assertThat(userRepository.findByClerkUserId("clerk_webhook_user").orElseThrow().getStatus())
                .isEqualTo(UserStatus.DELETED);
    }

    @Test
    void ownerCanCreateProgramInviteParticipantAndShareResource() throws Exception {
        String ownerToken = token("clerk_owner", "owner@example.com", "Owner_One");
        String organizationId = createOrganization(ownerToken, "Computer Science Club");

        MvcResult programResult = postJson("/api/v1/organizations/" + organizationId + "/programs", ownerToken, """
                {
                  "title": "Git Workshop",
                  "description": "Intro workshop"
                }
                """)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status", is("DRAFT")))
                .andReturn();
        String programId = read(programResult, "/data/id");

        postJson("/api/v1/programs/" + programId + "/publish", ownerToken, "{}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isPublished", is(true)));

        String invitationCode = read(postJson("/api/v1/programs/" + programId + "/invitations", ownerToken, """
                {
                  "maxUses": 5
                }
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/code");

        String participantToken = token("clerk_student", "student@example.com", "Jane_Student");
        postJson("/api/v1/invitations/" + invitationCode + "/join", participantToken, "{}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.usedCount", is(1)));

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

        getJson("/api/v1/organizations/" + organizationId + "/stats", ownerToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalPrograms", is(1)));
    }

    @Test
    void fullProgramQuizAttemptCertificateFlowUsesEnrollment() throws Exception {
        String ownerToken = token("clerk_owner", "owner@example.com", "Owner_One");
        String organizationId = createOrganization(ownerToken, "Computer Science Club");
        String programId = createPublishedProgram(ownerToken, organizationId);

        String participantToken = token("clerk_student", "student@example.com", "Jane_Student");
        joinProgram(ownerToken, participantToken, programId);

        String quizId = read(postJson("/api/v1/programs/" + programId + "/quizzes", ownerToken, """
                {
                  "title": "Git Basics Final Quiz",
                  "description": "Final assessment",
                  "passingScore": 70,
                  "durationMinutes": 30,
                  "maxAttempts": 1,
                  "certificateEnabled": true,
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

        postJson("/api/v1/quizzes/" + quizId + "/publish", ownerToken, "{}")
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

        MvcResult certificateResult = getJson("/api/v1/certificates/" + certificateId, participantToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.programTitleSnapshot", is("Git Workshop")))
                .andReturn();

        mockMvc.perform(get("/api/v1/public/certificates/verify/" + read(certificateResult, "/data/verificationCode")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.programTitle", is("Git Workshop")))
                .andExpect(jsonPath("$.data.organizationName", is("Computer Science Club")));

        getJson("/api/v1/quizzes/" + quizId + "/stats", ownerToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.submittedAttempts", is(1)));
    }

    @Test
    void expiredAttemptIsRejectedAndCountsTowardMaxAttempts() throws Exception {
        String ownerToken = token("clerk_owner", "owner@example.com", "Owner_One");
        String organizationId = createOrganization(ownerToken, "Computer Science Club");
        String programId = createPublishedProgram(ownerToken, organizationId);
        String participantToken = token("clerk_student", "student@example.com", "Jane_Student");
        joinProgram(ownerToken, participantToken, programId);

        String quizId = read(postJson("/api/v1/programs/" + programId + "/quizzes", ownerToken, """
                {
                  "title": "Timed Quiz",
                  "passingScore": 70,
                  "durationMinutes": 1,
                  "maxAttempts": 1,
                  "certificateEnabled": false,
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

        postJson("/api/v1/quizzes/" + quizId + "/publish", ownerToken, "{}")
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
    void swaggerEndpointsArePublicAndDescribeClerkScopedApi() throws Exception {
        mockMvc.perform(get("/swagger-ui.html"))
                .andExpect(status().is3xxRedirection());

        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title", is("Skillmark Backend API")))
                .andExpect(jsonPath("$.info.description", containsString("Clerk")))
                .andExpect(jsonPath("$.paths['/api/v1/users/sync'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/organizations/{organizationId}/programs'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/programs/{programId}/quizzes'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/files/r2/upload-url'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/media/cloudinary/signature'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/public/certificates/verify/{verificationCode}'].get").exists());
    }

    private String createOrganization(String token, String name) throws Exception {
        MvcResult result = postJson("/api/v1/organizations", token, """
                {
                  "name": "%s"
                }
                """.formatted(name))
                .andExpect(status().isCreated())
                .andReturn();
        return read(result, "/data/id");
    }

    private String createPublishedProgram(String ownerToken, String organizationId) throws Exception {
        String programId = read(postJson("/api/v1/organizations/" + organizationId + "/programs", ownerToken, """
                {
                  "title": "Git Workshop",
                  "description": "Intro workshop"
                }
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/id");
        postJson("/api/v1/programs/" + programId + "/publish", ownerToken, "{}")
                .andExpect(status().isOk());
        return programId;
    }

    private void joinProgram(String ownerToken, String participantToken, String programId) throws Exception {
        String invitationCode = read(postJson("/api/v1/programs/" + programId + "/invitations", ownerToken, """
                {
                  "maxUses": 5
                }
                """)
                .andExpect(status().isCreated())
                .andReturn(), "/data/code");
        postJson("/api/v1/invitations/" + invitationCode + "/join", participantToken, "{}")
                .andExpect(status().isOk());
    }

    private String token(String clerkId, String email, String name) {
        return "dev:" + clerkId + ":" + email + ":" + name;
    }

    private org.springframework.test.web.servlet.ResultActions postJson(String path, String token, String json) throws Exception {
        var request = post(path).contentType(MediaType.APPLICATION_JSON).content(json);
        if (token != null) {
            request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        }
        return mockMvc.perform(request);
    }

    private org.springframework.test.web.servlet.ResultActions postWebhook(String payload, String signature) throws Exception {
        return mockMvc.perform(post("/api/v1/webhooks/clerk")
                .contentType(MediaType.APPLICATION_JSON)
                .header("svix-id", "msg_1")
                .header("svix-timestamp", "123")
                .header("svix-signature", signature)
                .content(payload));
    }

    private String signature(String id, String timestamp, String payload) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec("test-webhook-secret".getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] digest = mac.doFinal((id + "." + timestamp + "." + payload).getBytes(StandardCharsets.UTF_8));
        return "v1," + Base64.getEncoder().encodeToString(digest);
    }

    private org.springframework.test.web.servlet.ResultActions getJson(String path, String token) throws Exception {
        var request = get(path).accept(MediaType.APPLICATION_JSON);
        if (token != null) {
            request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        }
        return mockMvc.perform(request);
    }

    private String read(MvcResult result, String pointer) throws Exception {
        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.at(pointer).asText();
    }
}
