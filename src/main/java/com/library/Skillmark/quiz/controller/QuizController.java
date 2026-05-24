package com.library.Skillmark.quiz.controller;

import com.library.Skillmark.quiz.controller.*;
import com.library.Skillmark.quiz.dto.*;
import com.library.Skillmark.quiz.entity.*;
import com.library.Skillmark.quiz.enums.*;
import com.library.Skillmark.quiz.repository.*;
import com.library.Skillmark.quiz.service.*;
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
@RequestMapping("/api/v1/quizzes")
@Tag(name = "Quizzes")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class QuizController {
    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping
    @Operation(summary = "Create quiz", description = "Creates a draft quiz in an owned organization.")
    ResponseEntity<ApiResponse<QuizResponse>> create(@Valid @RequestBody CreateQuizRequest request,
                                                     Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Quiz created successfully",
                quizService.create(request, SecurityUtil.userId(authentication))));
    }

    @GetMapping
    @Operation(summary = "List accessible quizzes", description = "Owners see organization quizzes; participants see published quizzes in organizations where they are active members.")
    ApiResponse<PageResponse<QuizResponse>> list(Authentication authentication,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Quizzes retrieved successfully",
                quizService.listAccessible(SecurityUtil.userId(authentication), page, size));
    }

    @GetMapping("/organization/{organizationId}")
    @Operation(summary = "List organization quizzes", description = "Owners see all non-deleted quizzes; participants see only published quizzes.")
    ApiResponse<PageResponse<QuizResponse>> listByOrganization(@PathVariable UUID organizationId,
                                                               Authentication authentication,
                                                               @RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Quizzes retrieved successfully",
                quizService.listByOrganization(organizationId, SecurityUtil.userId(authentication), page, size));
    }

    @GetMapping("/{quizId}")
    @Operation(summary = "Get quiz", description = "Returns quiz details for the organization owner or active member when the quiz is published.")
    ApiResponse<QuizResponse> get(@PathVariable UUID quizId, Authentication authentication) {
        return ApiResponse.success("Quiz retrieved successfully", quizService.get(quizId, SecurityUtil.userId(authentication)));
    }

    @PutMapping("/{quizId}")
    @Operation(summary = "Update quiz", description = "Updates quiz settings. After attempts exist, only title and description can change.")
    ApiResponse<QuizResponse> update(@PathVariable UUID quizId,
                                     @Valid @RequestBody UpdateQuizRequest request,
                                     Authentication authentication) {
        return ApiResponse.success("Quiz updated successfully",
                quizService.update(quizId, request, SecurityUtil.userId(authentication)));
    }

    @DeleteMapping("/{quizId}")
    @Operation(summary = "Archive quiz", description = "Archives a quiz using a soft deletion policy. Requires owner permission.")
    ApiResponse<Void> archive(@PathVariable UUID quizId, Authentication authentication) {
        quizService.archive(quizId, SecurityUtil.userId(authentication));
        return ApiResponse.success("Quiz archived successfully", null);
    }

    @PostMapping("/{quizId}/questions")
    @Operation(summary = "Add quiz question", description = "Adds a SINGLE_CHOICE question with options. Exactly one option must be correct.")
    ResponseEntity<ApiResponse<QuestionResponse>> addQuestion(@PathVariable UUID quizId,
                                                              @Valid @RequestBody CreateQuestionRequest request,
                                                              Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Question added successfully",
                quizService.addQuestion(quizId, request, SecurityUtil.userId(authentication))));
    }

    @PostMapping("/{quizId}/publish")
    @Operation(summary = "Publish quiz", description = "Publishes a quiz after validating that it has valid questions, options, settings, and exactly one correct option per SINGLE_CHOICE question.")
    ApiResponse<QuizResponse> publish(@PathVariable UUID quizId, Authentication authentication) {
        return ApiResponse.success("Quiz published successfully", quizService.publish(quizId, SecurityUtil.userId(authentication)));
    }
}
