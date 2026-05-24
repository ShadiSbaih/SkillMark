package com.library.Skillmark.quiz.dto;

import com.library.Skillmark.quiz.entity.QuizOption;

import java.util.UUID;

public record OptionResponse(UUID id, String text, boolean isCorrect, Integer position) {
    public static OptionResponse from(QuizOption option, boolean includeCorrect) {
        return new OptionResponse(option.getId(), option.getText(), includeCorrect && option.isCorrect(), option.getPosition());
    }
}
