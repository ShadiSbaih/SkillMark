package com.library.Skillmark.organization.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateOrganizationRequest(@NotBlank String name, String description) {
}
