package com.library.cohive.certificate.dto;

import com.library.cohive.certificate.entity.Certificate;
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
public class CertificateResponse {
    private UUID id;
    private String title;
    private UUID courseId;
    private UUID studentId;
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
