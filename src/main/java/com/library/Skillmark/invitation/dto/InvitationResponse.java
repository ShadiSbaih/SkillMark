package com.library.Skillmark.invitation.dto;

import com.library.Skillmark.invitation.entity.InvitationLink;
import com.library.Skillmark.invitation.enums.InvitationStatus;

import java.time.Instant;
import java.util.UUID;

public record InvitationResponse(
        UUID id,
        UUID organizationId,
        UUID programId,
        String code,
        Integer maxUses,
        int usedCount,
        Instant expiresAt,
        InvitationStatus status,
        Instant createdAt
) {
    public static InvitationResponse from(InvitationLink invitation) {
        return new InvitationResponse(
                invitation.getId(),
                invitation.getOrganization().getId(),
                invitation.getProgram().getId(),
                invitation.getCode(),
                invitation.getMaxUses(),
                invitation.getUsedCount(),
                invitation.getExpiresAt(),
                invitation.getStatus(),
                invitation.getCreatedAt()
        );
    }
}
