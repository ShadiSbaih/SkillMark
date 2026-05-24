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
@Schema(description = "Request body for issuing a certificate.")
public class IssueCertificateRequest {
    @NotNull
    @Schema(description = "Student receiving the certificate.", format = "uuid")
    private UUID studentId;

    @NotNull
    @Schema(description = "Course tied to the certificate.", format = "uuid")
    private UUID courseId;

    @Schema(description = "Optional certificate title.", example = "Certificate of Completion")
    private String title;
}
