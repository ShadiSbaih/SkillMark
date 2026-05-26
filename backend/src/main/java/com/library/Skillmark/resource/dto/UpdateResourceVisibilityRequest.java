package com.library.Skillmark.resource.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateResourceVisibilityRequest(@NotNull Boolean visibleToParticipants) {
}
