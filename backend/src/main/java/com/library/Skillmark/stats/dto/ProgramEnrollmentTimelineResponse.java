package com.library.Skillmark.stats.dto;

import java.util.List;

public record ProgramEnrollmentTimelineResponse(
        List<Bucket> daily,
        List<Bucket> weekly
) {
    public record Bucket(
            String label,
            long total,
            long active,
            long completed
    ) {
    }
}
