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
        String inviteUrl,
        String description,
        Integer maxUses,
        int usedCount,
        Instant expiresAt,
        InvitationStatus status,
        Instant disabledAt,
        Instant createdAt
) {
    public static InvitationResponse from(InvitationLink invitation, String inviteUrl) {
        return new InvitationResponse(
                invitation.getId(),
                invitation.getOrganization().getId(),
                invitation.getProgram().getId(),
                invitation.getCode(),
                inviteUrl,
                invitation.getDescription(),
                invitation.getMaxUses(),
                invitation.getUsedCount(),
                invitation.getExpiresAt(),
                invitation.getStatus(),
                invitation.getDisabledAt(),
                invitation.getCreatedAt()
        );
    }
}
