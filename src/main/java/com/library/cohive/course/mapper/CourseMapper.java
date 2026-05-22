package com.library.cohive.course.mapper;

import com.library.cohive.course.dto.CourseResponse;
import com.library.cohive.course.entity.Course;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CourseMapper {
    @Mapping(source = "organization.id", target = "organizationId")
    CourseResponse toResponse(Course course);
}
