package com.library.cohive.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

	@Bean
	public OpenAPI cohiveOpenApi() {
		return new OpenAPI()
				.components(new Components()
						.addSecuritySchemes("bearerAuth", new SecurityScheme()
								.type(SecurityScheme.Type.HTTP)
								.scheme("bearer")
								.bearerFormat("JWT")
								.description("Paste the JWT access token obtained from the login endpoint.")))
				.info(new Info()
						.title("Cohive Backend API")
						.version("v1")
						.description("Professional REST API for Cohive's training, course, enrollment, and certificate workflows.")
						.contact(new Contact()
								.name("Cohive Backend Team")
								.email("backend@cohive.local"))
						.license(new License()
								.name("Internal Use Only")
								.url("https://cohive.local/license")))
				.externalDocs(new ExternalDocumentation()
						.description("Swagger UI")
						.url("/swagger-ui.html"));
	}

	@Bean
	public GroupedOpenApi publicApi() {
		return GroupedOpenApi.builder()
				.group("cohive-v1")
				.packagesToScan("com.library.cohive")
				.pathsToMatch("/api/v1/**")
				.build();
	}
}
