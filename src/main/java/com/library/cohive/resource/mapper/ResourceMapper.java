package com.library.cohive.resource.mapper;

import com.library.cohive.resource.dto.ResourceResponse;
import com.library.cohive.resource.entity.Resource;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ResourceMapper {
    @Mapping(source = "course.id", target = "courseId")
    ResourceResponse toResponse(Resource resource);
}
