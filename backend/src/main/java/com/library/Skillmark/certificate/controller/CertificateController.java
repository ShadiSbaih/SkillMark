package com.library.Skillmark.certificate.controller;

import com.library.Skillmark.certificate.controller.*;
import com.library.Skillmark.certificate.dto.*;
import com.library.Skillmark.certificate.entity.*;
import com.library.Skillmark.certificate.enums.*;
import com.library.Skillmark.certificate.repository.*;
import com.library.Skillmark.certificate.service.*;
import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.security.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
                                                           Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Certificate issued successfully",
                certificateService.issue(request, SecurityUtil.userId(authentication))));
    }

    @GetMapping("/me")
    @Operation(summary = "List my certificates", description = "Returns certificates issued to the current authenticated user.")
    ApiResponse<PageResponse<CertificateResponse>> mine(Authentication authentication,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Certificates retrieved successfully",
                certificateService.mine(SecurityUtil.userId(authentication), page, size));
    }

    @GetMapping("/organization/{organizationId}")
    @Operation(summary = "List organization certificates", description = "Returns certificates issued under an owned organization.")
    ApiResponse<PageResponse<CertificateResponse>> organizationCertificates(@PathVariable UUID organizationId,
                                                                            Authentication authentication,
                                                                            @RequestParam(defaultValue = "0") int page,
                                                                            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Certificates retrieved successfully",
                certificateService.organizationCertificates(organizationId, SecurityUtil.userId(authentication), page, size));
    }

    @GetMapping("/{certificateId}")
    @Operation(summary = "Get certificate", description = "Returns certificate details for the certificate owner or owner of the issuing organization.")
    ApiResponse<CertificateResponse> get(@PathVariable UUID certificateId, Authentication authentication) {
        return ApiResponse.success("Certificate retrieved successfully",
                certificateService.get(certificateId, SecurityUtil.userId(authentication)));
    }

    @PostMapping("/{certificateId}/revoke")
    @Operation(summary = "Revoke certificate", description = "Revokes an active certificate while preserving it for historical and public verification.")
    ApiResponse<CertificateResponse> revoke(@PathVariable UUID certificateId,
                                            @RequestBody RevokeCertificateRequest request,
                                            Authentication authentication) {
        return ApiResponse.success("Certificate revoked successfully",
                certificateService.revoke(certificateId, request, SecurityUtil.userId(authentication)));
    }
}
