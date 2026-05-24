package com.library.Skillmark.certificate.dto;

import com.library.Skillmark.certificate.entity.Certificate;
import com.library.Skillmark.certificate.enums.CertificateStatus;

import java.time.Instant;
import java.util.UUID;

public record CertificateResponse(
        UUID id,
        String certificateNumber,
        String verificationCode,
        UUID organizationId,
        UUID quizId,
        UUID userId,
        UUID attemptId,
        String title,
        String participantNameSnapshot,
        String quizTitleSnapshot,
        String organizationNameSnapshot,
        CertificateStatus status,
        Instant issuedAt,
        Instant revokedAt
) {
    public static CertificateResponse from(Certificate certificate) {
        return new CertificateResponse(
                certificate.getId(),
                certificate.getCertificateNumber(),
                certificate.getVerificationCode(),
                certificate.getOrganization().getId(),
                certificate.getQuiz().getId(),
                certificate.getUser().getId(),
                certificate.getAttempt().getId(),
                certificate.getTitle(),
                certificate.getParticipantNameSnapshot(),
                certificate.getQuizTitleSnapshot(),
                certificate.getOrganizationNameSnapshot(),
                certificate.getStatus(),
                certificate.getIssuedAt(),
                certificate.getRevokedAt()
        );
    }
}
