package com.library.cohive;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class CohiveApiIntegrationTests {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    private final ObjectMapper objectMapper = new ObjectMapper();


    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
    }

    @Test
    void protectedEndpointsRequireTokenIncludingLogout() throws Exception {
        mockMvc.perform(get("/api/v1/courses"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));

        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void swaggerEndpointsArePublicAndExposeOpenApiMetadata() throws Exception {
        mockMvc.perform(get("/swagger-ui.html"))
                .andExpect(status().is3xxRedirection());

        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title", is("Cohive Backend API")))
                .andExpect(jsonPath("$.info.description", containsString("JWT bearer authentication")))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.type", is("http")))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.description", containsString("JWT token")))
                .andExpect(jsonPath("$.paths['/api/v1/auth/register'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/auth/register'].post.summary", is("Register a user")))
                .andExpect(jsonPath("$.paths['/api/v1/auth/logout'].post.security[0].bearerAuth").exists())
                .andExpect(jsonPath("$.paths['/api/v1/courses'].get").exists())
                .andExpect(jsonPath("$.paths['/api/v1/courses'].get.summary", is("List courses")))
                .andExpect(jsonPath("$.paths['/api/v1/courses'].get.description", containsString("optionally filtered by organization")))
                .andExpect(jsonPath("$.paths['/api/v1/resources'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/resources'].post.security[0].bearerAuth").exists())
                .andExpect(jsonPath("$.components.schemas.RegisterRequest.description", containsString("creating a new user")))
                .andExpect(jsonPath("$.components.schemas.RegisterRequest.properties.role.description", containsString("Defaults to STUDENT")))
                .andExpect(jsonPath("$.components.schemas.CreateResourceRequest.properties.url.description", containsString("http:// or https://")))
                .andExpect(jsonPath("$.components.schemas.CreateResourceRequest.properties.type.enum[0]", is("LINK")))
                .andExpect(jsonPath("$.components.schemas.CreateResourceRequest.properties.type.enum[1]", is("DOCUMENT")))
                .andExpect(jsonPath("$.paths['/api/v1/certificates/verify/{certificateCode}'].get").exists());
    }

    @Test
    void ownerCanRunCoreTrainingFlowAndStudentCanReadAssignedContent() throws Exception {
        String ownerToken = register("Owner One", "owner1@example.com", "password123", "OWNER");
        String organizationId = createOrganization(ownerToken, "Tech Academy");
        String studentId = createStudent(ownerToken, organizationId, "Jane Student", "jane@example.com");
        String courseId = createCourse(ownerToken, organizationId, "Spring Boot Basics");

        postJson("/api/v1/enrollments", ownerToken, """
                {
                  "studentId": "%s",
                  "courseId": "%s"
                }
                """.formatted(studentId, courseId))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.studentId", is(studentId)))
                .andExpect(jsonPath("$.data.courseId", is(courseId)));

        postJson("/api/v1/resources", ownerToken, """
                {
                  "title": "Spring Docs",
                  "type": "LINK",
                  "url": "https://docs.spring.io/spring-boot/reference/",
                  "courseId": "%s"
                }
                """.formatted(courseId))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.type", is("LINK")))
                .andExpect(jsonPath("$.data.url", is("https://docs.spring.io/spring-boot/reference/")));

        postJson("/api/v1/resources", ownerToken, """
                {
                  "title": "Course Checklist",
                  "type": "DOCUMENT",
                  "url": "https://docs.spring.io/spring-boot/reference/using/index.html",
                  "courseId": "%s"
                }
                """.formatted(courseId))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.type", is("DOCUMENT")));

        MvcResult quizResult = postJson("/api/v1/quizzes", ownerToken, """
                {
                  "title": "Java Quiz",
                  "courseId": "%s",
                  "passingScore": 70,
                  "published": true,
                  "questions": [
                    {
                      "questionText": "Which Spring component exposes HTTP endpoints?",
                      "points": 10,
                      "displayOrder": 1,
                      "options": [
                        {"optionText": "Controller", "correct": true, "displayOrder": 1},
                        {"optionText": "Repository", "correct": false, "displayOrder": 2}
                      ]
                    }
                  ]
                }
                """.formatted(courseId))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.questions", hasSize(1)))
                .andReturn();
        String quizId = read(quizResult, "/data/id");
        String questionId = read(quizResult, "/data/questions/0/id");
        String correctOptionId = read(quizResult, "/data/questions/0/options/0/id");

        MvcResult certificateResult = postJson("/api/v1/certificates", ownerToken, """
                {
                  "studentId": "%s",
                  "courseId": "%s",
                  "title": "Certificate of Completion"
                }
                """.formatted(studentId, courseId))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.certificateCode", containsString("COHIVE-")))
                .andExpect(jsonPath("$.data.verificationUrl", containsString("/api/v1/certificates/verify/")))
                .andExpect(jsonPath("$.data.studentName", is("Jane Student")))
                .andExpect(jsonPath("$.data.courseTitle", is("Spring Boot Basics")))
                .andExpect(jsonPath("$.data.organizationName", is("Tech Academy")))
                .andReturn();
        String certificateCode = read(certificateResult, "/data/certificateCode");

        getJson("/api/v1/certificates/verify/" + certificateCode, null)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.certificateCode", is(certificateCode)));

        postJson("/api/v1/enrollments", ownerToken, """
                {
                  "studentId": "%s",
                  "courseId": "%s"
                }
                """.formatted(studentId, courseId))
                .andExpect(status().isConflict());

        postJson("/api/v1/certificates", ownerToken, """
                {
                  "studentId": "%s",
                  "courseId": "%s",
                  "title": "Certificate of Completion"
                }
                """.formatted(studentId, courseId))
                .andExpect(status().isConflict());

        String studentToken = login("jane@example.com", "password123");

        getJson("/api/v1/resources/course/" + courseId, studentToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[*].title", hasItem("Spring Docs")))
                .andExpect(jsonPath("$.data[*].type", hasItem("DOCUMENT")));

        getJson("/api/v1/quizzes/course/" + courseId, studentToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title", is("Java Quiz")))
                .andExpect(jsonPath("$.data[0].questions", hasSize(1)));

        postJson("/api/v1/quizzes/" + quizId + "/attempts", studentToken, """
                {
                  "answers": [
                    {
                      "questionId": "%s",
                      "selectedOptionId": "%s"
                    }
                  ]
                }
                """.formatted(questionId, correctOptionId))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.score", is(10)))
                .andExpect(jsonPath("$.data.maxScore", is(10)))
                .andExpect(jsonPath("$.data.passed", is(true)))
                .andExpect(jsonPath("$.data.answers[0].correct", is(true)));

        getJson("/api/v1/certificates/student/" + studentId, studentToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].courseId", is(courseId)));
    }

    @Test
    void ownerStudentScopedListsDoNotLeakOtherOrganizations() throws Exception {
        String ownerOneToken = register("Owner One", "owner1@example.com", "password123", "OWNER");
        String ownerOneOrganizationId = createOrganization(ownerOneToken, "Owner One Academy");
        String sharedStudentId = createStudent(ownerOneToken, ownerOneOrganizationId, "Shared Student", "shared@example.com");
        String ownerOneCourseId = createCourse(ownerOneToken, ownerOneOrganizationId, "Owner One Course");
        enroll(ownerOneToken, sharedStudentId, ownerOneCourseId);
        issueCertificate(ownerOneToken, sharedStudentId, ownerOneCourseId);

        String ownerTwoToken = register("Owner Two", "owner2@example.com", "password123", "OWNER");
        String ownerTwoOrganizationId = createOrganization(ownerTwoToken, "Owner Two Academy");
        addStudentToOrganization(ownerTwoToken, ownerTwoOrganizationId, sharedStudentId);
        String ownerTwoCourseId = createCourse(ownerTwoToken, ownerTwoOrganizationId, "Owner Two Course");
        enroll(ownerTwoToken, sharedStudentId, ownerTwoCourseId);
        issueCertificate(ownerTwoToken, sharedStudentId, ownerTwoCourseId);

        getJson("/api/v1/enrollments/student/" + sharedStudentId, ownerOneToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].courseId", is(ownerOneCourseId)));

        getJson("/api/v1/certificates/student/" + sharedStudentId, ownerOneToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].courseId", is(ownerOneCourseId)));
    }

    @Test
    void ownerCanCreateCourseModulesAndEnrolledStudentCanReadLessons() throws Exception {
        String ownerToken = register("Owner One", "owner1@example.com", "password123", "OWNER");
        String organizationId = createOrganization(ownerToken, "Tech Academy");
        String studentId = createStudent(ownerToken, organizationId, "Jane Student", "jane@example.com");
        String courseId = createCourse(ownerToken, organizationId, "Spring Boot Basics");
        enroll(ownerToken, studentId, courseId);

        MvcResult moduleResult = postJson("/api/v1/courses/" + courseId + "/modules", ownerToken, """
                {
                  "title": "Backend Foundations",
                  "displayOrder": 1
                }
                """)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title", is("Backend Foundations")))
                .andReturn();
        String moduleId = read(moduleResult, "/data/id");

        postJson("/api/v1/modules/" + moduleId + "/lessons", ownerToken, """
                {
                  "title": "Project Setup",
                  "content": "Prepare the Spring Boot project.",
                  "resourceUrl": "https://spring.io/guides",
                  "displayOrder": 1
                }
                """)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.title", is("Project Setup")));

        String studentToken = login("jane@example.com", "password123");
        getJson("/api/v1/courses/" + courseId + "/modules", studentToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].lessons", hasSize(1)))
                .andExpect(jsonPath("$.data[0].lessons[0].resourceUrl", is("https://spring.io/guides")));
    }

    @Test
    void unpublishedQuizzesAndCrossOrganizationCourseModulesAreBlocked() throws Exception {
        String ownerOneToken = register("Owner One", "owner1@example.com", "password123", "OWNER");
        String ownerOneOrganizationId = createOrganization(ownerOneToken, "Owner One Academy");
        String studentId = createStudent(ownerOneToken, ownerOneOrganizationId, "Jane Student", "jane@example.com");
        String ownerOneCourseId = createCourse(ownerOneToken, ownerOneOrganizationId, "Owner One Course");
        enroll(ownerOneToken, studentId, ownerOneCourseId);

        MvcResult quizResult = postJson("/api/v1/quizzes", ownerOneToken, """
                {
                  "title": "Draft Quiz",
                  "courseId": "%s",
                  "passingScore": 70,
                  "published": false,
                  "questions": [
                    {
                      "questionText": "Draft question?",
                      "points": 10,
                      "displayOrder": 1,
                      "options": [
                        {"optionText": "Yes", "correct": true, "displayOrder": 1},
                        {"optionText": "No", "correct": false, "displayOrder": 2}
                      ]
                    }
                  ]
                }
                """.formatted(ownerOneCourseId))
                .andExpect(status().isCreated())
                .andReturn();
        String quizId = read(quizResult, "/data/id");
        String questionId = read(quizResult, "/data/questions/0/id");
        String optionId = read(quizResult, "/data/questions/0/options/0/id");

        String studentToken = login("jane@example.com", "password123");
        getJson("/api/v1/quizzes/course/" + ownerOneCourseId, studentToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
        postJson("/api/v1/quizzes/" + quizId + "/attempts", studentToken, """
                {
                  "answers": [
                    {
                      "questionId": "%s",
                      "selectedOptionId": "%s"
                    }
                  ]
                }
                """.formatted(questionId, optionId))
                .andExpect(status().isForbidden());

        String ownerTwoToken = register("Owner Two", "owner2@example.com", "password123", "OWNER");
        String ownerTwoOrganizationId = createOrganization(ownerTwoToken, "Owner Two Academy");
        String ownerTwoCourseId = createCourse(ownerTwoToken, ownerTwoOrganizationId, "Owner Two Course");

        postJson("/api/v1/courses/" + ownerTwoCourseId + "/modules", ownerOneToken, """
                {
                  "title": "Bad Module",
                  "displayOrder": 1
                }
                """)
                .andExpect(status().isNotFound());

        getJson("/api/v1/courses/" + ownerTwoCourseId + "/modules", studentToken)
                .andExpect(status().isForbidden());
    }

    @Test
    void publicCertificateVerificationReturnsNotFoundForInvalidCode() throws Exception {
        getJson("/api/v1/certificates/verify/COHIVE-2026-NOTREAL", null)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    void resourceCreationRejectsUrlsThatDoNotMatchTypeRules() throws Exception {
        String ownerToken = register("Owner One", "owner1@example.com", "password123", "OWNER");
        String organizationId = createOrganization(ownerToken, "Tech Academy");
        String courseId = createCourse(ownerToken, organizationId, "Spring Boot Basics");

        postJson("/api/v1/resources", ownerToken, """
                {
                  "title": "Invalid Resource",
                  "type": "LINK",
                  "url": "mailto:trainer@example.com",
                  "courseId": "%s"
                }
                """.formatted(courseId))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.errors[0]", containsString("URL must start with http:// or https://")));
    }

    private String register(String name, String email, String password, String role) throws Exception {
        MvcResult result = postJson("/api/v1/auth/register", null, """
                {
                  "name": "%s",
                  "email": "%s",
                  "password": "%s",
                  "role": "%s"
                }
                """.formatted(name, email, password, role))
                .andExpect(status().isCreated())
                .andReturn();
        return read(result, "/data/token");
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = postJson("/api/v1/auth/login", null, """
                {
                  "email": "%s",
                  "password": "%s"
                }
                """.formatted(email, password))
                .andExpect(status().isOk())
                .andReturn();
        return read(result, "/data/token");
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

    private String createStudent(String token, String organizationId, String name, String email) throws Exception {
        MvcResult result = postJson("/api/v1/students", token, """
                {
                  "name": "%s",
                  "email": "%s",
                  "password": "password123",
                  "organizationId": "%s"
                }
                """.formatted(name, email, organizationId))
                .andExpect(status().isCreated())
                .andReturn();
        return read(result, "/data/id");
    }

    private String createCourse(String token, String organizationId, String title) throws Exception {
        MvcResult result = postJson("/api/v1/courses", token, """
                {
                  "title": "%s",
                  "description": "Backend fundamentals",
                  "organizationId": "%s"
                }
                """.formatted(title, organizationId))
                .andExpect(status().isCreated())
                .andReturn();
        return read(result, "/data/id");
    }

    private void addStudentToOrganization(String token, String organizationId, String studentId) throws Exception {
        postJson("/api/v1/organizations/" + organizationId + "/students", token, """
                {
                  "studentId": "%s"
                }
                """.formatted(studentId))
                .andExpect(status().isCreated());
    }

    private void enroll(String token, String studentId, String courseId) throws Exception {
        postJson("/api/v1/enrollments", token, """
                {
                  "studentId": "%s",
                  "courseId": "%s"
                }
                """.formatted(studentId, courseId))
                .andExpect(status().isCreated());
    }

    private void issueCertificate(String token, String studentId, String courseId) throws Exception {
        postJson("/api/v1/certificates", token, """
                {
                  "studentId": "%s",
                  "courseId": "%s",
                  "title": "Certificate of Completion"
                }
                """.formatted(studentId, courseId))
                .andExpect(status().isCreated());
    }

    private org.springframework.test.web.servlet.ResultActions postJson(String path, String token, String json) throws Exception {
        var request = post(path)
                .contentType(MediaType.APPLICATION_JSON)
                .content(json);
        if (token != null) {
            request.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        }
        return mockMvc.perform(request);
    }

    private org.springframework.test.web.servlet.ResultActions getJson(String path, String token) throws Exception {
        var request = get(path)
                .accept(MediaType.APPLICATION_JSON);
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
