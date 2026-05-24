package com.library.cohive.common.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(name = "PageResponse", description = "Standard paginated collection response.")
public class PageResponse<T> {
    @Schema(description = "Page items for the current slice.")
    private List<T> items;

    @Schema(description = "Zero-based page index.", example = "0")
    private int page;

    @Schema(description = "Requested page size.", example = "10")
    private int size;

    @Schema(description = "Total number of available records.", example = "42")
    private long totalElements;

    @Schema(description = "Total available page count.", example = "5")
    private int totalPages;

    public static <T> PageResponse<T> from(Page<T> page) {
        if (page == null) {
            return null;
        }
        return PageResponse.<T>builder()
                .items(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }
}
