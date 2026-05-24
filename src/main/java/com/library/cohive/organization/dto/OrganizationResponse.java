package com.library.cohive.organization.dto;

import java.time.Instant;
import java.util.UUID;

import com.library.cohive.organization.entity.Organization;

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
public class OrganizationResponse {
    private UUID id;
    private String name;
    private UUID ownerId;
    private Instant createdAt;

    public static OrganizationResponse fromEntity(Organization organization) {
        if (organization == null) {
            return null;
        }
        return OrganizationResponse.builder()
                .id(organization.getId())
                .name(organization.getName())
                .ownerId(organization.getOwner().getId())
                .createdAt(organization.getCreatedAt())
                .build();
    }
}
