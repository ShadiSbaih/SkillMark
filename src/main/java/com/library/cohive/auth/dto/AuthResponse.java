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
@Schema(description = "Authentication response returned after register or login.")
public class AuthResponse {
    @Schema(description = "JWT bearer token used for authenticated requests.")
    private String token;
}
