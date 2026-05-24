package com.library.cohive.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Externalized rate-limit settings for public, read, and write API traffic.
 */
@ConfigurationProperties(prefix = "cohive.api.rate-limit")
public record ApiRateLimitProperties(
        int publicRequestsPerMinute,
        int readRequestsPerMinute,
        int writeRequestsPerMinute
) {
    public ApiRateLimitProperties {
        publicRequestsPerMinute = positiveOrDefault(publicRequestsPerMinute, 30);
        readRequestsPerMinute = positiveOrDefault(readRequestsPerMinute, 120);
        writeRequestsPerMinute = positiveOrDefault(writeRequestsPerMinute, 60);
    }

    private static int positiveOrDefault(int value, int fallback) {
        return value > 0 ? value : fallback;
    }
}
