package com.library.cohive.common.util;

import com.library.cohive.common.exception.UnauthorizedException;
import com.library.cohive.security.service.UserPrincipal;
import com.library.cohive.user.entity.Role;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public final class SecurityUtil {

    private SecurityUtil() {
    }

    public static UUID getCurrentUserId() {
        UserPrincipal principal = getPrincipal();
        return principal.getId();
    }

    public static Role getCurrentUserRole() {
        UserPrincipal principal = getPrincipal();
        return principal.getRole();
    }

    public static String getCurrentUserEmail() {
        UserPrincipal principal = getPrincipal();
        return principal.getUsername();
    }

    private static UserPrincipal getPrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new UnauthorizedException("Authentication required");
        }
        return principal;
    }
}