package com.library.Skillmark.enrollment.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.enrollment.dto.CreateEnrollmentRequest;
import com.library.Skillmark.enrollment.dto.EnrollmentResponse;
import com.library.Skillmark.enrollment.service.EnrollmentService;
import com.library.Skillmark.security.SecurityUtil;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@Tag(name = "Enrollments")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping("/api/v1/programs/{programId}/enrollments")
    ResponseEntity<ApiResponse<EnrollmentResponse>> enroll(@PathVariable UUID programId,
                                                           @Valid @RequestBody CreateEnrollmentRequest request,
                                                           Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Enrollment created successfully",
                enrollmentService.enroll(programId, request, SecurityUtil.userId(authentication))));
    }

    @GetMapping("/api/v1/programs/{programId}/enrollments")
    ApiResponse<PageResponse<EnrollmentResponse>> list(@PathVariable UUID programId,
                                                       Authentication authentication,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Enrollments retrieved successfully",
                enrollmentService.list(programId, SecurityUtil.userId(authentication), page, size));
    }

    @GetMapping("/api/v1/enrollments/me")
    ApiResponse<PageResponse<EnrollmentResponse>> mine(Authentication authentication,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Enrollments retrieved successfully",
                enrollmentService.mine(SecurityUtil.userId(authentication), page, size));
    }

    @DeleteMapping("/api/v1/programs/{programId}/enrollments/{userId}")
    ApiResponse<Void> remove(@PathVariable UUID programId, @PathVariable UUID userId, Authentication authentication) {
        enrollmentService.remove(programId, userId, SecurityUtil.userId(authentication));
        return ApiResponse.success("Enrollment removed successfully", null);
    }
}
