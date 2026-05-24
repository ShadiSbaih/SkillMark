package com.library.Skillmark.student.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.student.dto.CreateStudentRequest;
import com.library.Skillmark.student.dto.StudentResponse;
import com.library.Skillmark.student.service.StudentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
@Tag(name = "Students", description = "Create and view student profiles.")
@SecurityRequirement(name = "bearerAuth")
public class StudentController {
    private final StudentService studentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a student", description = "Creates a student account and adds it to an organization.")
    public ApiResponse<StudentResponse> createStudent(@Valid @RequestBody CreateStudentRequest request) {
        return ApiResponse.success("Student created successfully", studentService.createStudent(request));
    }

    @GetMapping
    @Operation(summary = "List students", description = "Returns students visible to the authenticated owner.")
    public ApiResponse<PageResponse<StudentResponse>> getStudents(
            @ParameterObject @PageableDefault(size = 10) Pageable pageable) {
        Page<StudentResponse> page = studentService.getStudents(pageable);
        return ApiResponse.success(PageResponse.from(page));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get student details", description = "Returns one student profile when the authenticated user has access.")
    public ApiResponse<StudentResponse> getStudent(@PathVariable("id") UUID studentId) {
        return ApiResponse.success(studentService.getStudent(studentId));
    }
}
