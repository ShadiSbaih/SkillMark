package com.library.Skillmark.user.controller;

import com.library.Skillmark.user.controller.*;
import com.library.Skillmark.user.dto.*;
import com.library.Skillmark.user.entity.*;
import com.library.Skillmark.user.enums.*;
import com.library.Skillmark.user.repository.*;
import com.library.Skillmark.user.service.*;
import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.security.AuthUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the current authenticated user's safe profile without password or token hashes.")
    ApiResponse<UserResponse> me(AuthUser currentUser) {
        return ApiResponse.success("User profile retrieved successfully", userService.me(currentUser.id()));
    }

    @PatchMapping("/me")
    @Operation(summary = "Update current user", description = "Updates the current user's local profile fields.")
    ApiResponse<UserResponse> updateMe(@Valid @RequestBody UpdateUserProfileRequest request, AuthUser currentUser) {
        return ApiResponse.success("User profile updated successfully",
                userService.update(currentUser.id(), request));
    }
}
