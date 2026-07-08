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
        UUID programId,
        UUID quizId,
        UUID userId,
        UUID attemptId,
        String title,
        String participantNameSnapshot,
        String quizTitleSnapshot,
        String programTitleSnapshot,
        String organizationNameSnapshot,
        String ownerNameSnapshot,
        CertificateStatus status,
        Instant issuedAt,
        Instant revokedAt,
        String pdfUrl,
        String pdfObjectKey,
        String qrCodeUrl,
        String qrCodeObjectKey
) {
    public static CertificateResponse from(Certificate certificate) {
        return new CertificateResponse(
                certificate.getId(),
                certificate.getCertificateNumber(),
                certificate.getVerificationCode(),
                certificate.getOrganization().getId(),
                certificate.getProgram().getId(),
                certificate.getQuiz().getId(),
                certificate.getUser().getId(),
                certificate.getAttempt().getId(),
                certificate.getTitle(),
                certificate.getParticipantNameSnapshot(),
                certificate.getQuizTitleSnapshot(),
                certificate.getProgramTitleSnapshot(),
                certificate.getOrganizationNameSnapshot(),
                certificate.getOwnerNameSnapshot(),
                certificate.getStatus(),
                certificate.getIssuedAt(),
                certificate.getRevokedAt(),
                certificate.getPdfUrl(),
                certificate.getPdfObjectKey(),
                certificate.getQrCodeUrl(),
                certificate.getQrCodeObjectKey()
        );
    }
}
