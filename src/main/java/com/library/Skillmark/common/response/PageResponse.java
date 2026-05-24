package com.library.Skillmark.common.response;

import org.springframework.data.domain.Page;

import java.util.List;

public record PageResponse<T>(
        List<T> items,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }

    public static <T> PageResponse<T> fromList(List<T> items, int page, int size) {
        int safeSize = Math.max(size, 1);
        int from = Math.min(Math.max(page, 0) * safeSize, items.size());
        int to = Math.min(from + safeSize, items.size());
        List<T> slice = items.subList(from, to);
        int totalPages = (int) Math.ceil((double) items.size() / safeSize);
        return new PageResponse<>(slice, Math.max(page, 0), safeSize, items.size(), totalPages);
    }
}
