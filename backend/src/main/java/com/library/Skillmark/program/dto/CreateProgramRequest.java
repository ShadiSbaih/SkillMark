package com.library.Skillmark.program.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record CreateProgramRequest(
        @NotBlank String title,
        String description,
        String coverImageUrl,
        LocalDate startDate,
        LocalDate endDate
) {
}
