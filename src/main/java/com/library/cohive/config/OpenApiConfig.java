package com.library.cohive.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.headers.Header;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.IntegerSchema;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springdoc.core.models.GroupedOpenApi;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.LinkedHashMap;
import java.util.Map;

@Configuration
public class OpenApiConfig {

	private static final String JSON = "application/json";
	private static final String RATE_LIMIT_NOTE = "Rate limits: public auth endpoints 30 requests/minute, authenticated GET endpoints 120 requests/minute, authenticated write endpoints 60 requests/minute.";
	private static final String CACHE_NOTE = "Caching: GET endpoints return `Cache-Control: private, max-age=60, must-revalidate` with `Vary: Authorization`; mutating endpoints return `Cache-Control: no-store`.";

	@Bean
	public OpenAPI cohiveOpenApi() {
		Components components = new Components()
				.addSecuritySchemes("bearerAuth", new SecurityScheme()
						.type(SecurityScheme.Type.HTTP)
						.scheme("bearer")
						.bearerFormat("JWT")
						.description("Paste the JWT access token obtained from the login endpoint."))
				.addResponses("BadRequest", standardErrorResponse("Validation failed", 400))
				.addResponses("Unauthorized", standardErrorResponse("Authentication is required or the JWT token is invalid.", 401))
				.addResponses("Forbidden", standardErrorResponse("The authenticated user is not authorized to access this resource.", 403))
				.addResponses("NotFound", standardErrorResponse("The requested resource does not exist in the caller's authorized scope.", 404))
				.addResponses("Conflict", standardErrorResponse("The request violates a uniqueness or business rule constraint.", 409))
				.addResponses("TooManyRequests", standardErrorResponse("The caller exceeded the configured API rate limit.", 429))
				.addResponses("InternalServerError", standardErrorResponse("An unexpected server-side error occurred.", 500));

		return new OpenAPI()
				.components(components)
				.info(new Info()
						.title("Cohive Backend API")
						.version("v1")
						.description("""
								Versioned REST API for Cohive's training, course, enrollment, resource, quiz, and certificate workflows.

								Versioning strategy: path-based versioning under `/api/v1`.
								Authentication: JWT bearer token for every endpoint except register and login.
								%s
								%s
								""".formatted(RATE_LIMIT_NOTE, CACHE_NOTE))
						.contact(new Contact()
								.name("Cohive Backend Team")
								.email("backend@cohive.local"))
						.license(new License()
								.name("Internal Use Only")
								.url("https://cohive.local/license")))
				.servers(java.util.List.of(new Server()
						.url("/")
						.description("Relative application root. All documented routes use the `/api/v1` prefix.")))
				.externalDocs(new ExternalDocumentation()
						.description("Swagger UI")
						.url("/swagger-ui.html"));
	}

	@Bean
	public OpenApiCustomizer apiContractCustomizer() {
		return openApi -> {
			if (openApi.getPaths() == null) {
				return;
			}

			openApi.getPaths().forEach((path, pathItem) ->
					pathItem.readOperationsMap().forEach((method, operation) -> {
						ApiResponses responses = operation.getResponses();
						if (responses == null) {
							responses = new ApiResponses();
							operation.setResponses(responses);
						}

						appendSpecificationNotes(operation, method, path);
						addStandardResponses(path, method, responses);
						addSuccessResponseDescriptions(path, method, responses);
						addResponseHeaders(method, responses);
					}));
		};
	}

	@Bean
	public GroupedOpenApi publicApi(OpenApiCustomizer apiContractCustomizer) {
		return GroupedOpenApi.builder()
				.group("cohive-v1")
				.packagesToScan("com.library.cohive")
				.pathsToMatch("/api/v1/**")
				.addOpenApiCustomizer(apiContractCustomizer)
				.build();
	}

	private ApiResponse standardErrorResponse(String message, int status) {
		return new ApiResponse()
				.description(message)
				.content(new Content().addMediaType(JSON, new MediaType()
						.example(errorExample(message, status))));
	}

	private Map<String, Object> errorExample(String message, int status) {
		Map<String, Object> example = new LinkedHashMap<>();
		example.put("success", false);
		example.put("message", message);
		example.put("errors", java.util.List.of("HTTP " + status));
		return example;
	}

	private void appendSpecificationNotes(io.swagger.v3.oas.models.Operation operation, PathItem.HttpMethod method, String path) {
		StringBuilder description = new StringBuilder(operation.getDescription() == null ? "" : operation.getDescription().trim());
		if (!description.isEmpty()) {
			description.append("\n\n");
		}
		description.append("API version: `/api/v1`.");
		description.append("\nAuthentication: ");
		description.append(isPublicOperation(path, method)
				? "public endpoint."
				: "JWT bearer token required; authorization is enforced by role and tenant scope.");
		description.append("\n").append(RATE_LIMIT_NOTE);
		description.append("\n").append(CACHE_NOTE);
		operation.setDescription(description.toString());
	}

