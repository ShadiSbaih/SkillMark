package com.library.Skillmark.security.clerk;

import com.library.Skillmark.security.AuthUser;
import com.library.Skillmark.user.entity.User;
import com.library.Skillmark.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class ClerkUserSyncService {
    private final UserRepository userRepository;
    private final String issuer;
    private final String jwksUrl;
    private final Environment environment;
    private JwtDecoder jwtDecoder;

    public ClerkUserSyncService(UserRepository userRepository,
                                @Value("${clerk.issuer:}") String issuer,
                                @Value("${clerk.jwks-url:}") String jwksUrl,
                                Environment environment) {
        this.userRepository = userRepository;
        this.issuer = issuer;
        this.jwksUrl = jwksUrl;
        this.environment = environment;
    }

    @Transactional
    public AuthUser resolve(String token) {
        ClerkClaims claims = token.startsWith("dev:") && devTokensAllowed() ? parseDevToken(token) : parseJwt(token);
        User user = userRepository.findByClerkUserId(claims.clerkUserId())
                .orElseGet(() -> {
                    User created = new User();
                    created.setClerkUserId(claims.clerkUserId());
                    created.setEmail(claims.email());
                    created.setName(claims.name());
                    return userRepository.save(created);
                });
        if (StringUtils.hasText(claims.email())) {
            user.setEmail(claims.email());
        }
        if (StringUtils.hasText(claims.name())) {
            user.setName(claims.name());
        }
        user.setAvatarUrl(claims.avatarUrl());
        return new AuthUser(user.getId(), user.getClerkUserId(), user.getEmail());
    }

    private ClerkClaims parseJwt(String token) {
        if (!StringUtils.hasText(jwksUrl) && !StringUtils.hasText(issuer)) {
            throw new JwtException("Clerk JWT verification is not configured");
        }
        Jwt jwt = decoder().decode(token);
        String clerkUserId = jwt.getSubject();
        String email = claim(jwt, "email");
        String name = claim(jwt, "name");
        if (!StringUtils.hasText(name)) {
            String first = claim(jwt, "first_name");
            String last = claim(jwt, "last_name");
            name = ((first == null ? "" : first) + " " + (last == null ? "" : last)).trim();
        }
        if (!StringUtils.hasText(name)) {
            name = email;
        }
        if (!StringUtils.hasText(clerkUserId)) {
            throw new JwtException("Clerk token must contain subject");
        }
        if (!StringUtils.hasText(email)) {
            email = clerkUserId + "@clerk.local";
        }
        if (!StringUtils.hasText(name)) {
            name = email;
        }
        return new ClerkClaims(clerkUserId, email, name, claim(jwt, "image_url"));
    }

    private JwtDecoder decoder() {
        if (jwtDecoder == null) {
            if (StringUtils.hasText(jwksUrl)) {
                NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwksUrl).build();
                if (StringUtils.hasText(issuer)) {
                    decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(issuer));
                }
                jwtDecoder = decoder;
            } else {
                jwtDecoder = JwtDecoders.fromIssuerLocation(issuer);
            }
        }
        return jwtDecoder;
    }

    private String claim(Jwt jwt, String name) {
        Object value = jwt.getClaims().get(name);
        return value == null ? null : value.toString();
    }

    private ClerkClaims parseDevToken(String token) {
        String[] parts = token.split(":", 4);
        String clerkUserId = parts.length > 1 && !parts[1].isBlank() ? parts[1] : "clerk_dev_user";
        String email = parts.length > 2 && !parts[2].isBlank() ? parts[2] : clerkUserId + "@example.com";
        String name = parts.length > 3 && !parts[3].isBlank() ? parts[3].replace('_', ' ') : "Skillmark User";
        return new ClerkClaims(clerkUserId, email, name, null);
    }

    private boolean devTokensAllowed() {
        for (String profile : environment.getActiveProfiles()) {
            if ("local".equals(profile) || "test".equals(profile)) {
                return true;
            }
        }
        return false;
    }

    private record ClerkClaims(String clerkUserId, String email, String name, String avatarUrl) {
    }
}
