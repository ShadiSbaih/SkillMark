package com.library.cohive.resource.controller;

import com.library.cohive.common.response.ApiResponse;
import com.library.cohive.resource.dto.CreateResourceRequest;
import com.library.cohive.resource.dto.ResourceResponse;
import com.library.cohive.resource.service.ResourceService;
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
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
@Tag(name = "Resources", description = "Create and retrieve course learning resources.")
@SecurityRequirement(name = "bearerAuth")
public class ResourceController {
    private final ResourceService resourceService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a resource", description = "Adds a LINK resource URL to a course owned by the authenticated owner.")
    public ApiResponse<ResourceResponse> createResource(@Valid @RequestBody CreateResourceRequest request) {
        return ApiResponse.success("Resource created successfully", resourceService.createResource(request));
    }

    @GetMapping("/course/{courseId}")
    @Operation(summary = "List course resources", description = "Returns resources visible for the selected course.")
    public ApiResponse<List<ResourceResponse>> getCourseResources(@PathVariable UUID courseId) {
        return ApiResponse.success(resourceService.getCourseResources(courseId));
    }
}
