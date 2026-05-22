package com.library.cohive.quiz.mapper;

import com.library.cohive.quiz.dto.QuizResponse;
import com.library.cohive.quiz.entity.Quiz;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface QuizMapper {
    @Mapping(source = "course.id", target = "courseId")
    QuizResponse toResponse(Quiz quiz);
}
