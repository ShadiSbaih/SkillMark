package com.library.Skillmark.program.dto;

import com.library.Skillmark.program.entity.Program;
import com.library.Skillmark.program.enums.ProgramStatus;

import java.time.Instant;
import java.util.UUID;

public record ProgramResponse(
        UUID id,
        UUID organizationId,
        String title,
        String description,
        String coverImageUrl,
        ProgramStatus status,
        boolean isPublished,
        Instant startDate,
        Instant endDate,
        Instant createdAt
) {
    public static ProgramResponse from(Program program) {
        return new ProgramResponse(
                program.getId(),
                program.getOrganization().getId(),
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
