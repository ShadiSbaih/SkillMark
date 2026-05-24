package com.library.Skillmark.membership.dto;

import com.library.Skillmark.membership.entity.OrganizationMembership;
import com.library.Skillmark.membership.enums.MembershipRole;
import com.library.Skillmark.membership.enums.MembershipStatus;

import java.time.Instant;
import java.util.UUID;

public record MembershipResponse(
        UUID id,
        UUID organizationId,
        UUID userId,
        String userName,
        String userEmail,
        MembershipRole role,
        MembershipStatus status,
        Instant createdAt
) {
    public static MembershipResponse from(OrganizationMembership membership) {
        return new MembershipResponse(
                membership.getId(),
                membership.getOrganization().getId(),
                membership.getUser().getId(),
                membership.getUser().getName(),
                membership.getUser().getEmail(),
                membership.getRole(),
                membership.getStatus(),
                membership.getCreatedAt()
        );
    }
}
