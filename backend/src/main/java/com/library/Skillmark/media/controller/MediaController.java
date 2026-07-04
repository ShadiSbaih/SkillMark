package com.library.Skillmark.media.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.media.dto.CloudinarySignatureRequest;
import com.library.Skillmark.media.dto.CloudinarySignatureResponse;
import com.library.Skillmark.media.service.CloudinaryMediaService;
import com.library.Skillmark.security.AuthUser;
import com.library.Skillmark.security.service.AuthorizationService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Media")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class MediaController {
    private final CloudinaryMediaService cloudinaryMediaService;
    private final AuthorizationService authorizationService;

    public MediaController(CloudinaryMediaService cloudinaryMediaService, AuthorizationService authorizationService) {
        this.cloudinaryMediaService = cloudinaryMediaService;
        this.authorizationService = authorizationService;
    }

    @PostMapping("/media/signatures")
    ApiResponse<CloudinarySignatureResponse> signature(@RequestBody CloudinarySignatureRequest request,
                                                       AuthUser currentUser) {
        if (request.organizationId() != null && request.programId() != null) {
            throw new com.library.Skillmark.common.exception.BadRequestException("Provide either organizationId or programId, not both");
        }
        if (request.programId() != null) {
            authorizationService.ensureProgramOwner(request.programId(), currentUser.id());
        } else if (request.organizationId() != null) {
            authorizationService.ensureOrganizationOwner(request.organizationId(), currentUser.id());
        } else {
            throw new com.library.Skillmark.common.exception.BadRequestException("organizationId or programId is required");
        }
        return ApiResponse.success("Cloudinary signature created successfully",
                cloudinaryMediaService.signUpload(request.params()));
    }
}
