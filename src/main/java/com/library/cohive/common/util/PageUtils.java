package com.library.cohive.common.util;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

public final class PageUtils {

    private PageUtils() {
    }

    public static <T> Page<T> page(List<T> items, Pageable pageable) {
        if (items.isEmpty()) {
            return Page.empty(pageable);
        }

        int start = Math.min((int) pageable.getOffset(), items.size());
        int end = Math.min(start + pageable.getPageSize(), items.size());
        return new PageImpl<>(items.subList(start, end), pageable, items.size());
    }
}
