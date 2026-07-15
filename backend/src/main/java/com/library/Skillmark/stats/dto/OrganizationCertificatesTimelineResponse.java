package com.library.Skillmark.stats.dto;

import java.util.List;

public record OrganizationCertificatesTimelineResponse(
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
