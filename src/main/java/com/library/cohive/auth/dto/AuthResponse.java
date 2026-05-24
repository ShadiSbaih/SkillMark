package com.library.cohive.auth.dto;

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
@Schema(name = "AuthResponse", description = "Authentication result returned after register or login operations.")
public class AuthResponse {
    @Schema(description = "JWT bearer token used for authenticated API calls.", example = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1dWlkIn0.signature")
    private String token;
}
