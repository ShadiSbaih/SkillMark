package com.library.Skillmark.security.rate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.security.AuthUser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private final ObjectMapper objectMapper;
    private final Map<String, Counter> counters = new ConcurrentHashMap<>();

    private final int authMaxRequests;
    private final int inviteMaxRequests;
    private final int attemptMaxRequests;
    private final int publicCertMaxRequests;
    private final int windowSeconds;
    private final boolean trustForwardedFor;

    public RateLimitFilter(ObjectMapper objectMapper,
                           @Value("${app.rate-limit.auth.max-requests:200}") int authMaxRequests,
                           @Value("${app.rate-limit.invite.max-requests:10}") int inviteMaxRequests,
                           @Value("${app.rate-limit.attempt.max-requests:5}") int attemptMaxRequests,
                           @Value("${app.rate-limit.public-cert.max-requests:30}") int publicCertMaxRequests,
                           @Value("${app.rate-limit.window-seconds:60}") int windowSeconds,
                           @Value("${app.rate-limit.trust-x-forwarded-for:false}") boolean trustForwardedFor) {
        this.objectMapper = objectMapper;
        this.authMaxRequests = Math.max(authMaxRequests, 1);
        this.inviteMaxRequests = Math.max(inviteMaxRequests, 1);
        this.attemptMaxRequests = Math.max(attemptMaxRequests, 1);
        this.publicCertMaxRequests = Math.max(publicCertMaxRequests, 1);
        this.windowSeconds = Math.max(windowSeconds, 1);
        this.trustForwardedFor = trustForwardedFor;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        Limit limit = limitFor(request);
        if (limit != null && exceeded(limit)) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            objectMapper.writeValue(response.getWriter(), ApiResponse.failure(
                    "Rate limit exceeded", List.of(), request.getRequestURI()));
            return;
        }
        chain.doFilter(request, response);
    }

    private Limit limitFor(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();
        if ("GET".equals(method) && path.startsWith("/api/v1/public/certificates/verify/")) {
            return new Limit("public-cert:" + ip(request), publicCertMaxRequests);
        }
        AuthUser user = currentUser();
        if (user == null || !path.startsWith("/api/")) {
            return null;
        }
        if ("POST".equals(method) && path.matches("/api/v1/invitations/[^/]+/join")) {
            return new Limit("invite:" + user.id(), inviteMaxRequests);
        }
        if ("POST".equals(method) && path.matches("/api/v1/quizzes/[^/]+/attempts")) {
            return new Limit("attempt:" + user.id(), attemptMaxRequests);
        }
        return new Limit("auth:" + user.id(), authMaxRequests);
    }

    private boolean exceeded(Limit limit) {
        long now = Instant.now().getEpochSecond();
        long window = now / windowSeconds;
        Counter counter = counters.compute(limit.key(), (key, current) -> {
            if (current == null || current.window() != window) {
                return new Counter(window, 1);
            }
            return new Counter(window, current.count() + 1);
        });
        evictStaleEntries(window);
        return counter.count() > limit.maxRequests();
    }

    private void evictStaleEntries(long currentWindow) {
        // Probabilistic cleanup: avoid scanning the map on every request.
        if (ThreadLocalRandom.current().nextInt(1000) != 0) {
            return;
        }
        counters.entrySet().removeIf(entry -> entry.getValue().window() < currentWindow - 1);
    }

    private AuthUser currentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUser authUser)) {
            return null;
        }
        return authUser;
    }

    private String ip(HttpServletRequest request) {
        if (trustForwardedFor) {
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
        }
        return request.getRemoteAddr();
    }

    private record Limit(String key, int maxRequests) {
    }

    private record Counter(long window, int count) {
    }
}
