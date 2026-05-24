package com.library.cohive.student.controller;

import com.library.cohive.common.response.ApiResponse;
import com.library.cohive.common.response.PageResponse;
import com.library.cohive.student.dto.CreateStudentRequest;
import com.library.cohive.student.dto.StudentResponse;
import com.library.cohive.student.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
public class StudentController {
    private final StudentService studentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<StudentResponse> createStudent(@Valid @RequestBody CreateStudentRequest request) {
        return ApiResponse.success("Student created successfully", studentService.createStudent(request));
    }

    @GetMapping
    public ApiResponse<PageResponse<StudentResponse>> getStudents(@PageableDefault(size = 10) Pageable pageable) {
        Page<StudentResponse> page = studentService.getStudents(pageable);
        return ApiResponse.success(PageResponse.from(page));
    }

    @GetMapping("/{id}")
    public ApiResponse<StudentResponse> getStudent(@PathVariable("id") UUID studentId) {
        return ApiResponse.success(studentService.getStudent(studentId));
    }
}
