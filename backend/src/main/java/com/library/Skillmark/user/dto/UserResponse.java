package com.library.Skillmark.user.dto;

import com.library.Skillmark.user.controller.*;
import com.library.Skillmark.user.dto.*;
import com.library.Skillmark.user.entity.*;
import com.library.Skillmark.user.enums.*;
import com.library.Skillmark.user.repository.*;
import com.library.Skillmark.user.service.*;
import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String name,
        String email,
        String avatarUrl,
        UserStatus status,
        Instant createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getStatus(),
                user.getCreatedAt()
        );
    }
}
