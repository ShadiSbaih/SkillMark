package com.library.Skillmark.enrollment.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.enrollment.dto.CreateEnrollmentRequest;
import com.library.Skillmark.enrollment.dto.EnrollmentResponse;
import com.library.Skillmark.enrollment.service.EnrollmentService;
import com.library.Skillmark.security.AuthUser;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Enrollments")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping("/programs/{programId}/enrollments")
    ResponseEntity<ApiResponse<EnrollmentResponse>> enroll(@PathVariable UUID programId,
                                                           @Valid @RequestBody CreateEnrollmentRequest request,
                                                           AuthUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Enrollment created successfully",
                enrollmentService.enroll(programId, request, currentUser.id())));
    }

    @GetMapping("/programs/{programId}/enrollments")
    ApiResponse<PageResponse<EnrollmentResponse>> list(@PathVariable UUID programId,
                                                       AuthUser currentUser,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Enrollments retrieved successfully",
                enrollmentService.list(programId, currentUser.id(), page, size));
    }

    @DeleteMapping("/programs/{programId}/enrollments/{userId}")
    ApiResponse<Void> remove(@PathVariable UUID programId, @PathVariable UUID userId, AuthUser currentUser) {
        enrollmentService.remove(programId, userId, currentUser.id());
        return ApiResponse.success("Enrollment removed successfully", null);
    }
}
