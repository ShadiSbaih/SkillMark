package com.library.Skillmark.resource.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.resource.dto.CreateResourceRequest;
import com.library.Skillmark.resource.dto.ResourceResponse;
import com.library.Skillmark.resource.dto.UpdateResourceVisibilityRequest;
import com.library.Skillmark.resource.service.ResourceService;
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
@Tag(name = "Resources")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class ResourceController {
    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping("/programs/{programId}/resources")
    ResponseEntity<ApiResponse<ResourceResponse>> create(@PathVariable UUID programId,
                                                         @Valid @RequestBody CreateResourceRequest request,
                                                         AuthUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Resource created successfully",
                resourceService.create(programId, request, currentUser.id())));
    }

    @GetMapping("/programs/{programId}/resources")
    ApiResponse<PageResponse<ResourceResponse>> list(@PathVariable UUID programId,
                                                     AuthUser currentUser,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Resources retrieved successfully",
                resourceService.list(programId, currentUser.id(), page, size));
    }

    @GetMapping("/resources/{resourceId}")
    ApiResponse<ResourceResponse> get(@PathVariable UUID resourceId, AuthUser currentUser) {
        return ApiResponse.success("Resource retrieved successfully",
                resourceService.get(resourceId, currentUser.id()));
    }

    @PutMapping("/resources/{resourceId}")
    ApiResponse<ResourceResponse> update(@PathVariable UUID resourceId,
                                         @Valid @RequestBody CreateResourceRequest request,
                                         AuthUser currentUser) {
        return ApiResponse.success("Resource updated successfully",
                resourceService.update(resourceId, request, currentUser.id()));
    }

    @DeleteMapping("/resources/{resourceId}")
    ApiResponse<Void> archive(@PathVariable UUID resourceId, AuthUser currentUser) {
        resourceService.archive(resourceId, currentUser.id());
        return ApiResponse.success("Resource archived successfully", null);
    }

    @PatchMapping("/resources/{resourceId}/visibility")
    ApiResponse<ResourceResponse> updateVisibility(@PathVariable UUID resourceId,
                                                   @Valid @RequestBody UpdateResourceVisibilityRequest request,
                                                   AuthUser currentUser) {
        return ApiResponse.success("Resource visibility updated successfully",
                resourceService.updateVisibility(resourceId, request.visibleToParticipants(), currentUser.id()));
    }
}
