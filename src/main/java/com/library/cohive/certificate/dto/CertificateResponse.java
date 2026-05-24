package com.library.cohive.certificate.dto;

import com.library.cohive.certificate.entity.Certificate;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Certificate returned by the API.")
public class CertificateResponse {
    @Schema(format = "uuid")
    private UUID id;

    @Schema(example = "Certificate of Completion")
    private String title;

    @Schema(example = "COHIVE-2026-A1B2C3D4")
    private String certificateCode;

    @Schema(example = "/api/v1/certificates/verify/COHIVE-2026-A1B2C3D4")
    private String verificationUrl;

    @Schema(format = "uuid")
    private UUID courseId;

    @Schema(example = "Spring Boot Fundamentals")
    private String courseTitle;

    @Schema(format = "uuid")
    private UUID studentId;

    @Schema(example = "Maya Saleh")
    private String studentName;

    @Schema(example = "Cohive Academy")
    private String organizationName;

    @Schema(format = "date-time")
    private Instant issuedAt;

    @Schema(format = "date-time")
    private Instant createdAt;

    public static CertificateResponse fromEntity(Certificate certificate) {
        if (certificate == null) {
            return null;
        }
        return CertificateResponse.builder()
                .id(certificate.getId())
                .title(certificate.getTitle())
                .certificateCode(certificate.getCertificateCode())
                .verificationUrl(certificate.getVerificationUrl())
                .courseId(certificate.getCourse().getId())
                .courseTitle(certificate.getCourse().getTitle())
                .studentId(certificate.getStudent().getId())
                .studentName(certificate.getStudent().getUser().getName())
                .organizationName(certificate.getCourse().getOrganization().getName())
                .issuedAt(certificate.getIssuedAt())
                .createdAt(certificate.getCreatedAt())
                .build();
    }
}
