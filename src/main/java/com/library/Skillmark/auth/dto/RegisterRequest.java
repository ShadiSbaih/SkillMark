package com.library.Skillmark.auth.dto;

import com.library.Skillmark.user.entity.Role;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
@Schema(description = "Request body for creating a new user account.")
public class RegisterRequest {
    @NotBlank
    @Schema(description = "Full name of the user.", example = "John Doe")
    private String name;

    @Email
    @NotBlank
    @Schema(description = "Unique email address used for login.", example = "john@example.com")
    private String email;

    @NotBlank
    @Size(min = 6)
    @Schema(description = "Password with at least 6 characters.", example = "password123")
    private String password;

    @Schema(description = "Optional role. Defaults to STUDENT when omitted.", example = "OWNER")
    private Role role;
}
