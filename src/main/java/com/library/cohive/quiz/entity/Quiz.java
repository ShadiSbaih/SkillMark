package com.library.cohive.quiz.entity;

import com.library.cohive.common.entity.AuditableEntity;
import com.library.cohive.course.entity.Course;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.LinkedHashSet;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "quizzes")
public class Quiz extends AuditableEntity {

    @Column(nullable = false)
    private String title;

    @Column(name = "passing_score", nullable = false)
    private Integer passingScore;

    @Column(name = "is_published", nullable = false)
    private Boolean published;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Builder.Default
    @OneToMany(mappedBy = "quiz")
    @OrderBy("displayOrder ASC")
    private Set<QuizQuestion> questions = new LinkedHashSet<>();
}
