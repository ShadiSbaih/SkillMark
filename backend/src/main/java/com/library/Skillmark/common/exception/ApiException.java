package com.library.Skillmark.common.exception;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {
    private final HttpStatus status;
    private final ErrorCode code;

    /**
     * Backward-compatible constructor that defaults the error code to
     * {@link ErrorCode#INTERNAL_ERROR}.
     */
    public ApiException(HttpStatus status, String message) {
        this(status, ErrorCode.INTERNAL_ERROR, message, null);
    }

    /**
     * Backward-compatible constructor that defaults the error code to
     * {@link ErrorCode#INTERNAL_ERROR}.
     */
    public ApiException(HttpStatus status, String message, Throwable cause) {
        this(status, ErrorCode.INTERNAL_ERROR, message, cause);
    }

    public ApiException(ErrorCode code, String message) {
        this(code.getDefaultStatus(), code, message, null);
    }

    public ApiException(ErrorCode code, String message, Throwable cause) {
        this(code.getDefaultStatus(), code, message, cause);
    }

    public ApiException(HttpStatus status, ErrorCode code, String message) {
        this(status, code, message, null);
    }

    public ApiException(HttpStatus status, ErrorCode code, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
        this.code = code;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public ErrorCode getCode() {
        return code;
    }
}
