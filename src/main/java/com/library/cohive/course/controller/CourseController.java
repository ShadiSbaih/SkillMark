package com.library.cohive.course.controller;

import com.library.cohive.common.response.ApiResponse;
import com.library.cohive.common.response.PageResponse;
import com.library.cohive.course.dto.CourseResponse;
import com.library.cohive.course.dto.CreateCourseRequest;
import com.library.cohive.course.dto.UpdateCourseRequest;
import com.library.cohive.course.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {
    private final CourseService courseService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CourseResponse> createCourse(@Valid @RequestBody CreateCourseRequest request) {
        return ApiResponse.success("Course created successfully", courseService.createCourse(request));
    }

    @GetMapping
    public ApiResponse<PageResponse<CourseResponse>> getCourses(
            @PageableDefault(size = 10) Pageable pageable,
            @RequestParam(value = "organizationId", required = false) UUID organizationId) {
        Page<CourseResponse> page = courseService.getCourses(pageable, organizationId);
        return ApiResponse.success(PageResponse.from(page));
    }

    @GetMapping("/{id}")
    public ApiResponse<CourseResponse> getCourse(@PathVariable("id") UUID courseId) {
        return ApiResponse.success(courseService.getCourse(courseId));
    }

    @PutMapping("/{id}")
    public ApiResponse<CourseResponse> updateCourse(
            @PathVariable("id") UUID courseId,
            @Valid @RequestBody UpdateCourseRequest request) {
        return ApiResponse.success("Course updated successfully", courseService.updateCourse(courseId, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCourse(@PathVariable("id") UUID courseId) {
        courseService.deleteCourse(courseId);
        return ApiResponse.success("Course deleted successfully", null);
    }
}
