package com.library.Skillmark.auth.dto;

import com.library.Skillmark.user.dto.UserResponse;

public record AuthUserResponse(
        String id,
        String name,
        String email,
        String avatarUrl,
        String status
) {
    public static AuthUserResponse from(UserResponse user) {
        return new AuthUserResponse(
                user.id() != null ? user.id().toString() : null,
                user.name(),
                user.email(),
                user.avatarUrl(),
                user.status() != null ? user.status().name() : null
        );
    }
}
