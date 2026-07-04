package com.library.Skillmark.membership.controller;

import com.library.Skillmark.membership.controller.*;
import com.library.Skillmark.membership.dto.*;
import com.library.Skillmark.membership.entity.*;
import com.library.Skillmark.membership.enums.*;
import com.library.Skillmark.membership.repository.*;
import com.library.Skillmark.membership.service.*;
import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.security.AuthUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations/{organizationId}/members")
@Tag(name = "Memberships")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class MembershipController {
    private final MembershipService membershipService;

    public MembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @PostMapping
    @Operation(summary = "Add organization member", description = "Adds an existing user as a PARTICIPANT. Requires OWNER membership in the organization.")
    ResponseEntity<ApiResponse<MembershipResponse>> add(@PathVariable UUID organizationId,
                                                        @Valid @RequestBody AddMemberRequest request,
                                                        AuthUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Member added successfully",
                membershipService.add(organizationId, request, currentUser.id())));
    }

    @GetMapping
    @Operation(summary = "List organization members", description = "Lists organization memberships. Requires OWNER membership in the organization.")
    ApiResponse<PageResponse<MembershipResponse>> list(@PathVariable UUID organizationId,
                                                       AuthUser currentUser,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Members retrieved successfully",
                membershipService.list(organizationId, currentUser.id(), page, size));
    }

    @DeleteMapping("/{userId}")
    @Operation(summary = "Remove organization member", description = "Marks a participant membership as REMOVED while preserving historical attempts and certificates.")
    ApiResponse<Void> remove(@PathVariable UUID organizationId,
                             @PathVariable UUID userId,
                             AuthUser currentUser) {
        membershipService.remove(organizationId, userId, currentUser.id());
        return ApiResponse.success("Member removed successfully", null);
    }
}
