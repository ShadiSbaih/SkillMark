package com.library.Skillmark.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Machine-readable error codes used across the API.
 *
 * Each code has a default HTTP status that is used when an {@link ApiException}
 * is constructed without an explicit status. The serialized {@code code} value
 * is the stable enum name.
 */
public enum ErrorCode {
    BAD_REQUEST(HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED),
    ACCESS_DENIED(HttpStatus.FORBIDDEN),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND),
    CONFLICT(HttpStatus.CONFLICT),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST),
    BUSINESS_RULE_VIOLATION(HttpStatus.UNPROCESSABLE_ENTITY),
    INTERNAL_ERROR(HttpStatus.INTERNAL_SERVER_ERROR);

    private final HttpStatus defaultStatus;

    ErrorCode(HttpStatus defaultStatus) {
        this.defaultStatus = defaultStatus;
    }

    public HttpStatus getDefaultStatus() {
        return defaultStatus;
    }
}
