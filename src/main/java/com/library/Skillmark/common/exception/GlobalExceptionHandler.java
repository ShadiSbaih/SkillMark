package com.library.Skillmark.common.exception;

import com.library.Skillmark.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ApiException.class)
    ResponseEntity<ApiResponse<Map<String, Object>>> handleApi(ApiException ex, HttpServletRequest request) {
        return ResponseEntity.status(ex.getStatus()).body(error(ex.getMessage(), List.of(), request));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Map<String, Object>>> handleValidation(MethodArgumentNotValidException ex,
                                                                       HttpServletRequest request) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .toList();
        return ResponseEntity.badRequest().body(error("Validation failed", errors, request));
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ApiResponse<Map<String, Object>>> handleAuthentication(AuthenticationException ex,
                                                                          HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error("Authentication required", List.of(), request));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiResponse<Map<String, Object>>> handleUnreadable(HttpMessageNotReadableException ex,
                                                                      HttpServletRequest request) {
        return ResponseEntity.badRequest().body(error("Invalid request body", List.of(ex.getMostSpecificCause().getMessage()), request));
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiResponse<Map<String, Object>>> handleAccessDenied(AccessDeniedException ex,
                                                                        HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error("Access denied", List.of(), request));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<Map<String, Object>>> handleUnexpected(Exception ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error("Internal server error", List.of(), request));
    }

    private ApiResponse<Map<String, Object>> error(String message, List<String> errors, HttpServletRequest request) {
        return new ApiResponse<>(false, message, Map.of(
                "timestamp", Instant.now().toString(),
                "path", request.getRequestURI()
        ), errors);
    }
}
