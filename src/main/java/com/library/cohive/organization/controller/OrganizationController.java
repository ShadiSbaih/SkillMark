package com.library.cohive.organization.controller;

import com.library.cohive.common.response.ApiResponse;
import com.library.cohive.common.response.PageResponse;
import com.library.cohive.organization.dto.AddOrganizationStudentRequest;
import com.library.cohive.organization.dto.CreateOrganizationRequest;
import com.library.cohive.organization.dto.OrganizationResponse;
import com.library.cohive.organization.service.OrganizationService;
import com.library.cohive.student.dto.StudentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
@Tag(name = "Organizations", description = "Manage organizations and organization student memberships.")
@SecurityRequirement(name = "bearerAuth")
public class OrganizationController {
    private final OrganizationService organizationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create an organization", description = "Creates a new organization owned by the authenticated user.")
    public ApiResponse<OrganizationResponse> createOrganization(@Valid @RequestBody CreateOrganizationRequest request) {
        return ApiResponse.success("Organization created successfully", organizationService.createOrganization(request));
    }

    @GetMapping
    @Operation(summary = "List organizations", description = "Returns organizations visible to the authenticated user.")
    public ApiResponse<PageResponse<OrganizationResponse>> getOrganizations(
            @ParameterObject @PageableDefault(size = 10) Pageable pageable) {
        Page<OrganizationResponse> page = organizationService.getOrganizations(pageable);
        return ApiResponse.success(PageResponse.from(page));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get organization details", description = "Returns one organization when the authenticated user has access.")
    public ApiResponse<OrganizationResponse> getOrganization(@PathVariable("id") UUID organizationId) {
        return ApiResponse.success(organizationService.getOrganization(organizationId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an organization", description = "Deletes an organization owned by the authenticated owner.")
    public ApiResponse<Void> deleteOrganization(@PathVariable("id") UUID organizationId) {
        organizationService.deleteOrganization(organizationId);
        return ApiResponse.success("Organization deleted successfully", null);
    }

    @PostMapping("/{id}/students")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add student to organization", description = "Adds an existing student profile to an owned organization.")
    public ApiResponse<Void> addStudent(@PathVariable("id") UUID organizationId,
                                        @Valid @RequestBody AddOrganizationStudentRequest request) {
        organizationService.addStudent(organizationId, request);
        return ApiResponse.success("Student added to organization", null);
    }

    @GetMapping("/{id}/students")
    @Operation(summary = "List organization students", description = "Returns students belonging to an owned organization.")
    public ApiResponse<PageResponse<StudentResponse>> getOrganizationStudents(
            @PathVariable("id") UUID organizationId,
            @ParameterObject @PageableDefault(size = 10) Pageable pageable) {
        Page<StudentResponse> page = organizationService.getOrganizationStudents(organizationId, pageable);
        return ApiResponse.success(PageResponse.from(page));
    }
}
