package com.library.Skillmark.storage.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.security.AuthUser;
import com.library.Skillmark.security.service.AuthorizationService;
import com.library.Skillmark.storage.dto.R2UploadUrlRequest;
import com.library.Skillmark.storage.dto.R2UploadUrlResponse;
import com.library.Skillmark.storage.service.R2StorageService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Storage")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class StorageController {
    private final R2StorageService r2StorageService;
    private final AuthorizationService authorizationService;

    public StorageController(R2StorageService r2StorageService, AuthorizationService authorizationService) {
        this.r2StorageService = r2StorageService;
        this.authorizationService = authorizationService;
    }

    @PostMapping("/storage/upload-urls")
    ApiResponse<R2UploadUrlResponse> uploadUrl(@Valid @RequestBody R2UploadUrlRequest request,
                                               AuthUser currentUser) {
        authorizationService.ensureProgramOwner(request.programId(), currentUser.id());
        return ApiResponse.success("R2 upload URL created successfully",
                r2StorageService.createUploadUrl(request.objectKey(), request.contentType()));
    }
}
