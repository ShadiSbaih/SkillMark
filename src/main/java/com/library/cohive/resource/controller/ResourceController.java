package com.library.cohive.resource.controller;

import com.library.cohive.common.response.ApiResponse;
import com.library.cohive.resource.dto.CreateResourceRequest;
import com.library.cohive.resource.dto.ResourceResponse;
import com.library.cohive.resource.service.ResourceService;
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
public class ResourceController {
    private final ResourceService resourceService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ResourceResponse> createResource(@Valid @RequestBody CreateResourceRequest request) {
        return ApiResponse.success("Resource created successfully", resourceService.createResource(request));
    }

    @GetMapping("/course/{courseId}")
    public ApiResponse<List<ResourceResponse>> getCourseResources(@PathVariable UUID courseId) {
        return ApiResponse.success(resourceService.getCourseResources(courseId));
    }
}
