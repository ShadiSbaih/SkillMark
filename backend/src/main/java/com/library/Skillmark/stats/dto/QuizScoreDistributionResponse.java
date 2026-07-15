package com.library.Skillmark.stats.dto;

import java.util.List;

public record QuizScoreDistributionResponse(
        List<Bucket> buckets
) {
    public record Bucket(String label, int minScore, int maxScore, long count) {
    }
}
