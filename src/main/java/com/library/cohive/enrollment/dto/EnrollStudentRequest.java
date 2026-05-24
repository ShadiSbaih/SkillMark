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
@Schema(name = "EnrollStudentRequest", description = "Creates a course enrollment linking one student to one course.")
public class EnrollStudentRequest {
    @NotNull
    @Schema(description = "Student identifier to enroll.", format = "uuid")
    private UUID studentId;

    @NotNull
    @Schema(description = "Course identifier that the student will join.", format = "uuid")
    private UUID courseId;
}
