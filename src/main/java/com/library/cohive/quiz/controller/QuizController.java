package com.library.cohive.quiz.controller;

import com.library.cohive.common.response.ApiResponse;
import com.library.cohive.quiz.dto.CreateQuizRequest;
import com.library.cohive.quiz.dto.QuizResponse;
import com.library.cohive.quiz.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
public class QuizController {
    private final QuizService quizService;

    @PostMapping
    public ApiResponse<QuizResponse> createQuiz(@Valid @RequestBody CreateQuizRequest request) {
        return ApiResponse.success("Quiz created successfully", quizService.createQuiz(request));
    }

    @GetMapping("/course/{courseId}")
    public ApiResponse<List<QuizResponse>> getCourseQuizzes(@PathVariable UUID courseId) {
        return ApiResponse.success(quizService.getCourseQuizzes(courseId));
    }
}
