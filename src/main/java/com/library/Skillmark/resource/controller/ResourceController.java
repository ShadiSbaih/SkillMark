package com.library.Skillmark.resource.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.resource.dto.CreateResourceRequest;
import com.library.Skillmark.resource.dto.ResourceResponse;
import com.library.Skillmark.resource.service.ResourceService;
import com.library.Skillmark.security.SecurityUtil;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@Tag(name = "Resources")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class ResourceController {
    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping("/api/v1/programs/{programId}/resources")
    ResponseEntity<ApiResponse<ResourceResponse>> create(@PathVariable UUID programId,
                                                         @Valid @RequestBody CreateResourceRequest request,
                                                         Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Resource created successfully",
                resourceService.create(programId, request, SecurityUtil.userId(authentication))));
    }

    @GetMapping("/api/v1/programs/{programId}/resources")
    ApiResponse<PageResponse<ResourceResponse>> list(@PathVariable UUID programId,
                                                     Authentication authentication,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Resources retrieved successfully",
                resourceService.list(programId, SecurityUtil.userId(authentication), page, size));
    }

    @GetMapping("/api/v1/resources/{resourceId}")
    ApiResponse<ResourceResponse> get(@PathVariable UUID resourceId, Authentication authentication) {
        return ApiResponse.success("Resource retrieved successfully",
                resourceService.get(resourceId, SecurityUtil.userId(authentication)));
    }

    @PutMapping("/api/v1/resources/{resourceId}")
    ApiResponse<ResourceResponse> update(@PathVariable UUID resourceId,
                                         @Valid @RequestBody CreateResourceRequest request,
                                         Authentication authentication) {
        return ApiResponse.success("Resource updated successfully",
                resourceService.update(resourceId, request, SecurityUtil.userId(authentication)));
    }

    @DeleteMapping("/api/v1/resources/{resourceId}")
    ApiResponse<Void> archive(@PathVariable UUID resourceId, Authentication authentication) {
        resourceService.archive(resourceId, SecurityUtil.userId(authentication));
        return ApiResponse.success("Resource archived successfully", null);
    }
}
