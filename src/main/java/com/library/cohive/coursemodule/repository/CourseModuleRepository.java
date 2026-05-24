package com.library.cohive.coursemodule.repository;

import com.library.cohive.coursemodule.entity.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseModuleRepository extends JpaRepository<CourseModule, UUID> {
    List<CourseModule> findByCourse_IdOrderByDisplayOrderAsc(UUID courseId);

    Optional<CourseModule> findByIdAndCourse_Organization_Owner_Id(UUID moduleId, UUID ownerId);
}
