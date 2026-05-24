package com.library.cohive.resource.entity;

import io.swagger.v3.oas.annotations.media.Schema;

import java.net.URI;
import java.util.Set;

/**
 * Enumerates the supported resource variants that can be attached to a course.
 *
 * <p>The current product scope only supports external URL-based resources, so every type
 * constrains the accepted URI scheme and exposes metadata that can be reused by validation,
 * persistence, and API documentation layers.</p>
 */
@Schema(description = "Supported URL-backed resource types for course learning materials.")
public enum ResourceType {

    /**
     * General-purpose external links such as landing pages or product documentation indexes.
     */
    LINK(
            ResourceCategory.EXTERNAL_REFERENCE,
            "External link",
            "General external reference for a course.",
            Set.of("http", "https"),
            true,
            false
    ),

    /**
     * Long-form written content such as tutorials, blog posts, or product guides.
     */
    ARTICLE(
            ResourceCategory.LEARNING_CONTENT,
            "Article",
            "Written instructional content published on a web page.",
            Set.of("http", "https"),
            true,
            false
    ),

    /**
     * Video-hosted learning materials such as recorded lectures or demonstrations.
     */
    VIDEO(
            ResourceCategory.LEARNING_CONTENT,
            "Video",
            "Video-based learning material hosted on an external platform.",
            Set.of("http", "https"),
            true,
            false
    ),

    /**
     * Downloadable documents such as PDFs, slide decks, or handbooks referenced by URL.
     */
    DOCUMENT(
            ResourceCategory.LEARNING_CONTENT,
            "Document",
            "Document-style material referenced through an external URL.",
            Set.of("http", "https"),
            true,
            true
    ),

    /**
     * Source code repositories that support hands-on exercises or reference implementations.
     */
    REPOSITORY(
            ResourceCategory.CODE_REFERENCE,
            "Repository",
            "External source repository used as a practical code reference.",
            Set.of("http", "https"),
            false,
            false
    );

    private final ResourceCategory category;
    private final String displayName;
    private final String description;
    private final Set<String> allowedSchemes;
    private final boolean previewable;
    private final boolean downloadable;

    ResourceType(
            ResourceCategory category,
            String displayName,
            String description,
            Set<String> allowedSchemes,
            boolean previewable,
            boolean downloadable
    ) {
        this.category = category;
        this.displayName = displayName;
        this.description = description;
        this.allowedSchemes = Set.copyOf(allowedSchemes);
        this.previewable = previewable;
        this.downloadable = downloadable;
    }

    public ResourceCategory getCategory() {
        return category;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public Set<String> getAllowedSchemes() {
        return allowedSchemes;
    }

    public boolean isPreviewable() {
        return previewable;
    }

    public boolean isDownloadable() {
        return downloadable;
    }

    /**
     * Returns whether the supplied URI satisfies the transport rules for this resource type.
     */
    public boolean supports(URI uri) {
        if (uri == null || !uri.isAbsolute() || uri.getScheme() == null) {
            return false;
        }
        return allowedSchemes.contains(uri.getScheme().toLowerCase());
    }

    /**
     * Returns a human-readable summary of the URI requirements for this type.
     */
    public String getValidationRule() {
        return "URL must be absolute and use one of: "
                + allowedSchemes.stream().sorted().collect(java.util.stream.Collectors.joining(", "));
    }
}
