package com.library.Skillmark.common.exception;

import com.library.Skillmark.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    ResponseEntity<ApiResponse<Void>> handleApi(ApiException ex, HttpServletRequest request) {
        return ResponseEntity.status(ex.getStatus())
                .body(ApiResponse.<Void>error(ex.getCode().name(), ex.getMessage(), List.of(), request.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException ex,
                                                       HttpServletRequest request) {
        List<ApiResponse.ErrorDetail> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> new ApiResponse.ErrorDetail(error.getField(), error.getDefaultMessage()))
                .toList();
        return ResponseEntity.badRequest()
                .body(ApiResponse.<Void>error(ErrorCode.VALIDATION_ERROR.name(), "Validation failed", errors,
                        request.getRequestURI()));
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<ApiResponse<Void>> handleAuthentication(AuthenticationException ex,
                                                           HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.<Void>error(ErrorCode.UNAUTHORIZED.name(), "Authentication required", List.of(),
                        request.getRequestURI()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiResponse<Void>> handleUnreadable(HttpMessageNotReadableException ex,
                                                       HttpServletRequest request) {
        List<ApiResponse.ErrorDetail> errors = List.of(
                new ApiResponse.ErrorDetail(null, ex.getMostSpecificCause().getMessage()));
        return ResponseEntity.badRequest()
                .body(ApiResponse.<Void>error(ErrorCode.BAD_REQUEST.name(), "Invalid request body", errors,
                        request.getRequestURI()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex,
                                                         HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.<Void>error(ErrorCode.ACCESS_DENIED.name(), "Access denied", List.of(),
                        request.getRequestURI()));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    ResponseEntity<ApiResponse<Void>> handleConstraintViolation(ConstraintViolationException ex,
                                                                HttpServletRequest request) {
        List<ApiResponse.ErrorDetail> errors = ex.getConstraintViolations().stream()
                .map(violation -> new ApiResponse.ErrorDetail(
                        violation.getPropertyPath().toString(), violation.getMessage()))
                .toList();
        return ResponseEntity.badRequest()
                .body(ApiResponse.<Void>error(ErrorCode.VALIDATION_ERROR.name(), "Validation failed", errors,
                        request.getRequestURI()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(DataIntegrityViolationException ex,
                                                                   HttpServletRequest request) {
        String message = "Resource conflict";
        Throwable root = ex.getRootCause();
        if (root != null && root.getMessage() != null) {
            String rootMessage = root.getMessage().toLowerCase();
            if (rootMessage.contains("unique") || rootMessage.contains("duplicate")) {
                message = "A resource with the same unique value already exists";
            }
        }
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.<Void>error(ErrorCode.CONFLICT.name(), message, List.of(),
                        request.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<Void>> handleUnexpected(Exception ex, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.<Void>error(ErrorCode.INTERNAL_ERROR.name(), "Internal server error", List.of(),
                        request.getRequestURI()));
    }
}
