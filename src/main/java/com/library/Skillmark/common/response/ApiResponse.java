package com.library.Skillmark.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        Instant timestamp,
        List<String> errors,
        String path
) {
    public ApiResponse(boolean success, String message, T data) {
        this(success, message, data, Instant.now(), null, null);
    }

    public ApiResponse(boolean success, String message, T data, List<String> errors) {
        this(success, message, data, Instant.now(), errors, null);
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, Instant.now(), null, null);
    }

    public static <T> ApiResponse<T> failure(String message, List<String> errors) {
        return new ApiResponse<>(false, message, null, Instant.now(), errors, null);
    }

    public static <T> ApiResponse<T> failure(String message, List<String> errors, String path) {
        return new ApiResponse<>(false, message, null, Instant.now(), errors, path);
    }
}
