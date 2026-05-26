package com.library.Skillmark.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.util.StringUtils;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

public class NeonDataSourceEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {
    private static final String PSQL_URL_KEY = "PSQL_URL";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String psqlUrl = environment.getProperty(PSQL_URL_KEY);
        if (!StringUtils.hasText(psqlUrl)) {
            return;
        }

        if (StringUtils.hasText(environment.getProperty("spring.datasource.url"))
                || StringUtils.hasText(environment.getProperty("DATABASE_URL"))) {
            return;
        }

        ParsedPostgresUrl parsed = parsePostgresUrl(psqlUrl);
        if (parsed == null) {
            return;
        }

        Map<String, Object> overrides = new HashMap<>();
        overrides.put("spring.datasource.url", parsed.jdbcUrl);
        if (StringUtils.hasText(parsed.username)) {
            overrides.put("spring.datasource.username", parsed.username);
        }
        if (StringUtils.hasText(parsed.password)) {
            overrides.put("spring.datasource.password", parsed.password);
        }

        environment.getPropertySources().addFirst(new MapPropertySource("psqlUrlOverrides", overrides));
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE + 20;
    }

    private ParsedPostgresUrl parsePostgresUrl(String url) {
        URI uri;
        try {
            uri = new URI(url);
        } catch (URISyntaxException ex) {
            return null;
        }

        String scheme = uri.getScheme();
        if (!"postgresql".equalsIgnoreCase(scheme) && !"postgres".equalsIgnoreCase(scheme)) {
            return null;
        }

        String host = uri.getHost();
        if (!StringUtils.hasText(host)) {
            return null;
        }

        String database = uri.getPath();
        if (database == null) {
            return null;
        }
        database = database.replaceFirst("^/", "");
        if (!StringUtils.hasText(database)) {
            return null;
        }

        StringBuilder jdbc = new StringBuilder("jdbc:postgresql://");
        jdbc.append(host);
        if (uri.getPort() > 0) {
            jdbc.append(":").append(uri.getPort());
        }
        jdbc.append("/").append(database);
        if (StringUtils.hasText(uri.getQuery())) {
            jdbc.append("?").append(uri.getQuery());
        }

        String username = null;
        String password = null;
        if (StringUtils.hasText(uri.getUserInfo())) {
            String[] parts = uri.getUserInfo().split(":", 2);
            username = parts[0];
            if (parts.length > 1) {
                password = parts[1];
            }
        }

        return new ParsedPostgresUrl(jdbc.toString(), username, password);
    }

    private static final class ParsedPostgresUrl {
        private final String jdbcUrl;
        private final String username;
        private final String password;

        private ParsedPostgresUrl(String jdbcUrl, String username, String password) {
            this.jdbcUrl = jdbcUrl;
            this.username = username;
            this.password = password;
        }
    }
}
