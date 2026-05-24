package com.library.cohive.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Externalized cache policy for authenticated GET endpoints.
 */
@ConfigurationProperties(prefix = "cohive.api.cache")
public record ApiCacheProperties(int privateGetMaxAgeSeconds) {
    public ApiCacheProperties {
        privateGetMaxAgeSeconds = privateGetMaxAgeSeconds > 0 ? privateGetMaxAgeSeconds : 60;
    }
}
