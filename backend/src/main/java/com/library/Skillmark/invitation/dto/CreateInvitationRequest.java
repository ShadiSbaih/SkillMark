package com.library.Skillmark.invitation.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;

import java.time.Instant;
import java.util.List;

public record CreateInvitationRequest(String description,
                                      @Min(1) Integer maxUses,
                                      Instant expiresAt,
                                      List<@Email String> emails) {
}
