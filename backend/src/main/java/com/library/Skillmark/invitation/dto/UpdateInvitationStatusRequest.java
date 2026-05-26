package com.library.Skillmark.invitation.dto;

import com.library.Skillmark.invitation.enums.InvitationStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateInvitationStatusRequest(@NotNull InvitationStatus status) {
}
