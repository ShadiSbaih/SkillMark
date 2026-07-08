package com.library.Skillmark.auth.controller;

import com.library.Skillmark.auth.dto.*;
import com.library.Skillmark.auth.service.AuthService;
import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.security.AuthUser;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final long cookieMaxAgeSeconds;
    private final String baseUrl;

    public AuthController(AuthService authService,
                          @Value("${jwt.expiration:86400000}") long jwtExpirationMillis,
                          @Value("${app.base-url:}") String baseUrl) {
        this.authService = authService;
        this.cookieMaxAgeSeconds = jwtExpirationMillis / 1000;
        this.baseUrl = baseUrl;
    }

    @PostMapping("/register")
    ApiResponse<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ApiResponse.success("Check your email to verify your account.", null);
    }

    @PostMapping("/login")
    ApiResponse<Void> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        String token = authService.login(request);
        addJwtCookie(response, token);
        return ApiResponse.success("Logged in successfully", null);
    }

    @PostMapping("/verify-email")
    ApiResponse<Void> verifyEmail(@Valid @RequestBody VerifyEmailRequest request, HttpServletResponse response) {
        String token = authService.verifyEmail(request);
        addJwtCookie(response, token);
        return ApiResponse.success("Email verified successfully", null);
    }

    @PostMapping("/resend-verification")
    ApiResponse<Void> resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        authService.resendVerification(request);
        return ApiResponse.success("Verification email sent", null);
    }

    @PostMapping("/forgot-password")
    ApiResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.success("If an account exists, a reset email has been sent", null);
    }

    @PostMapping("/reset-password")
    ApiResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.success("Password reset successfully", null);
    }

    @PostMapping("/logout")
    ApiResponse<Void> logout(HttpServletResponse response) {
        clearJwtCookie(response);
        return ApiResponse.success("Logged out successfully", null);
    }

    @GetMapping("/me")
    ApiResponse<AuthUserResponse> me(AuthUser currentUser) {
        return ApiResponse.success("User retrieved successfully", authService.me(currentUser));
    }

    private void addJwtCookie(HttpServletResponse response, String token) {
        ResponseCookie cookie = ResponseCookie.from("access_token", token)
                .httpOnly(true)
                .secure(isSecureBaseUrl())
                .sameSite("Lax")
                .path("/")
                .maxAge(cookieMaxAgeSeconds)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private void clearJwtCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("access_token", "")
                .httpOnly(true)
                .secure(isSecureBaseUrl())
                .sameSite("Lax")
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    private boolean isSecureBaseUrl() {
        return baseUrl != null && (baseUrl.startsWith("https://") || baseUrl.startsWith("http://localhost") || baseUrl.startsWith("http://127.0.0.1"));
    }
}
