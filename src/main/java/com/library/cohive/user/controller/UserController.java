package com.library.cohive.user.controller;

import com.library.cohive.common.response.ApiResponse;
import com.library.cohive.user.dto.UserResponse;
import com.library.cohive.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "Retrieve authenticated user profile details.")
@SecurityRequirement(name = "bearerAuth")
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user", description = "Returns the profile of the currently authenticated user.")
    public ApiResponse<UserResponse> getCurrentUser() {
        return ApiResponse.success(userService.getCurrentUser());
    }
}
