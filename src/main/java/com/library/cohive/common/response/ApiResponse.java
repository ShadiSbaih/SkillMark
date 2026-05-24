package com.library.cohive.common.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(name = "ApiResponse", description = "Standard response envelope used by all Cohive REST endpoints.")
public class ApiResponse<T> {
    @Schema(description = "Indicates whether the operation completed successfully.", example = "true")
    private boolean success;

    @Schema(description = "Human-readable outcome message.", example = "Operation successful")
    private String message;

    @Schema(description = "Response payload for successful operations. The concrete schema varies by endpoint.")
    private T data;

    @Schema(description = "Validation or business errors when the operation fails.")
    private List<String> errors;

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(T data) {
        return success("Operation successful", data);
    }

    public static <T> ApiResponse<T> failure(String message, List<String> errors) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errors(errors)
                .build();
    }
}
