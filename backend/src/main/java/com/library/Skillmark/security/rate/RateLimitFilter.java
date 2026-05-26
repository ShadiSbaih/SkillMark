package com.library.Skillmark.security.rate;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.security.AuthUser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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

@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private final ObjectMapper objectMapper;
    private final Map<String, Counter> counters = new ConcurrentHashMap<>();

    public RateLimitFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
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
            return new Limit("public-cert:" + ip(request), 30);
        }
        AuthUser user = currentUser();
        if (user == null || !path.startsWith("/api/")) {
            return null;
        }
        if ("POST".equals(method) && path.matches("/api/v1/invitations/[^/]+/join")) {
            return new Limit("invite:" + user.id(), 10);
        }
        if ("POST".equals(method) && path.matches("/api/v1/quizzes/[^/]+/attempts")) {
            return new Limit("attempt:" + user.id(), 5);
        }
        return new Limit("auth:" + user.id(), 200);
    }

    private boolean exceeded(Limit limit) {
        long now = Instant.now().getEpochSecond();
        long window = now / 60;
        Counter counter = counters.compute(limit.key(), (key, current) -> {
            if (current == null || current.window() != window) {
                return new Counter(window, 1);
            }
            return new Counter(window, current.count() + 1);
        });
        return counter.count() > limit.maxRequests();
    }

    private AuthUser currentUser() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthUser authUser)) {
            return null;
        }
        return authUser;
    }

    private String ip(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private record Limit(String key, int maxRequests) {
    }

    private record Counter(long window, int count) {
    }
}
