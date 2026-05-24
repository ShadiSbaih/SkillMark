package com.library.cohive.certificate.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(name = "IssueCertificateRequest", description = "Issues a course completion certificate to an enrolled student.")
public class IssueCertificateRequest {
    @NotNull
    @Schema(description = "Student identifier receiving the certificate.", format = "uuid")
    private UUID studentId;

    @NotNull
    @Schema(description = "Course identifier tied to the certificate.", format = "uuid")
    private UUID courseId;

    @Schema(description = "Certificate title shown to the student.", example = "Certificate of Completion", nullable = true)
    private String title;
}
