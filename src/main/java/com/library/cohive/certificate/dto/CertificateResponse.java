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

    @Schema(format = "uuid")
    private UUID courseId;

    @Schema(format = "uuid")
    private UUID studentId;

    @Schema(format = "date-time")
    private Instant createdAt;

    public static CertificateResponse fromEntity(Certificate certificate) {
        if (certificate == null) {
            return null;
        }
        return CertificateResponse.builder()
                .id(certificate.getId())
                .title(certificate.getTitle())
                .courseId(certificate.getCourse().getId())
                .studentId(certificate.getStudent().getId())
                .createdAt(certificate.getCreatedAt())
                .build();
    }
}
