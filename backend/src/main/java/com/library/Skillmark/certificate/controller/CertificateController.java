package com.library.Skillmark.certificate.controller;

import com.library.Skillmark.certificate.controller.*;
import com.library.Skillmark.certificate.dto.*;
import com.library.Skillmark.certificate.entity.*;
import com.library.Skillmark.certificate.enums.*;
import com.library.Skillmark.certificate.repository.*;
import com.library.Skillmark.certificate.service.*;
import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.security.AuthUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/certificates")
@Tag(name = "Certificates")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class CertificateController {
    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @PostMapping
    @Operation(summary = "Issue certificate", description = "Manually issues a certificate for a submitted passing attempt on a MANUAL certificate quiz. Requires owner permission.")
    ResponseEntity<ApiResponse<CertificateResponse>> issue(@Valid @RequestBody IssueCertificateRequest request,
                                                           AuthUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Certificate issued successfully",
                certificateService.issue(request, currentUser.id())));
    }

    @GetMapping("/{certificateId}")
    @Operation(summary = "Get certificate", description = "Returns certificate details for the certificate owner or owner of the issuing organization.")
    ApiResponse<CertificateResponse> get(@PathVariable UUID certificateId, AuthUser currentUser) {
        return ApiResponse.success("Certificate retrieved successfully",
                certificateService.get(certificateId, currentUser.id()));
    }

    @PatchMapping("/{certificateId}/status")
    @Operation(summary = "Update certificate status", description = "Updates certificate status. Currently only revocation (REVOKED) is supported, with an optional reason.")
    ApiResponse<CertificateResponse> updateStatus(@PathVariable UUID certificateId,
                                                  @Valid @RequestBody UpdateCertificateStatusRequest request,
                                                  AuthUser currentUser) {
        return ApiResponse.success("Certificate status updated successfully",
                certificateService.updateStatus(certificateId, request, currentUser.id()));
    }
}
