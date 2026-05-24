package com.library.Skillmark.student.dto;

import com.library.Skillmark.student.entity.Student;
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
@Schema(description = "Student profile returned by the API.")
public class StudentResponse {
    @Schema(format = "uuid")
    private UUID id;

    @Schema(format = "uuid")
    private UUID userId;

    @Schema(example = "Jane Doe")
    private String name;

    @Schema(example = "jane@example.com")
    private String email;

    @Schema(format = "date-time")
    private Instant createdAt;

    public static StudentResponse fromEntity(Student student) {
        if (student == null) {
            return null;
        }
        return StudentResponse.builder()
                .id(student.getId())
                .userId(student.getUser().getId())
                .name(student.getUser().getName())
                .email(student.getUser().getEmail())
                .createdAt(student.getCreatedAt())
                .build();
    }
}
