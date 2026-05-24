package com.library.cohive.organization.controller;

import com.library.cohive.common.response.ApiResponse;
import com.library.cohive.common.response.PageResponse;
import com.library.cohive.organization.dto.AddOrganizationStudentRequest;
import com.library.cohive.organization.dto.CreateOrganizationRequest;
import com.library.cohive.organization.dto.OrganizationResponse;
import com.library.cohive.organization.service.OrganizationService;
import com.library.cohive.student.dto.StudentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
public class OrganizationController {
    private final OrganizationService organizationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrganizationResponse> createOrganization(@Valid @RequestBody CreateOrganizationRequest request) {
        return ApiResponse.success("Organization created successfully", organizationService.createOrganization(request));
    }

    @GetMapping
    public ApiResponse<PageResponse<OrganizationResponse>> getOrganizations(@PageableDefault(size = 10) Pageable pageable) {
        Page<OrganizationResponse> page = organizationService.getOrganizations(pageable);
        return ApiResponse.success(PageResponse.from(page));
    }

    @GetMapping("/{id}")
    public ApiResponse<OrganizationResponse> getOrganization(@PathVariable("id") UUID organizationId) {
        return ApiResponse.success(organizationService.getOrganization(organizationId));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteOrganization(@PathVariable("id") UUID organizationId) {
        organizationService.deleteOrganization(organizationId);
        return ApiResponse.success("Organization deleted successfully", null);
    }

    @PostMapping("/{id}/students")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> addStudent(@PathVariable("id") UUID organizationId,
                                        @Valid @RequestBody AddOrganizationStudentRequest request) {
        organizationService.addStudent(organizationId, request);
        return ApiResponse.success("Student added to organization", null);
    }

    @GetMapping("/{id}/students")
    public ApiResponse<PageResponse<StudentResponse>> getOrganizationStudents(
            @PathVariable("id") UUID organizationId,
            @PageableDefault(size = 10) Pageable pageable) {
        Page<StudentResponse> page = organizationService.getOrganizationStudents(organizationId, pageable);
        return ApiResponse.success(PageResponse.from(page));
    }
}
