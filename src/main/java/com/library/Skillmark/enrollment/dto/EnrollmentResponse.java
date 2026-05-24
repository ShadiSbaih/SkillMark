package com.library.Skillmark.enrollment.dto;

import com.library.Skillmark.enrollment.entity.Enrollment;
import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Course enrollment returned by the API.")
public class EnrollmentResponse {
    @Schema(format = "uuid")
    private UUID courseId;

    @Schema(format = "uuid")
    private UUID studentId;

    @Schema(format = "date-time")
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
