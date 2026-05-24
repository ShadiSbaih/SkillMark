package com.library.cohive.security.filter;

import com.library.cohive.config.ApiCacheProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * Applies conservative cache headers to API responses.
 */
@Component
@RequiredArgsConstructor
public class ApiCacheControlFilter extends OncePerRequestFilter {

    private final ApiCacheProperties properties;

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
        filterChain.doFilter(request, response);

        if (response.containsHeader(HttpHeaders.CACHE_CONTROL)) {
            return;
        }

        if (HttpMethod.GET.matches(request.getMethod())) {
            response.setHeader(
                    HttpHeaders.CACHE_CONTROL,
                    CacheControl.maxAge(properties.privateGetMaxAgeSeconds(), TimeUnit.SECONDS)
                            .cachePrivate()
                            .mustRevalidate()
                            .getHeaderValue()
            );
            response.addHeader(HttpHeaders.VARY, HttpHeaders.AUTHORIZATION);
            return;
        }

        response.setHeader(HttpHeaders.CACHE_CONTROL, CacheControl.noStore().getHeaderValue());
    }
}
