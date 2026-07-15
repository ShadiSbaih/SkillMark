package com.library.Skillmark.stats.dto;

import java.util.List;

public record QuizAttemptTimelineResponse(
        List<Bucket> daily,
        List<Bucket> weekly
) {
    public record Bucket(
            String label,
            long started,
            long submitted,
            long passed
    ) {
    }
}
