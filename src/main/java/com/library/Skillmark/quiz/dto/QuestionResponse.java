package com.library.Skillmark.quiz.dto;

import com.library.Skillmark.quiz.enums.QuestionType;

import java.util.List;
import java.util.UUID;

public record QuestionResponse(
        UUID id,
        String text,
        QuestionType type,
        Integer points,
        Integer position,
        List<OptionResponse> options
) {
}
