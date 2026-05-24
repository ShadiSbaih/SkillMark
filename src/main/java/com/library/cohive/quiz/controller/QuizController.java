package com.library.cohive.quiz.controller;

import com.library.cohive.common.response.ApiResponse;
import com.library.cohive.quiz.dto.CreateQuizRequest;
import com.library.cohive.quiz.dto.QuizAttemptResponse;
import com.library.cohive.quiz.dto.QuizResponse;
import com.library.cohive.quiz.dto.SubmitQuizAttemptRequest;
import com.library.cohive.quiz.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
@Tag(name = "Quizzes", description = "Create and retrieve quizzes that belong to courses.")
@SecurityRequirement(name = "bearerAuth")
public class QuizController {
    private final QuizService quizService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a quiz", description = "Creates a quiz for a course owned by the authenticated owner.")
    public ApiResponse<QuizResponse> createQuiz(@Valid @RequestBody CreateQuizRequest request) {
        return ApiResponse.success("Quiz created successfully", quizService.createQuiz(request));
    }

    @GetMapping("/course/{courseId}")
    @Operation(summary = "List course quizzes", description = "Returns quizzes visible for the selected course.")
    public ApiResponse<List<QuizResponse>> getCourseQuizzes(@PathVariable UUID courseId) {
        return ApiResponse.success(quizService.getCourseQuizzes(courseId));
    }

    @PostMapping("/{quizId}/attempts")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Submit quiz attempt", description = "Submits answers for a published quiz and returns the score.")
    public ApiResponse<QuizAttemptResponse> submitAttempt(
            @PathVariable UUID quizId,
            @Valid @RequestBody SubmitQuizAttemptRequest request) {
        return ApiResponse.success("Quiz attempt submitted successfully", quizService.submitAttempt(quizId, request));
    }
}
