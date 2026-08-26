package com.library.Skillmark.stats.dto;

import java.util.UUID;

public record TopProgramResponse(
        UUID programId,
        String programTitle,
        long enrollments,
        long certificatesIssued,
        double averageScore,
        double passRate
) {
}
