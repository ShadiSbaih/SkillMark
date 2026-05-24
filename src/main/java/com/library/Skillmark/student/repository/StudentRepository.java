package com.library.Skillmark.student.repository;

import com.library.Skillmark.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByUser_Id(UUID userId);
}
