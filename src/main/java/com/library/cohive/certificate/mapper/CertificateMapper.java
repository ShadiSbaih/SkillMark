package com.library.cohive.certificate.mapper;

import com.library.cohive.certificate.dto.CertificateResponse;
import com.library.cohive.certificate.entity.Certificate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CertificateMapper {
    @Mapping(source = "course.id", target = "courseId")
    @Mapping(source = "student.id", target = "studentId")
    CertificateResponse toResponse(Certificate certificate);
}
