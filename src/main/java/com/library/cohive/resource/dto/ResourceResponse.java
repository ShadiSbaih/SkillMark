package com.library.cohive.resource.dto;

import com.library.cohive.resource.entity.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {
    private UUID id;
    private String title;
    private ResourceType type;
    private String url;
    private UUID courseId;
    private Instant createdAt;
}
