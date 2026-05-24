package com.library.Skillmark.stats.dto;

public record OrganizationStatsResponse(
        long totalPrograms,
        long totalMembers,
        long totalCertificates
) {
}
