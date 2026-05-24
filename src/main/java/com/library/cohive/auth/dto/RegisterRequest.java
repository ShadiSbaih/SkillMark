package com.library.cohive.auth.dto;

import com.library.cohive.user.entity.Role;
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
@Schema(name = "RegisterRequest", description = "Payload used to create a new user account.")
public class RegisterRequest {
    @NotBlank
    @Schema(description = "Full display name for the new user.", example = "John Doe")
    private String name;

    @Email
    @NotBlank
    @Schema(description = "Unique email address used for login.", example = "john@example.com")
    private String email;

    @NotBlank
    @Size(min = 6)
    @Schema(description = "Password with a minimum length of 6 characters.", example = "password123", minLength = 6)
    private String password;

    @Schema(description = "Initial platform role. Defaults to `STUDENT` when omitted.", example = "OWNER", nullable = true)
    private Role role;
}
