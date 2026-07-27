package com.library.Skillmark.security.jwt;

import com.library.Skillmark.security.AuthUser;
import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.env.Environment;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

@Component
public class DevTokenAuthenticationFilter extends OncePerRequestFilter {

    private final Environment environment;
    private final UserRepository userRepository;

    public DevTokenAuthenticationFilter(Environment environment, UserRepository userRepository) {
        this.environment = environment;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        if (!isTestProfile()) {
            chain.doFilter(request, response);
            return;
        }

        String token = extractDevToken(request);
        if (token == null) {
            chain.doFilter(request, response);
            return;
        }

        try {
            String[] parts = token.split(":");
            if ((parts.length != 4 && parts.length != 5) || !"dev".equals(parts[0])) {
                chain.doFilter(request, response);
                return;
            }
            UUID userId = UUID.fromString(parts[1]);
            String email = parts[2];
            String name = parts[3];
            com.library.Skillmark.user.enums.UserRole role = parts.length == 5
                    ? com.library.Skillmark.user.enums.UserRole.valueOf(parts[4])
                    : (email.toLowerCase().contains("owner") || email.toLowerCase().contains("admin")
                        ? com.library.Skillmark.user.enums.UserRole.ADMIN
                        : com.library.Skillmark.user.enums.UserRole.STUDENT);
            User user = userRepository.findById(userId).orElseGet(() -> createDevUser(userId, email, name, role));
            if (user.getRole() != role && (parts.length == 5 || email.toLowerCase().contains("owner") || email.toLowerCase().contains("admin"))) {
                user.setRole(role);
                user = userRepository.save(user);
            }
            AuthUser authUser = new AuthUser(userId, user.getEmail(), user.getRole());
            var authentication = new UsernamePasswordAuthenticationToken(authUser, null, authUser.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception ignored) {
        }

        chain.doFilter(request, response);
    }

    private User createDevUser(UUID userId, String email, String name, com.library.Skillmark.user.enums.UserRole role) {
        User user = new User();
        user.setId(userId);
        user.setEmail(email);
        user.setName(name);
        user.setRole(role);
        user.setEmailVerifiedAt(Instant.now());
        return userRepository.save(user);
    }

    private boolean isTestProfile() {
        for (String profile : environment.getActiveProfiles()) {
            if ("test".equals(profile)) {
                return true;
            }
        }
        return false;
    }

    private String extractDevToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
