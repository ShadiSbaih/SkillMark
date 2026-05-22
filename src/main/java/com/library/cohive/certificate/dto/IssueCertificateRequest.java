package com.library.cohive.certificate.dto;

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
public class IssueCertificateRequest {
    @NotNull
    private UUID studentId;

    @NotNull
    private UUID courseId;

    private String title;
}
