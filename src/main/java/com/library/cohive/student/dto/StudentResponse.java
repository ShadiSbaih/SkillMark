package com.library.cohive.student.dto;

import com.library.cohive.student.entity.Student;
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
public class StudentResponse {
    private UUID id;
    private UUID userId;
    private String name;
    private String email;
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
