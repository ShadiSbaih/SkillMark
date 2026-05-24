package com.library.cohive.enrollment.dto;

import com.library.cohive.enrollment.entity.Enrollment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnrollmentResponse {
    private UUID courseId;
    private UUID studentId;
    private Instant createdAt;

    public static EnrollmentResponse fromEntity(Enrollment enrollment) {
        if (enrollment == null) {
            return null;
        }
        return EnrollmentResponse.builder()
                .courseId(enrollment.getCourse().getId())
                .studentId(enrollment.getStudent().getId())
                .createdAt(enrollment.getCreatedAt())
                .build();
    }
}
