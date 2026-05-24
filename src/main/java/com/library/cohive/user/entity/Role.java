package com.library.cohive.user.entity;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "User role used for authorization.")
public enum Role {
    OWNER,
    STUDENT
}
