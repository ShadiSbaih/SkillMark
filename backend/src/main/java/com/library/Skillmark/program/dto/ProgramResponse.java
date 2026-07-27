package com.library.Skillmark.program.dto;

import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.program.enums.ProgramStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ProgramResponse(
        UUID id,
        UUID organizationId,
        String title,
        String description,
        String coverImageUrl,
        ProgramStatus status,
        @Schema(description = "Compatibility field derived from status == PUBLISHED. Do not treat as an independent state.")
        boolean isPublished,
        LocalDate startDate,
        LocalDate endDate,
        Instant createdAt
) {
    public static ProgramResponse from(Program program) {
        return new ProgramResponse(
                program.getId(),
                program.getOrganizationId(),
                program.getTitle(),
                program.getDescription(),
                program.getCoverImageUrl(),
                program.getStatus(),
                program.isPublished(),
                program.getStartDate(),
                program.getEndDate(),
                program.getCreatedAt()
        );
    }
}
