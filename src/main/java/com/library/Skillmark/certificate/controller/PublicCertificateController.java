package com.library.Skillmark.certificate.controller;

import com.library.Skillmark.certificate.controller.*;
import com.library.Skillmark.certificate.dto.*;
import com.library.Skillmark.certificate.entity.*;
import com.library.Skillmark.certificate.enums.*;
import com.library.Skillmark.certificate.repository.*;
import com.library.Skillmark.certificate.service.*;
import com.library.Skillmark.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/certificates")
@Tag(name = "Public Verification")
public class PublicCertificateController {
    private final CertificateService certificateService;

    public PublicCertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @GetMapping("/verify/{verificationCode}")
    @Operation(summary = "Verify public certificate", description = "Publicly verifies a certificate by verification code without requiring authentication. Does not expose sensitive user or attempt data.")
    ApiResponse<PublicCertificateVerificationResponse> verify(@PathVariable String verificationCode) {
        return ApiResponse.success("Certificate verified successfully", certificateService.verify(verificationCode));
    }
}
