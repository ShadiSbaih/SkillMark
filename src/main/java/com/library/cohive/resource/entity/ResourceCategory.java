package com.library.cohive.resource.entity;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * High-level classification for supported learning resources.
 */
@Schema(description = "Broad category used to group supported resource types.")
public enum ResourceCategory {
    EXTERNAL_REFERENCE,
    LEARNING_CONTENT,
    CODE_REFERENCE
}
