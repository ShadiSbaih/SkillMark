package com.library.Skillmark.program.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public record CreateProgramRequest(
        @NotBlank String title,
        String description,
        String coverImageUrl,
        Instant startDate,
        Instant endDate
) {
}
