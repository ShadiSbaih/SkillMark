package com.library.Skillmark.resource.service;

import com.library.Skillmark.common.exception.ForbiddenException;
import com.library.Skillmark.common.exception.ResourceNotFoundException;
import com.library.Skillmark.common.util.SecurityUtil;
import com.library.Skillmark.course.entity.Course;
import com.library.Skillmark.course.repository.CourseRepository;
import com.library.Skillmark.enrollment.repository.EnrollmentRepository;
import com.library.Skillmark.resource.dto.CreateResourceRequest;
import com.library.Skillmark.resource.dto.ResourceResponse;
import com.library.Skillmark.resource.entity.Resource;
import com.library.Skillmark.resource.repository.ResourceRepository;
import com.library.Skillmark.student.entity.Student;
import com.library.Skillmark.student.repository.StudentRepository;
import com.library.Skillmark.user.entity.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResourceService {
    private final ResourceRepository resourceRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;

    public ResourceResponse createResource(CreateResourceRequest request) {
        ensureOwnerRole();
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        if (!course.getOrganization().getOwner().getId().equals(SecurityUtil.getCurrentUserId())) {
            throw new ForbiddenException("Access denied");
        }

        Resource resource = Resource.builder()
                .title(request.getTitle().trim())
                .type(request.getType())
                .url(request.getUrl().trim())
                .course(course)
                .build();
        return ResourceResponse.fromEntity(resourceRepository.save(resource));
    }

    public List<ResourceResponse> getCourseResources(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Role role = SecurityUtil.getCurrentUserRole();
        if (role == Role.OWNER) {
            if (!course.getOrganization().getOwner().getId().equals(SecurityUtil.getCurrentUserId())) {
                throw new ForbiddenException("Access denied");
            }
        } else {
            Student student = studentRepository.findByUser_Id(SecurityUtil.getCurrentUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
            boolean enrolled = enrollmentRepository.existsByCourse_IdAndStudent_Id(courseId, student.getId());
            if (!enrolled) {
                throw new ForbiddenException("Access denied");
            }
        }

        return resourceRepository.findByCourse_Id(courseId).stream()
            .map(ResourceResponse::fromEntity)
                .toList();
    }

    private void ensureOwnerRole() {
        if (SecurityUtil.getCurrentUserRole() != Role.OWNER) {
            throw new ForbiddenException("Only organization owners can manage resources");
        }
    }
}
