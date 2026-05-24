package com.library.Skillmark.course.repository;

import com.library.Skillmark.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {
    List<Course> findByOrganization_Id(UUID organizationId);

    List<Course> findByOrganization_Owner_Id(UUID ownerId);

    Optional<Course> findByIdAndOrganization_Owner_Id(UUID courseId, UUID ownerId);
}
