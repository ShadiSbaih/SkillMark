package com.library.Skillmark.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
@Schema(description = "Request body for logging in.")
public class LoginRequest {
    @Email
    @NotBlank
    @Schema(description = "Registered email address.", example = "john@example.com")
    private String email;

    @NotBlank
    @Schema(description = "User password.", example = "password123")
    private String password;
}
