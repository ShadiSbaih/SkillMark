package com.library.Skillmark.enrollment.dto;

import com.library.Skillmark.enrollment.entity.ProgramEnrollment;
import com.library.Skillmark.enrollment.enums.EnrollmentStatus;

import java.time.Instant;
import java.util.UUID;

public record EnrollmentResponse(
        UUID id,
        UUID programId,
        String programTitle,
        UUID userId,
        String userName,
        EnrollmentStatus status,
        Instant enrolledAt
) {
    public static EnrollmentResponse from(ProgramEnrollment enrollment) {
        return new EnrollmentResponse(
                enrollment.getId(),
                enrollment.getProgram().getId(),
                enrollment.getProgram().getTitle(),
                enrollment.getUser().getId(),
                enrollment.getUser().getName(),
                enrollment.getStatus(),
                enrollment.getEnrolledAt()
        );
    }
}
