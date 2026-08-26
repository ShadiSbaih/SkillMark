package com.library.Skillmark.user.controller;

import com.library.Skillmark.attempt.dto.AttemptResponse;
import com.library.Skillmark.attempt.service.QuizAttemptService;
import com.library.Skillmark.certificate.dto.CertificateResponse;
import com.library.Skillmark.certificate.service.CertificateService;
import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.enrollment.dto.EnrollmentResponse;
import com.library.Skillmark.enrollment.service.EnrollmentService;
import com.library.Skillmark.security.AuthUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
@Tag(name = "Me")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class MeController {
    private final EnrollmentService enrollmentService;
    private final QuizAttemptService attemptService;
    private final CertificateService certificateService;

    public MeController(EnrollmentService enrollmentService,
                        QuizAttemptService attemptService,
                        CertificateService certificateService) {
        this.enrollmentService = enrollmentService;
        this.attemptService = attemptService;
        this.certificateService = certificateService;
    }

    @GetMapping("/enrollments")
    @Operation(summary = "List my enrollments", description = "Returns enrollments for the current authenticated user.")
    ApiResponse<PageResponse<EnrollmentResponse>> enrollments(AuthUser currentUser,
                                                              @RequestParam(defaultValue = "0") int page,
                                                              @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Enrollments retrieved successfully",
                enrollmentService.mine(currentUser.id(), page, size));
    }

    @GetMapping("/attempts")
    @Operation(summary = "List my attempts", description = "Returns attempts owned by the current authenticated user.")
    ApiResponse<PageResponse<AttemptResponse>> attempts(AuthUser currentUser,
                                                        @RequestParam(defaultValue = "0") int page,
                                                        @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Attempts retrieved successfully",
                attemptService.mine(currentUser.id(), page, size));
    }

    @GetMapping("/certificates")
    @Operation(summary = "List my certificates", description = "Returns certificates issued to the current authenticated user.")
    ApiResponse<PageResponse<CertificateResponse>> certificates(AuthUser currentUser,
                                                                @RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Certificates retrieved successfully",
                certificateService.mine(currentUser.id(), page, size));
    }
}
