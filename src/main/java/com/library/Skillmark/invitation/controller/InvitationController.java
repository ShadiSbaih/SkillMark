package com.library.Skillmark.invitation.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.invitation.dto.CreateInvitationRequest;
import com.library.Skillmark.invitation.dto.InvitationResponse;
import com.library.Skillmark.invitation.service.InvitationService;
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
@Tag(name = "Invitations")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class InvitationController {
    private final InvitationService invitationService;

    public InvitationController(InvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @PostMapping("/api/v1/programs/{programId}/invitations")
    ResponseEntity<ApiResponse<InvitationResponse>> create(@PathVariable UUID programId,
                                                           @Valid @RequestBody CreateInvitationRequest request,
                                                           Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Invitation created successfully",
                invitationService.create(programId, request, SecurityUtil.userId(authentication))));
    }

    @GetMapping("/api/v1/programs/{programId}/invitations")
    ApiResponse<PageResponse<InvitationResponse>> list(@PathVariable UUID programId,
                                                       Authentication authentication,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Invitations retrieved successfully",
                invitationService.list(programId, SecurityUtil.userId(authentication), page, size));
    }

    @PostMapping("/api/v1/invitations/{code}/join")
    ApiResponse<InvitationResponse> join(@PathVariable String code, Authentication authentication) {
        return ApiResponse.success("Invitation joined successfully",
                invitationService.join(code, SecurityUtil.userId(authentication)));
    }

    @PostMapping("/api/v1/invitations/{invitationId}/disable")
    ApiResponse<InvitationResponse> disable(@PathVariable UUID invitationId, Authentication authentication) {
        return ApiResponse.success("Invitation disabled successfully",
                invitationService.disable(invitationId, SecurityUtil.userId(authentication)));
    }
}
