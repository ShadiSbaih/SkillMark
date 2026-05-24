package com.library.Skillmark.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {
    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    OpenAPI skillmarkOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Skillmark Backend API")
                        .description("""
                                API-first training, assessment, and certification backend with Clerk authentication,
                                organization-scoped permissions, program enrollments, resources, quizzes,
                                automatic scoring, certificates, revocation, and public verification.
                                """)
                        .version("v1")
                        .contact(new Contact().name("Skillmark API Team"))
                        .license(new License().name("Proprietary")))
                .servers(List.of(new Server().url("/").description("Current server")))
                .tags(List.of(
                        new Tag().name("Users").description("Current authenticated Clerk user profile and backend sync."),
                        new Tag().name("Organizations").description("Organization creation, lookup, update, and soft deletion."),
                        new Tag().name("Memberships").description("Organization-scoped OWNER/PARTICIPANT membership management."),
                        new Tag().name("Programs").description("Program/workshop creation, publishing, archiving, and lookup."),
                        new Tag().name("Enrollments").description("Program enrollment management and current-user enrollment lists."),
                        new Tag().name("Invitations").description("Invitation links for joining published programs."),
                        new Tag().name("Resources").description("Program resources backed by external links, R2 files, or Cloudinary media."),
                        new Tag().name("Quizzes").description("Quiz creation, question management, publishing, and quiz lists."),
                        new Tag().name("Attempts").description("Participant quiz attempts, answer submission, scoring, and owner review."),
                        new Tag().name("Certificates").description("Manual issuing, certificate lookup, organization certificate lists, and revocation."),
                        new Tag().name("Statistics").description("Organization and program statistics."),
                        new Tag().name("Public Verification").description("Public certificate verification without authentication.")
                ))
                .components(new Components().addSecuritySchemes(BEARER_AUTH,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("Clerk")
                                .description("Clerk session token supplied as Authorization: Bearer <token>")))
                .externalDocs(new ExternalDocumentation()
                        .description("Skillmark backend documentation")
                        .url("/swagger-ui.html"));
    }

    @Bean
    GroupedOpenApi skillmarkApiGroup() {
        return GroupedOpenApi.builder()
                .group("skillmark-v1")
                .pathsToMatch("/api/v1/**")
                .packagesToScan("com.library.Skillmark")
                .build();
    }
}
