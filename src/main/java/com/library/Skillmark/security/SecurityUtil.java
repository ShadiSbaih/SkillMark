package com.library.Skillmark.security;

import org.springframework.security.core.Authentication;

import java.util.UUID;

public final class SecurityUtil {
    private SecurityUtil() {
    }

    public static UUID userId(Authentication authentication) {
        return authUser(authentication).id();
    }

    public static AuthUser authUser(Authentication authentication) {
        return (AuthUser) authentication.getPrincipal();
    }
}
