package com.library.Skillmark.program.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.program.dto.CreateProgramRequest;
import com.library.Skillmark.program.dto.ProgramResponse;
import com.library.Skillmark.program.dto.UpdateProgramRequest;
import com.library.Skillmark.program.dto.UpdateProgramStatusRequest;
import com.library.Skillmark.program.service.ProgramService;
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
@Tag(name = "Programs")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class ProgramController {
    private final ProgramService programService;

    public ProgramController(ProgramService programService) {
        this.programService = programService;
    }

    @PostMapping("/api/v1/organizations/{organizationId}/programs")
    ResponseEntity<ApiResponse<ProgramResponse>> create(@PathVariable UUID organizationId,
                                                        @Valid @RequestBody CreateProgramRequest request,
                                                        Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Program created successfully",
                programService.create(organizationId, request, SecurityUtil.userId(authentication))));
    }

    @GetMapping("/api/v1/organizations/{organizationId}/programs")
    ApiResponse<PageResponse<ProgramResponse>> list(@PathVariable UUID organizationId,
                                                    Authentication authentication,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Programs retrieved successfully",
                programService.list(organizationId, SecurityUtil.userId(authentication), page, size));
    }

    @GetMapping("/api/v1/programs/{programId}")
    ApiResponse<ProgramResponse> get(@PathVariable UUID programId, Authentication authentication) {
        return ApiResponse.success("Program retrieved successfully",
                programService.get(programId, SecurityUtil.userId(authentication)));
    }

    @PutMapping("/api/v1/programs/{programId}")
    ApiResponse<ProgramResponse> update(@PathVariable UUID programId,
                                        @Valid @RequestBody UpdateProgramRequest request,
                                        Authentication authentication) {
        return ApiResponse.success("Program updated successfully",
                programService.update(programId, request, SecurityUtil.userId(authentication)));
    }

    @PostMapping("/api/v1/programs/{programId}/publish")
    ApiResponse<ProgramResponse> publish(@PathVariable UUID programId, Authentication authentication) {
        return ApiResponse.success("Program published successfully",
                programService.updateStatus(programId, com.library.Skillmark.program.enums.ProgramStatus.PUBLISHED,
                        SecurityUtil.userId(authentication)));
    }

    @PostMapping("/api/v1/programs/{programId}/archive")
    ApiResponse<ProgramResponse> archive(@PathVariable UUID programId, Authentication authentication) {
        return ApiResponse.success("Program archived successfully",
                programService.updateStatus(programId, com.library.Skillmark.program.enums.ProgramStatus.ARCHIVED,
                        SecurityUtil.userId(authentication)));
    }

    @PatchMapping("/api/v1/programs/{programId}/status")
    @io.swagger.v3.oas.annotations.Operation(summary = "Update program status", description = "Updates program status. Status is the source of truth; isPublished is derived from status == PUBLISHED.")
    ApiResponse<ProgramResponse> updateStatus(@PathVariable UUID programId,
                                              @Valid @RequestBody UpdateProgramStatusRequest request,
                                              Authentication authentication) {
        return ApiResponse.success("Program status updated successfully",
                programService.updateStatus(programId, request.status(), SecurityUtil.userId(authentication)));
    }

    @DeleteMapping("/api/v1/programs/{programId}")
    ApiResponse<Void> delete(@PathVariable UUID programId, Authentication authentication) {
        programService.delete(programId, SecurityUtil.userId(authentication));
        return ApiResponse.success("Program deleted successfully", null);
    }
}
