package com.library.Skillmark.security.clerk;

import com.library.Skillmark.security.AuthUser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class ClerkAuthenticationFilter extends OncePerRequestFilter {
    private final ClerkUserSyncService clerkUserSyncService;

    public ClerkAuthenticationFilter(ClerkUserSyncService clerkUserSyncService) {
        this.clerkUserSyncService = clerkUserSyncService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }
        try {
            AuthUser authUser = clerkUserSyncService.resolve(header.substring(7));
            var authentication = new UsernamePasswordAuthenticationToken(authUser, null, authUser.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (RuntimeException ignored) {
            SecurityContextHolder.clearContext();
        }
        chain.doFilter(request, response);
    }
}
