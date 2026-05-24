package com.library.cohive.organization.dto;

import java.time.Instant;
import java.util.UUID;

import com.library.cohive.organization.entity.Organization;

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
@Schema(description = "Organization details returned by the API.")
public class OrganizationResponse {
    @Schema(format = "uuid")
    private UUID id;

    @Schema(example = "Tech Academy")
    private String name;

    @Schema(format = "uuid")
    private UUID ownerId;

    @Schema(format = "date-time")
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
