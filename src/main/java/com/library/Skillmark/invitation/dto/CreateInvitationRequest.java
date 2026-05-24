package com.library.Skillmark.invitation.dto;

import jakarta.validation.constraints.Min;

import java.time.Instant;

public record CreateInvitationRequest(@Min(1) Integer maxUses, Instant expiresAt) {
}
