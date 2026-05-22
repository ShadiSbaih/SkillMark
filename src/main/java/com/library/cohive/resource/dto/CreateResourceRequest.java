package com.library.cohive.resource.dto;

import com.library.cohive.resource.entity.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateResourceRequest {
    @NotBlank
    private String title;

    @NotNull
    private ResourceType type;

    @NotBlank
    private String url;

    @NotNull
    private UUID courseId;
}
