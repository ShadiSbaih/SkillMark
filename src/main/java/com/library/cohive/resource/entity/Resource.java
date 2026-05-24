package com.library.cohive.resource.entity;

import com.library.cohive.common.entity.AuditableEntity;
import com.library.cohive.course.entity.Course;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.net.URI;

/**
 * Persistence model for course resources.
 *
 * <p>Resources are intentionally modeled as URL-backed course attachments because file uploads
 * and storage are outside the current documented backend scope.</p>
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "resources")
@com.library.cohive.resource.validation.ValidResourceUrl
public class Resource extends AuditableEntity {

    /**
     * Human-readable title shown to course participants.
     */
    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String title;

    /**
     * Supported resource classification used for validation and API contracts.
     */
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    /**
     * Absolute external URI for the resource payload.
     */
    @NotNull
    @Convert(converter = UriAttributeConverter.class)
    @Column(nullable = false, length = 2000)
    private URI url;

    /**
     * Owning course relationship.
     */
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;
}
