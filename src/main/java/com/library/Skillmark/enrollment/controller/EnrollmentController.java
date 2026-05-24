package com.library.Skillmark.enrollment.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.enrollment.dto.EnrollStudentRequest;
import com.library.Skillmark.enrollment.dto.EnrollmentResponse;
import com.library.Skillmark.enrollment.service.EnrollmentService;
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
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
@Tag(name = "Enrollments", description = "Manage course enrollments between students and courses.")
@SecurityRequirement(name = "bearerAuth")
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Enroll a student", description = "Enrolls a student in a course owned by the authenticated owner.")
    public ApiResponse<EnrollmentResponse> enrollStudent(@Valid @RequestBody EnrollStudentRequest request) {
        return ApiResponse.success("Student enrolled successfully", enrollmentService.enrollStudent(request));
    }

    @GetMapping("/course/{courseId}")
    @Operation(summary = "List course enrollments", description = "Returns enrollments for the selected course.")
    public ApiResponse<List<EnrollmentResponse>> getCourseEnrollments(@PathVariable UUID courseId) {
        return ApiResponse.success(enrollmentService.getCourseEnrollments(courseId));
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "List student enrollments", description = "Returns enrollments for the selected student within the caller's authorized scope.")
    public ApiResponse<List<EnrollmentResponse>> getStudentEnrollments(@PathVariable UUID studentId) {
        return ApiResponse.success(enrollmentService.getStudentEnrollments(studentId));
    }
}
