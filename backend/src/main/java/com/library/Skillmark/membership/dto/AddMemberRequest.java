package com.library.Skillmark.membership.dto;

import com.library.Skillmark.membership.enums.MembershipRole;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddMemberRequest(@NotNull UUID userId, @NotNull MembershipRole role) {
}
