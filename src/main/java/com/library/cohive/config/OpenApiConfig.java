package com.library.cohive.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

	@Bean
	public OpenAPI cohiveOpenApi() {
		return new OpenAPI()
				.info(new Info()
						.title("Cohive API")
						.version("v1")
						.description("Cohive Training & Course Management Platform API"));
	}
}
