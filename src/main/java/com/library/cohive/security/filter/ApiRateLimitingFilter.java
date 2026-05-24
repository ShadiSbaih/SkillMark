package com.library.cohive.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.cohive.common.response.ApiResponse;
import com.library.cohive.config.ApiRateLimitProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Applies a simple in-memory fixed-window rate limit to API traffic.
 */
@Component
@RequiredArgsConstructor
public class ApiRateLimitingFilter extends OncePerRequestFilter {

    private static final long WINDOW_SECONDS = 60;

    private final ApiRateLimitProperties properties;
    private final ObjectMapper objectMapper;
    private final Map<String, FixedWindowCounter> counters = new ConcurrentHashMap<>();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path == null || !path.startsWith("/api/v1/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        RateLimitRule rule = resolveRule(request);
        String counterKey = rule.keyPrefix() + ":" + resolveClientKey(request);
        FixedWindowDecision decision = counters
                .computeIfAbsent(counterKey, ignored -> new FixedWindowCounter())
                .tryConsume(rule.limit(), Instant.now().getEpochSecond());

        response.setHeader("X-Rate-Limit-Limit", String.valueOf(rule.limit()));
        response.setHeader("X-Rate-Limit-Remaining", String.valueOf(Math.max(decision.remaining(), 0)));

        if (!decision.allowed()) {
            long retryAfter = Math.max(decision.windowEndsAtEpochSecond() - Instant.now().getEpochSecond(), 1);
            response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(retryAfter));
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(
                    response.getWriter(),
                    ApiResponse.failure(
                            "Rate limit exceeded",
                            List.of("Retry after %d seconds".formatted(retryAfter))
                    )
            );
            return;
        }

        filterChain.doFilter(request, response);
    }

    private RateLimitRule resolveRule(HttpServletRequest request) {
        String path = request.getRequestURI();
        if (path.startsWith("/api/v1/auth/")) {
            return new RateLimitRule("public", properties.publicRequestsPerMinute());
        }
        if (HttpMethod.GET.matches(request.getMethod())) {
            return new RateLimitRule("read", properties.readRequestsPerMinute());
        }
        return new RateLimitRule("write", properties.writeRequestsPerMinute());
    }

    private String resolveClientKey(HttpServletRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication instanceof AnonymousAuthenticationToken)) {
            return authentication.getName();
        }
        String remoteAddress = request.getRemoteAddr();
        return remoteAddress == null || remoteAddress.isBlank() ? "anonymous" : remoteAddress;
    }

    private record RateLimitRule(String keyPrefix, int limit) {
    }

    private static final class FixedWindowCounter {
        private long windowStartEpochSecond = -1;
        private int requests;

        private synchronized FixedWindowDecision tryConsume(int limit, long nowEpochSecond) {
            long currentWindow = nowEpochSecond - (nowEpochSecond % WINDOW_SECONDS);
            if (windowStartEpochSecond != currentWindow) {
                windowStartEpochSecond = currentWindow;
                requests = 0;
            }

            if (requests >= limit) {
                return new FixedWindowDecision(false, 0, windowStartEpochSecond + WINDOW_SECONDS);
            }

            requests++;
            return new FixedWindowDecision(true, limit - requests, windowStartEpochSecond + WINDOW_SECONDS);
        }
    }

    private record FixedWindowDecision(boolean allowed, int remaining, long windowEndsAtEpochSecond) {
    }
}
