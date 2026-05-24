package com.library.cohive.auth.controller;

import com.library.cohive.auth.dto.AuthResponse;
import com.library.cohive.auth.dto.LoginRequest;
import com.library.cohive.auth.dto.RegisterRequest;
import com.library.cohive.auth.service.AuthService;
import com.library.cohive.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, authenticate, and manage access tokens.")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a user", description = "Creates a new account and returns a JWT token for immediate authenticated access.")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("User registered successfully", authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Login", description = "Authenticates an existing user and returns a JWT bearer token.")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success("Login successful", authService.login(request));
    }

    @PostMapping("/logout")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Logout", description = "Returns a successful response for clients that clear JWT tokens on logout.")
    public ApiResponse<Void> logout() {
        return ApiResponse.success("Logout successful", null);
    }
}
