package com.library.Skillmark.organization.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateOrganizationRequest(@NotBlank String name, String description) {
}
