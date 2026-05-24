package com.library.cohive.enrollment.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request body for enrolling a student in a course.")
public class EnrollStudentRequest {
    @NotNull
    @Schema(description = "Student to enroll.", format = "uuid")
    private UUID studentId;

    @NotNull
    @Schema(description = "Course to enroll the student in.", format = "uuid")
    private UUID courseId;
}
