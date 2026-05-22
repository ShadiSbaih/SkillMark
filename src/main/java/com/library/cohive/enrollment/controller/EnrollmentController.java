package com.library.cohive.enrollment.controller;

import com.library.cohive.common.response.ApiResponse;
import com.library.cohive.enrollment.dto.EnrollStudentRequest;
import com.library.cohive.enrollment.dto.EnrollmentResponse;
import com.library.cohive.enrollment.service.EnrollmentService;
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
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    @PostMapping
    public ApiResponse<EnrollmentResponse> enrollStudent(@Valid @RequestBody EnrollStudentRequest request) {
        return ApiResponse.success("Student enrolled successfully", enrollmentService.enrollStudent(request));
    }

    @GetMapping("/course/{courseId}")
    public ApiResponse<List<EnrollmentResponse>> getCourseEnrollments(@PathVariable UUID courseId) {
        return ApiResponse.success(enrollmentService.getCourseEnrollments(courseId));
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<EnrollmentResponse>> getStudentEnrollments(@PathVariable UUID studentId) {
        return ApiResponse.success(enrollmentService.getStudentEnrollments(studentId));
    }
}