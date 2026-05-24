package com.library.cohive.coursemodule.repository;

import com.library.cohive.coursemodule.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LessonRepository extends JpaRepository<Lesson, UUID> {
}
