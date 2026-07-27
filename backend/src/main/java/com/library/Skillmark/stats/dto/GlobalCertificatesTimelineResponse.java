package com.library.Skillmark.stats.dto;

import java.util.List;

public record GlobalCertificatesTimelineResponse(
        List<Bucket> daily,
        List<Bucket> weekly
) {
    public record Bucket(
            String label,
            long issued,
            long revoked
    ) {
    }
}
