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
						addResponseHeaders(responses);
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

	private void addResponseHeaders(ApiResponses responses) {
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
						.schema(new StringSchema().example("private, max-age=60, must-revalidate")));
			}
		});
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
