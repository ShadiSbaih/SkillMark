package com.library.Skillmark.enrollment.repository;

import com.library.Skillmark.enrollment.entity.Enrollment;
import com.library.Skillmark.enrollment.entity.EnrollmentId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EnrollmentRepository extends JpaRepository<Enrollment, EnrollmentId> {
    boolean existsByCourse_IdAndStudent_Id(UUID courseId, UUID studentId);

    List<Enrollment> findByCourse_Id(UUID courseId);

    List<Enrollment> findByStudent_Id(UUID studentId);
}
