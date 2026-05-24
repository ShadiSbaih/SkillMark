package com.library.Skillmark.certificate.dto;

import com.library.Skillmark.certificate.entity.Certificate;
import com.library.Skillmark.certificate.enums.CertificateStatus;

import java.time.Instant;

public record PublicCertificateVerificationResponse(
        String certificateNumber,
        CertificateStatus status,
        String participantName,
        String quizTitle,
        String programTitle,
        String organizationName,
        Instant issuedAt,
        Instant revokedAt
) {
    public static PublicCertificateVerificationResponse from(Certificate certificate) {
        return new PublicCertificateVerificationResponse(
                certificate.getCertificateNumber(),
                certificate.getStatus(),
                certificate.getParticipantNameSnapshot(),
                certificate.getQuizTitleSnapshot(),
                certificate.getProgramTitleSnapshot(),
                certificate.getOrganizationNameSnapshot(),
                certificate.getIssuedAt(),
                certificate.getRevokedAt()
        );
    }
}
