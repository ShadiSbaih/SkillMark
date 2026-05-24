package com.library.cohive.organization.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(name = "CreateOrganizationRequest", description = "Creates a new organization owned by the authenticated user.")
public class CreateOrganizationRequest {
    @NotBlank
    @Schema(description = "Organization display name.", example = "Tech Academy")
    private String name;
}
