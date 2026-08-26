package com.library.Skillmark.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        String code,
        String message,
        T data,
        Instant timestamp,
        List<?> errors,
        String path
) {
    public ApiResponse(boolean success, String message, T data) {
        this(success, null, message, data, Instant.now(), null, null);
    }

    public ApiResponse(boolean success, String message, T data, List<String> errors) {
        this(success, null, message, data, Instant.now(), errors, null);
    }

    public ApiResponse(boolean success, String message, T data, List<String> errors, String path) {
        this(success, null, message, data, Instant.now(), errors, path);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> failure(String message, List<String> errors) {
        return new ApiResponse<>(false, message, null, errors);
    }

    public static <T> ApiResponse<T> failure(String message, List<String> errors, String path) {
        return new ApiResponse<>(false, message, null, errors, path);
    }

    public static <T> ApiResponse<T> error(String code, String message, List<ErrorDetail> errors, String path) {
        return new ApiResponse<T>(false, code, message, null, Instant.now(), errors, path);
    }

    public record ErrorDetail(String field, String message) {
    }
}
