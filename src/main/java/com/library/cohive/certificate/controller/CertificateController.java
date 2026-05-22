package com.library.cohive.certificate.controller;

import com.library.cohive.certificate.dto.CertificateResponse;
import com.library.cohive.certificate.dto.IssueCertificateRequest;
import com.library.cohive.certificate.service.CertificateService;
import com.library.cohive.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/certificates")
@RequiredArgsConstructor
public class CertificateController {
    private final CertificateService certificateService;

    @PostMapping
    public ApiResponse<CertificateResponse> issueCertificate(@Valid @RequestBody IssueCertificateRequest request) {
        return ApiResponse.success("Certificate issued successfully", certificateService.issueCertificate(request));
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<CertificateResponse>> getStudentCertificates(@PathVariable UUID studentId) {
        return ApiResponse.success(certificateService.getStudentCertificates(studentId));
    }
}