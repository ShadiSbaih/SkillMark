package com.library.cohive.user.entity;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Application role used for authorization and tenant-scoped access control.")
public enum Role {
    OWNER,
    STUDENT
}
