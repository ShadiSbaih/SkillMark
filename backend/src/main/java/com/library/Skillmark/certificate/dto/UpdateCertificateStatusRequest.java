package com.library.Skillmark.certificate.dto;

import com.library.Skillmark.certificate.enums.CertificateStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateCertificateStatusRequest(@NotNull CertificateStatus status, String reason) {
}
