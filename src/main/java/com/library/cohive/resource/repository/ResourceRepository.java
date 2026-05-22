package com.library.cohive.resource.repository;

import com.library.cohive.resource.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ResourceRepository extends JpaRepository<Resource, UUID> {
    List<Resource> findByCourse_Id(UUID courseId);
}
