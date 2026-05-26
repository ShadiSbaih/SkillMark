package com.library.Skillmark.organization.dto;

import com.library.Skillmark.organization.entity.Organization;
import com.library.Skillmark.organization.enums.OrganizationStatus;

import java.time.Instant;
import java.util.UUID;

public record OrganizationResponse(
        UUID id,
        String name,
        String description,
        String logoUrl,
        UUID ownerId,
        OrganizationStatus status,
        Instant createdAt
) {
    public static OrganizationResponse from(Organization organization) {
        return new OrganizationResponse(
                organization.getId(),
                organization.getName(),
                organization.getDescription(),
                organization.getLogoUrl(),
                organization.getOwner().getId(),
                organization.getStatus(),
                organization.getCreatedAt()
        );
    }
}
