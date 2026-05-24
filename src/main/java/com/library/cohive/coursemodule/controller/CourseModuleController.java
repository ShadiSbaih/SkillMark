package com.library.cohive.coursemodule.controller;

import com.library.cohive.common.response.ApiResponse;
import com.library.cohive.coursemodule.dto.CourseModuleResponse;
import com.library.cohive.coursemodule.dto.CreateCourseModuleRequest;
import com.library.cohive.coursemodule.dto.CreateLessonRequest;
import com.library.cohive.coursemodule.dto.LessonResponse;
import com.library.cohive.coursemodule.service.CourseModuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Tag(name = "Course Modules", description = "Manage course modules and lessons.")
@SecurityRequirement(name = "bearerAuth")
public class CourseModuleController {
    private final CourseModuleService courseModuleService;

    @PostMapping("/api/v1/courses/{courseId}/modules")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create course module", description = "Creates a module under an owned course.")
    public ApiResponse<CourseModuleResponse> createModule(
            @PathVariable UUID courseId,
            @Valid @RequestBody CreateCourseModuleRequest request) {
        return ApiResponse.success("Module created successfully", courseModuleService.createModule(courseId, request));
    }

    @PostMapping("/api/v1/modules/{moduleId}/lessons")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create lesson", description = "Creates a lesson under an owned course module.")
    public ApiResponse<LessonResponse> createLesson(
            @PathVariable UUID moduleId,
            @Valid @RequestBody CreateLessonRequest request) {
        return ApiResponse.success("Lesson created successfully", courseModuleService.createLesson(moduleId, request));
    }

    @GetMapping("/api/v1/courses/{courseId}/modules")
    @Operation(summary = "List course modules", description = "Returns course modules and lessons visible to the authenticated user.")
    public ApiResponse<List<CourseModuleResponse>> getCourseModules(@PathVariable UUID courseId) {
        return ApiResponse.success(courseModuleService.getCourseModules(courseId));
    }
}
