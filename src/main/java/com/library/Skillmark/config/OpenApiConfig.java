package com.library.Skillmark.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

	@Bean
	public OpenAPI SkillmarkOpenApi() {
		Components components = new Components()
				.addSecuritySchemes("bearerAuth", new SecurityScheme()
						.type(SecurityScheme.Type.HTTP)
						.scheme("bearer")
						.bearerFormat("JWT")
						.description("Paste the JWT token returned by register or login."));

		return new OpenAPI()
				.components(components)
				.info(new Info()
						.title("Skillmark Backend API")
						.version("v1")
						.description("REST API for Skillmark organizations, students, courses, enrollments, resources, quizzes, and certificates. Public endpoints are register and login; all other API routes use JWT bearer authentication."));
	}

	@Bean
	public GroupedOpenApi publicApi() {
		return GroupedOpenApi.builder()
				.group("Skillmark-v1")
				.packagesToScan("com.library.Skillmark")
				.pathsToMatch("/api/v1/**")
				.build();
	}
}
