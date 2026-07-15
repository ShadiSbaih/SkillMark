package com.library.Skillmark.invitation.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.invitation.dto.CreateInvitationRequest;
import com.library.Skillmark.invitation.dto.InvitationPreviewResponse;
import com.library.Skillmark.invitation.dto.InvitationResponse;
import com.library.Skillmark.invitation.dto.UpdateInvitationStatusRequest;
import com.library.Skillmark.invitation.service.InvitationService;
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
@Tag(name = "Invitations")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class InvitationController {
    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @PostMapping("/programs/{programId}/invitations")
    ResponseEntity<ApiResponse<InvitationResponse>> create(@PathVariable UUID programId,
                                                           @Valid @RequestBody CreateInvitationRequest request,
                                                           AuthUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Invitation created successfully",
                invitationService.create(programId, request, currentUser.id())));
    }

    @GetMapping("/programs/{programId}/invitations")
    ApiResponse<PageResponse<InvitationResponse>> list(@PathVariable UUID programId,
                                                       AuthUser currentUser,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Invitations retrieved successfully",
                invitationService.list(programId, currentUser.id(), page, size));
    }

    @GetMapping("/public/invitations/{code}/preview")
    @io.swagger.v3.oas.annotations.Operation(summary = "Preview invitation", description = "Public, unauthenticated preview of an invitation used to render the join page before sign-in.")
    ApiResponse<InvitationPreviewResponse> preview(@PathVariable String code) {
        return ApiResponse.success("Invitation preview retrieved successfully",
                invitationService.preview(code));
    }

    @PostMapping("/invitations/{code}/join")
    @io.swagger.v3.oas.annotations.Operation(summary = "Join by invitation", description = "Joins a program using an invitation code.")
    ApiResponse<InvitationResponse> join(@PathVariable String code, AuthUser currentUser) {
        return ApiResponse.success("Invitation joined successfully",
                invitationService.join(code, currentUser.id()));
    }

    @PatchMapping("/invitations/{invitationId}/status")
    ApiResponse<InvitationResponse> updateStatus(@PathVariable UUID invitationId,
                                                 @Valid @RequestBody UpdateInvitationStatusRequest request,
                                                 AuthUser currentUser) {
        return ApiResponse.success("Invitation status updated successfully",
                invitationService.updateStatus(invitationId, request.status(), currentUser.id()));
    }
}
