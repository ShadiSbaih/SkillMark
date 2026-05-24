package com.library.Skillmark;

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
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class SkillmarkApiIntegrationTests {
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
    void swaggerEndpointsArePublicAndDescribeClerkScopedApi() throws Exception {
        mockMvc.perform(get("/swagger-ui.html"))
                .andExpect(status().is3xxRedirection());

        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title", is("Skillmark Backend API")))
                .andExpect(jsonPath("$.info.description", containsString("Clerk")))
                .andExpect(jsonPath("$.paths['/api/v1/users/sync'].post").exists())
                .andExpect(jsonPath("$.paths['/api/v1/organizations/{organizationId}/programs'].post").exists())
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
