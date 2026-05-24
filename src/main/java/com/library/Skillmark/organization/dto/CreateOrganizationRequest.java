package com.library.Skillmark.organization.dto;

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
@Schema(description = "Request body for creating an organization.")
public class CreateOrganizationRequest {
    @NotBlank
    @Schema(description = "Organization name.", example = "Tech Academy")
    private String name;
}
