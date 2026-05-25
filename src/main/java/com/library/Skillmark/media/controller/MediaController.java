package com.library.Skillmark.media.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.media.dto.CloudinarySignatureRequest;
import com.library.Skillmark.media.dto.CloudinarySignatureResponse;
import com.library.Skillmark.media.service.CloudinaryMediaService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@Tag(name = "Media")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class MediaController {
    private final CloudinaryMediaService cloudinaryMediaService;

    public MediaController(CloudinaryMediaService cloudinaryMediaService) {
        this.cloudinaryMediaService = cloudinaryMediaService;
    }

    @PostMapping("/api/v1/media/cloudinary/signature")
    ApiResponse<CloudinarySignatureResponse> signature(@RequestBody(required = false) CloudinarySignatureRequest request) {
        return ApiResponse.success("Cloudinary signature created successfully",
                cloudinaryMediaService.signUpload(request == null ? null : request.params()));
    }
}
