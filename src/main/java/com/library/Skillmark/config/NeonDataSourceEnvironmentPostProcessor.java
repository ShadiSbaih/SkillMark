package com.library.Skillmark.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

public class NeonDataSourceEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {
    private static final String DATASOURCE_URL = "spring.datasource.url";
    private static final String DATASOURCE_USERNAME = "spring.datasource.username";
    private static final String DATASOURCE_PASSWORD = "spring.datasource.password";
    private static final String PROPERTY_SOURCE_NAME = "neonDatasourceNormalization";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String rawUrl = environment.getProperty(DATASOURCE_URL);
        if (rawUrl == null || !(rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://"))) {
            return;
        }

        ParsedPostgresUrl parsed = ParsedPostgresUrl.from(rawUrl);
        Map<String, Object> normalized = new LinkedHashMap<>();
        normalized.put(DATASOURCE_URL, parsed.jdbcUrl());
        if (!environment.containsProperty(DATASOURCE_USERNAME) && parsed.username() != null) {
            normalized.put(DATASOURCE_USERNAME, parsed.username());
        }
        if (!environment.containsProperty(DATASOURCE_PASSWORD) && parsed.password() != null) {
            normalized.put(DATASOURCE_PASSWORD, parsed.password());
        }

        environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE_NAME, normalized));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    private record ParsedPostgresUrl(String jdbcUrl, String username, String password) {
        private static ParsedPostgresUrl from(String rawUrl) {
            try {
                URI uri = URI.create(rawUrl);
                String[] credentials = decodeCredentials(uri.getUserInfo());

                StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                        .append(uri.getHost());
                if (uri.getPort() > 0) {
                    jdbcUrl.append(':').append(uri.getPort());
                }
                if (uri.getPath() != null) {
                    jdbcUrl.append(uri.getPath());
                }
                if (uri.getQuery() != null && !uri.getQuery().isBlank()) {
                    jdbcUrl.append('?').append(uri.getQuery());
                }

                return new ParsedPostgresUrl(jdbcUrl.toString(), credentials[0], credentials[1]);
            } catch (IllegalArgumentException ex) {
                return new ParsedPostgresUrl(rawUrl, null, null);
            }
        }

        private static String[] decodeCredentials(String userInfo) {
            if (userInfo == null || userInfo.isBlank()) {
                return new String[] {null, null};
            }

            String[] parts = userInfo.split(":", 2);
            String username = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
            String password = parts.length > 1
                    ? URLDecoder.decode(parts[1], StandardCharsets.UTF_8)
                    : "";
            return new String[] {username, password};
        }
    }
}