	private void addStandardResponses(String path, PathItem.HttpMethod method, ApiResponses responses) {
		if (hasRequestValidationConcern(method, path)) {
			responses.addApiResponse("400", new ApiResponse().$ref("#/components/responses/BadRequest"));
		}
		if (!isPublicOperation(path, method)) {
			responses.addApiResponse("401", new ApiResponse().$ref("#/components/responses/Unauthorized"));
			responses.addApiResponse("403", new ApiResponse().$ref("#/components/responses/Forbidden"));
		}
		if (path.contains("{")) {
			responses.addApiResponse("404", new ApiResponse().$ref("#/components/responses/NotFound"));
		}
		if (method == PathItem.HttpMethod.POST || method == PathItem.HttpMethod.PUT || method == PathItem.HttpMethod.DELETE) {
			responses.addApiResponse("409", new ApiResponse().$ref("#/components/responses/Conflict"));
		}
		responses.addApiResponse("429", new ApiResponse().$ref("#/components/responses/TooManyRequests"));
		responses.addApiResponse("500", new ApiResponse().$ref("#/components/responses/InternalServerError"));
	}

	private void addSuccessResponseDescriptions(String path, PathItem.HttpMethod method, ApiResponses responses) {
		String successDescription = successDescriptionFor(path, method);
		responses.forEach((status, response) -> {
			if (response == null || !status.startsWith("2")) {
				return;
			}
			if (response.getDescription() == null || response.getDescription().isBlank()) {
				response.setDescription(successDescription);
			}
		});
	}

	private void addResponseHeaders(PathItem.HttpMethod method, ApiResponses responses) {
		responses.forEach((status, response) -> {
			if (response == null) {
				return;
			}
			if (response.getHeaders() == null) {
				response.setHeaders(new LinkedHashMap<>());
			}
			response.addHeaderObject("X-Rate-Limit-Limit", new Header()
					.description("Maximum number of requests allowed in the current fixed window.")
					.schema(new IntegerSchema().example(120)));
			response.addHeaderObject("X-Rate-Limit-Remaining", new Header()
					.description("Remaining requests available in the current fixed window.")
					.schema(new IntegerSchema().example(119)));
			if ("429".equals(status)) {
				response.addHeaderObject("Retry-After", new Header()
						.description("Seconds until the current throttle window resets.")
						.schema(new IntegerSchema().example(60)));
			}
			if (status.startsWith("2")) {
				response.addHeaderObject("Cache-Control", new Header()
						.description("Cache policy applied to the response.")
						.schema(new StringSchema().example(cacheControlExample(method))));
			}
			if (status.startsWith("2") && method == PathItem.HttpMethod.GET) {
				response.addHeaderObject("Vary", new Header()
						.description("Cache key variance applied to authenticated GET responses.")
						.schema(new StringSchema().example("Authorization")));
			}
		});
	}

	private String cacheControlExample(PathItem.HttpMethod method) {
		return method == PathItem.HttpMethod.GET
				? "private, max-age=60, must-revalidate"
				: "no-store";
	}

	private String successDescriptionFor(String path, PathItem.HttpMethod method) {
		return switch (path) {
			case "/api/v1/auth/register" -> "User account created and JWT token issued.";
			case "/api/v1/auth/login" -> "User authenticated and JWT token issued.";
			case "/api/v1/auth/logout" -> "Logout acknowledged successfully.";
			case "/api/v1/users/me" -> "Current authenticated user profile returned.";
			case "/api/v1/organizations" -> method == PathItem.HttpMethod.GET
					? "Paginated organization collection returned. Supports `page`, `size`, and `sort`."
					: "Organization created successfully.";
			case "/api/v1/courses" -> method == PathItem.HttpMethod.GET
					? "Paginated course collection returned. Supports `page`, `size`, `sort`, and optional `organizationId` filtering."
					: "Course created successfully.";
			case "/api/v1/students" -> method == PathItem.HttpMethod.GET
					? "Paginated student collection returned. Supports `page`, `size`, and `sort`."
					: "Student created successfully.";
			case "/api/v1/resources" -> "Resource created successfully.";
			case "/api/v1/quizzes" -> "Quiz created successfully.";
			case "/api/v1/enrollments" -> "Enrollment created successfully.";
			case "/api/v1/certificates" -> "Certificate issued successfully.";
			case "/api/v1/organizations/{id}/students" -> method == PathItem.HttpMethod.GET
					? "Paginated organization student collection returned. Supports `page`, `size`, and `sort`."
					: "Student added to organization successfully.";
			default -> defaultSuccessDescription(path, method);
		};
	}

	private String defaultSuccessDescription(String path, PathItem.HttpMethod method) {
		if (method == PathItem.HttpMethod.GET) {
			return path.contains("{")
					? "Requested resource returned successfully."
					: "Requested collection returned successfully.";
		}
		if (method == PathItem.HttpMethod.PUT) {
			return "Resource updated successfully.";
		}
		if (method == PathItem.HttpMethod.DELETE) {
			return "Resource deleted successfully.";
		}
		return "Operation completed successfully.";
	}

	private boolean isPublicOperation(String path, PathItem.HttpMethod method) {
		return method == PathItem.HttpMethod.POST
				&& ("/api/v1/auth/register".equals(path) || "/api/v1/auth/login".equals(path));
	}

	private boolean hasRequestValidationConcern(PathItem.HttpMethod method, String path) {
		return method == PathItem.HttpMethod.POST
				|| method == PathItem.HttpMethod.PUT
				|| method == PathItem.HttpMethod.DELETE
				|| path.contains("{");
	}
}
