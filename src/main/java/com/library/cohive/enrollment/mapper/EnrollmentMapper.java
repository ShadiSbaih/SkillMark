package com.library.cohive.enrollment.mapper;

import com.library.cohive.enrollment.dto.EnrollmentResponse;
import com.library.cohive.enrollment.entity.Enrollment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EnrollmentMapper {
    @Mapping(source = "course.id", target = "courseId")
    @Mapping(source = "student.id", target = "studentId")
    EnrollmentResponse toResponse(Enrollment enrollment);
}
