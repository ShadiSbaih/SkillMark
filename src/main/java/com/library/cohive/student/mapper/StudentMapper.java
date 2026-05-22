package com.library.cohive.student.mapper;

import com.library.cohive.student.dto.StudentResponse;
import com.library.cohive.student.entity.Student;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StudentMapper {
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.name", target = "name")
    @Mapping(source = "user.email", target = "email")
    StudentResponse toResponse(Student student);
}
