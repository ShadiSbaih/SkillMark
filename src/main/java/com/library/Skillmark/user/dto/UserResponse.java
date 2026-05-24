package com.library.Skillmark.user.dto;

import java.time.Instant;
import java.util.UUID;

import com.library.Skillmark.user.entity.Role;
import com.library.Skillmark.user.entity.User;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Authenticated user profile returned by the API.")
public class UserResponse {
    @Schema(format = "uuid")
    private UUID id;

    @Schema(example = "John Doe")
    private String name;

    @Schema(example = "john@example.com")
    private String email;

    @Schema(description = "Role used for authorization.")
    private Role role;

    @Schema(format = "date-time")
    private Instant createdAt;

    public static UserResponse fromEntity(User user) {
        if (user == null) {
            return null;
        }
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
