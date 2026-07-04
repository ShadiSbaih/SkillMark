package com.library.Skillmark.program.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.program.dto.CreateProgramRequest;
import com.library.Skillmark.program.dto.ProgramResponse;
import com.library.Skillmark.program.dto.UpdateProgramRequest;
import com.library.Skillmark.program.dto.UpdateProgramStatusRequest;
import com.library.Skillmark.program.service.ProgramService;
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
@Tag(name = "Programs")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class ProgramController {
    private final ProgramService programService;

    public ProgramController(ProgramService programService) {
        this.programService = programService;
    }

    @PostMapping("/organizations/{organizationId}/programs")
    ResponseEntity<ApiResponse<ProgramResponse>> create(@PathVariable UUID organizationId,
                                                        @Valid @RequestBody CreateProgramRequest request,
                                                        AuthUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Program created successfully",
                programService.create(organizationId, request, currentUser.id())));
    }

    @GetMapping("/organizations/{organizationId}/programs")
    ApiResponse<PageResponse<ProgramResponse>> list(@PathVariable UUID organizationId,
                                                    AuthUser currentUser,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Programs retrieved successfully",
                programService.list(organizationId, currentUser.id(), page, size));
    }

    @GetMapping("/programs/{programId}")
    ApiResponse<ProgramResponse> get(@PathVariable UUID programId, AuthUser currentUser) {
        return ApiResponse.success("Program retrieved successfully",
                programService.get(programId, currentUser.id()));
    }

    @PutMapping("/programs/{programId}")
    ApiResponse<ProgramResponse> update(@PathVariable UUID programId,
                                        @Valid @RequestBody UpdateProgramRequest request,
                                        AuthUser currentUser) {
        return ApiResponse.success("Program updated successfully",
                programService.update(programId, request, currentUser.id()));
    }

    @PatchMapping("/programs/{programId}/status")
    @io.swagger.v3.oas.annotations.Operation(summary = "Update program status", description = "Updates program status. Status is the source of truth; isPublished is derived from status == PUBLISHED.")
    ApiResponse<ProgramResponse> updateStatus(@PathVariable UUID programId,
                                              @Valid @RequestBody UpdateProgramStatusRequest request,
                                              AuthUser currentUser) {
        return ApiResponse.success("Program status updated successfully",
                programService.updateStatus(programId, request.status(), currentUser.id()));
    }

    @DeleteMapping("/programs/{programId}")
    ApiResponse<Void> delete(@PathVariable UUID programId, AuthUser currentUser) {
        programService.delete(programId, currentUser.id());
        return ApiResponse.success("Program deleted successfully", null);
    }
}
