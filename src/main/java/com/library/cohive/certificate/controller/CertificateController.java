package com.library.cohive.certificate.controller;

import com.library.cohive.certificate.dto.CertificateResponse;
import com.library.cohive.certificate.dto.IssueCertificateRequest;
import com.library.cohive.certificate.service.CertificateService;
import com.library.cohive.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/certificates")
@RequiredArgsConstructor
@Tag(name = "Certificates", description = "Issue and retrieve course completion certificates.")
@SecurityRequirement(name = "bearerAuth")
public class CertificateController {
    private final CertificateService certificateService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Issue a certificate", description = "Issues a certificate for a student enrolled in a course.")
    public ApiResponse<CertificateResponse> issueCertificate(@Valid @RequestBody IssueCertificateRequest request) {
        return ApiResponse.success("Certificate issued successfully", certificateService.issueCertificate(request));
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "List student certificates", description = "Returns certificates accessible for the selected student.")
    public ApiResponse<List<CertificateResponse>> getStudentCertificates(@PathVariable UUID studentId) {
        return ApiResponse.success(certificateService.getStudentCertificates(studentId));
    }
}
