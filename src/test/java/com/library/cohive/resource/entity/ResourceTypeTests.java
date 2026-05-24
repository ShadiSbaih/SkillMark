package com.library.cohive.resource.entity;

import org.junit.jupiter.api.Test;

import java.net.URI;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ResourceTypeTests {

    @Test
    void documentTypeExposesExpectedMetadata() {
        assertEquals(ResourceCategory.LEARNING_CONTENT, ResourceType.DOCUMENT.getCategory());
        assertEquals("Document", ResourceType.DOCUMENT.getDisplayName());
        assertTrue(ResourceType.DOCUMENT.isPreviewable());
        assertTrue(ResourceType.DOCUMENT.isDownloadable());
        assertTrue(ResourceType.DOCUMENT.getAllowedSchemes().contains("https"));
    }

    @Test
    void resourceTypesOnlySupportAbsoluteHttpUris() {
        assertTrue(ResourceType.VIDEO.supports(URI.create("https://example.com/video")));
        assertTrue(ResourceType.REPOSITORY.supports(URI.create("http://example.com/repo")));
        assertFalse(ResourceType.LINK.supports(URI.create("/relative/path")));
        assertFalse(ResourceType.ARTICLE.supports(URI.create("mailto:trainer@example.com")));
    }
}
