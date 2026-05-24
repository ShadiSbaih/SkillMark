package com.library.cohive.config;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

@Configuration
public class DataSourceConfig {

	@Bean
	@Primary
	public DataSource dataSource(Environment environment) {
		String rawUrl = environment.getProperty("spring.datasource.url");
		String username = environment.getProperty("spring.datasource.username");
		String password = environment.getProperty("spring.datasource.password");
		String driver = environment.getProperty("spring.datasource.driver-class-name");

		if (rawUrl != null && (rawUrl.startsWith("postgres://") || rawUrl.startsWith("postgresql://"))) {
			ParsedPostgresUrl parsed = parsePostgresUrl(rawUrl);
			rawUrl = parsed.jdbcUrl;
			if (parsed.username != null) {
				username = parsed.username;
			}
			if (parsed.password != null) {
				password = parsed.password;
			}
		}

		DriverManagerDataSource dataSource = new DriverManagerDataSource();
		if (driver != null && !driver.isBlank()) {
			dataSource.setDriverClassName(driver);
		}
		dataSource.setUrl(rawUrl);
		if (username != null) {
			dataSource.setUsername(username);
		}
		if (password != null) {
			dataSource.setPassword(password);
		}
		return dataSource;
	}

	private ParsedPostgresUrl parsePostgresUrl(String rawUrl) {
		try {
			URI uri = URI.create(rawUrl);
			String userInfo = uri.getUserInfo();
			String username = null;
			String password = null;
			if (userInfo != null && !userInfo.isBlank()) {
				String[] credentials = userInfo.split(":", 2);
				username = URLDecoder.decode(credentials[0], StandardCharsets.UTF_8);
				password = credentials.length > 1
						? URLDecoder.decode(credentials[1], StandardCharsets.UTF_8)
						: "";
			}

			String host = uri.getHost();
			int port = uri.getPort();
			String path = uri.getPath() == null ? "" : uri.getPath();
			String query = uri.getQuery();

			StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://");
			jdbcUrl.append(host);
			if (port > 0) {
				jdbcUrl.append(':').append(port);
			}
			jdbcUrl.append(path);
			if (query != null && !query.isBlank()) {
				jdbcUrl.append('?').append(query);
			}

			return new ParsedPostgresUrl(jdbcUrl.toString(), username, password);
		} catch (IllegalArgumentException ex) {
			return new ParsedPostgresUrl(rawUrl, null, null);
		}
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
