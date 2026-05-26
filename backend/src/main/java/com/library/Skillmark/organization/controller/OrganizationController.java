package com.library.Skillmark.organization.controller;

import com.library.Skillmark.organization.controller.*;
import com.library.Skillmark.organization.dto.*;
import com.library.Skillmark.organization.entity.*;
import com.library.Skillmark.organization.enums.*;
import com.library.Skillmark.organization.repository.*;
import com.library.Skillmark.organization.service.*;
import com.library.Skillmark.audit.dto.AuditLogResponse;
import com.library.Skillmark.audit.service.AuditLogService;
import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.security.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
@Tag(name = "Organizations")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class OrganizationController {
    private final OrganizationService organizationService;
    private final AuditLogService auditLogService;

    public OrganizationController(OrganizationService organizationService, AuditLogService auditLogService) {
        this.organizationService = organizationService;
        this.auditLogService = auditLogService;
    }

    @PostMapping
    @Operation(summary = "Create organization", description = "Creates an organization and automatically creates an ACTIVE OWNER membership for the current user.")
    ResponseEntity<ApiResponse<OrganizationResponse>> create(@Valid @RequestBody CreateOrganizationRequest request,
                                                             Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(
                "Organization created successfully", organizationService.create(request, SecurityUtil.userId(authentication))));
    }

    @GetMapping
    @Operation(summary = "List accessible organizations", description = "Returns organizations where the current user has an ACTIVE membership.")
    ApiResponse<PageResponse<OrganizationResponse>> list(Authentication authentication,
                                                         @RequestParam(defaultValue = "0") int page,
                                                         @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Organizations retrieved successfully",
                organizationService.list(SecurityUtil.userId(authentication), page, size));
    }

    @GetMapping("/{organizationId}")
    @Operation(summary = "Get organization", description = "Returns organization details for an owner or active member.")
    ApiResponse<OrganizationResponse> get(@PathVariable UUID organizationId, Authentication authentication) {
        return ApiResponse.success("Organization retrieved successfully",
                organizationService.get(organizationId, SecurityUtil.userId(authentication)));
    }

    @PutMapping("/{organizationId}")
    @Operation(summary = "Update organization", description = "Updates organization details. Requires OWNER membership in the organization.")
    ApiResponse<OrganizationResponse> update(@PathVariable UUID organizationId,
                                             @Valid @RequestBody UpdateOrganizationRequest request,
                                             Authentication authentication) {
        return ApiResponse.success("Organization updated successfully",
                organizationService.update(organizationId, request, SecurityUtil.userId(authentication)));
    }

    @DeleteMapping("/{organizationId}")
    @Operation(summary = "Delete organization", description = "Soft deletes an organization. Requires OWNER membership in the organization.")
    ApiResponse<Void> delete(@PathVariable UUID organizationId, Authentication authentication) {
        organizationService.delete(organizationId, SecurityUtil.userId(authentication));
        return ApiResponse.success("Organization deleted successfully", null);
    }

    @GetMapping("/{organizationId}/audit-logs")
    @Operation(summary = "List organization audit logs", description = "Returns audit logs for an owned organization.")
    ApiResponse<PageResponse<AuditLogResponse>> auditLogs(@PathVariable UUID organizationId,
                                                          Authentication authentication,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Audit logs retrieved successfully",
                auditLogService.listForOrganization(organizationId, SecurityUtil.userId(authentication), page, size));
    }
}
