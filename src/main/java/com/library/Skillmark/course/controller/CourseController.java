package com.library.Skillmark.course.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.course.dto.CourseResponse;
import com.library.Skillmark.course.dto.CreateCourseRequest;
import com.library.Skillmark.course.dto.UpdateCourseRequest;
import com.library.Skillmark.course.service.CourseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
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
@Tag(name = "Courses", description = "Create, browse, update, and delete courses.")
@SecurityRequirement(name = "bearerAuth")
public class CourseController {
    private final CourseService courseService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a course", description = "Creates a course under an organization owned by the authenticated owner.")
    public ApiResponse<CourseResponse> createCourse(@Valid @RequestBody CreateCourseRequest request) {
        return ApiResponse.success("Course created successfully", courseService.createCourse(request));
    }

    @GetMapping
    @Operation(summary = "List courses", description = "Returns courses visible to the authenticated user, optionally filtered by organization.")
    public ApiResponse<PageResponse<CourseResponse>> getCourses(
            @ParameterObject @PageableDefault(size = 10) Pageable pageable,
            @Parameter(description = "Optional organization UUID used to filter courses.")
            @RequestParam(value = "organizationId", required = false) UUID organizationId) {
        Page<CourseResponse> page = courseService.getCourses(pageable, organizationId);
        return ApiResponse.success(PageResponse.from(page));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get course details", description = "Returns one course when the authenticated user has access.")
    public ApiResponse<CourseResponse> getCourse(@PathVariable("id") UUID courseId) {
        return ApiResponse.success(courseService.getCourse(courseId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a course", description = "Updates the title and description of an owned course.")
    public ApiResponse<CourseResponse> updateCourse(
            @PathVariable("id") UUID courseId,
            @Valid @RequestBody UpdateCourseRequest request) {
        return ApiResponse.success("Course updated successfully", courseService.updateCourse(courseId, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a course", description = "Deletes a course owned by the authenticated owner.")
    public ApiResponse<Void> deleteCourse(@PathVariable("id") UUID courseId) {
        courseService.deleteCourse(courseId);
        return ApiResponse.success("Course deleted successfully", null);
    }
}
