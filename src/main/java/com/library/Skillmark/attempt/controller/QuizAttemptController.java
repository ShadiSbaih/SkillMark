package com.library.Skillmark.attempt.controller;

import com.library.Skillmark.attempt.controller.*;
import com.library.Skillmark.attempt.dto.*;
import com.library.Skillmark.attempt.entity.*;
import com.library.Skillmark.attempt.enums.*;
import com.library.Skillmark.attempt.repository.*;
import com.library.Skillmark.attempt.service.*;
import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.common.response.PageResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.security.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@Tag(name = "Attempts")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class QuizAttemptController {
    private final QuizAttemptService attemptService;

    public QuizAttemptController(QuizAttemptService attemptService) {
        this.attemptService = attemptService;
    }

    @PostMapping("/api/v1/quizzes/{quizId}/attempts")
    @Operation(summary = "Start quiz attempt", description = "Starts an attempt for a published quiz. Requires ACTIVE PARTICIPANT membership and available attempt quota.")
    ResponseEntity<ApiResponse<StartAttemptResponse>> start(@PathVariable UUID quizId, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Quiz attempt started successfully",
                attemptService.start(quizId, SecurityUtil.userId(authentication))));
    }

    @PostMapping("/api/v1/quiz-attempts/{attemptId}/submit")
    @Operation(summary = "Submit quiz attempt", description = "Submits answers for the current user's attempt. The backend validates answers, calculates score/pass status, and may issue an automatic certificate.")
    ApiResponse<AttemptResultResponse> submit(@PathVariable UUID attemptId,
                                              @Valid @RequestBody SubmitAttemptRequest request,
                                              Authentication authentication) {
        return ApiResponse.success("Quiz attempt submitted successfully",
                attemptService.submit(attemptId, request, SecurityUtil.userId(authentication)));
    }

    @GetMapping("/api/v1/quiz-attempts/me")
    @Operation(summary = "List my attempts", description = "Returns attempts owned by the current authenticated user.")
    ApiResponse<PageResponse<AttemptResponse>> mine(Authentication authentication,
                                                    @RequestParam(defaultValue = "0") int page,
                                                    @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Attempts retrieved successfully",
                attemptService.mine(SecurityUtil.userId(authentication), page, size));
    }

    @GetMapping("/api/v1/quiz-attempts/{attemptId}")
    @Operation(summary = "Get attempt", description = "Returns an attempt for the attempt owner or the owner of the quiz organization.")
    ApiResponse<AttemptResponse> get(@PathVariable UUID attemptId, Authentication authentication) {
        return ApiResponse.success("Attempt retrieved successfully",
                attemptService.get(attemptId, SecurityUtil.userId(authentication)));
    }

    @GetMapping("/api/v1/quizzes/{quizId}/attempts")
    @Operation(summary = "List quiz attempts", description = "Lists attempts for a quiz. Requires owner permission for the quiz organization.")
    ApiResponse<PageResponse<AttemptResponse>> listForQuiz(@PathVariable UUID quizId,
                                                           Authentication authentication,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Quiz attempts retrieved successfully",
                attemptService.listForQuiz(quizId, SecurityUtil.userId(authentication), page, size));
    }
}
