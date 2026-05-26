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
@Tag(name = "Quizzes")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class QuizController {
    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/api/v1/programs/{programId}/quizzes")
    @Operation(summary = "Create quiz", description = "Creates a draft quiz in an owned program.")
    ResponseEntity<ApiResponse<QuizResponse>> create(@PathVariable UUID programId,
                                                     @Valid @RequestBody CreateQuizRequest request,
                                                     Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Quiz created successfully",
                quizService.create(programId, request, SecurityUtil.userId(authentication))));
    }

    @GetMapping("/api/v1/quizzes")
    @Operation(summary = "List accessible quizzes", description = "Owners see organization quizzes; participants see published quizzes in organizations where they are active members.")
    ApiResponse<PageResponse<QuizResponse>> list(Authentication authentication,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Quizzes retrieved successfully",
                quizService.listAccessible(SecurityUtil.userId(authentication), page, size));
    }

    @GetMapping("/api/v1/programs/{programId}/quizzes")
    @Operation(summary = "List program quizzes", description = "Owners see all non-deleted quizzes; participants see only published quizzes if enrolled.")
    ApiResponse<PageResponse<QuizResponse>> listByProgram(@PathVariable UUID programId,
                                                          Authentication authentication,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Quizzes retrieved successfully",
                quizService.listByProgram(programId, SecurityUtil.userId(authentication), page, size));
    }

    @GetMapping("/api/v1/quizzes/{quizId}")
    @Operation(summary = "Get quiz", description = "Returns quiz details for the organization owner or active member when the quiz is published.")
    ApiResponse<QuizResponse> get(@PathVariable UUID quizId, Authentication authentication) {
        return ApiResponse.success("Quiz retrieved successfully", quizService.get(quizId, SecurityUtil.userId(authentication)));
    }

    @PutMapping("/api/v1/quizzes/{quizId}")
    @Operation(summary = "Update quiz", description = "Updates quiz settings. After attempts exist, only title and description can change.")
    ApiResponse<QuizResponse> update(@PathVariable UUID quizId,
                                     @Valid @RequestBody UpdateQuizRequest request,
                                     Authentication authentication) {
        return ApiResponse.success("Quiz updated successfully",
                quizService.update(quizId, request, SecurityUtil.userId(authentication)));
    }

    @DeleteMapping("/api/v1/quizzes/{quizId}")
    @Operation(summary = "Archive quiz", description = "Archives a quiz using a soft deletion policy. Requires owner permission.")
    ApiResponse<Void> archive(@PathVariable UUID quizId, Authentication authentication) {
        quizService.delete(quizId, SecurityUtil.userId(authentication));
        return ApiResponse.success("Quiz deleted successfully", null);
    }

    @PostMapping("/api/v1/quizzes/{quizId}/questions")
    @Operation(summary = "Add quiz question", description = "Adds a SINGLE_CHOICE question with options. Exactly one option must be correct.")
    ResponseEntity<ApiResponse<QuestionResponse>> addQuestion(@PathVariable UUID quizId,
                                                              @Valid @RequestBody CreateQuestionRequest request,
                                                              Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Question added successfully",
                quizService.addQuestion(quizId, request, SecurityUtil.userId(authentication))));
    }

    @PutMapping("/api/v1/questions/{questionId}")
    @Operation(summary = "Update quiz question", description = "Updates a question and its options until the quiz has submitted attempts. Requires owner permission.")
    ApiResponse<QuestionResponse> updateQuestion(@PathVariable UUID questionId,
                                                 @Valid @RequestBody CreateQuestionRequest request,
                                                 Authentication authentication) {
        return ApiResponse.success("Question updated successfully",
                quizService.updateQuestion(questionId, request, SecurityUtil.userId(authentication)));
    }

    @DeleteMapping("/api/v1/questions/{questionId}")
    @Operation(summary = "Delete quiz question", description = "Deletes a question until the quiz has submitted attempts. Submitted attempt history is protected from destructive changes.")
    ApiResponse<Void> deleteQuestion(@PathVariable UUID questionId, Authentication authentication) {
        quizService.deleteQuestion(questionId, SecurityUtil.userId(authentication));
        return ApiResponse.success("Question deleted successfully", null);
    }

    @PostMapping("/api/v1/questions/{questionId}/options")
    @Operation(summary = "Add quiz option", description = "Adds an option until the quiz has submitted attempts. Requires owner permission.")
    ResponseEntity<ApiResponse<OptionResponse>> addOption(@PathVariable UUID questionId,
                                                          @Valid @RequestBody CreateOptionRequest request,
                                                          Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Option added successfully",
                quizService.addOption(questionId, request, SecurityUtil.userId(authentication))));
    }

    @PutMapping("/api/v1/options/{optionId}")
    @Operation(summary = "Update quiz option", description = "Updates an option until the quiz has submitted attempts. Requires owner permission.")
    ApiResponse<OptionResponse> updateOption(@PathVariable UUID optionId,
                                             @Valid @RequestBody CreateOptionRequest request,
                                             Authentication authentication) {
        return ApiResponse.success("Option updated successfully",
                quizService.updateOption(optionId, request, SecurityUtil.userId(authentication)));
    }

    @DeleteMapping("/api/v1/options/{optionId}")
    @Operation(summary = "Delete quiz option", description = "Deletes an option until the quiz has submitted attempts. Submitted attempt history is protected from destructive changes.")
    ApiResponse<Void> deleteOption(@PathVariable UUID optionId, Authentication authentication) {
        quizService.deleteOption(optionId, SecurityUtil.userId(authentication));
        return ApiResponse.success("Option deleted successfully", null);
    }

    @PostMapping("/api/v1/quizzes/{quizId}/publish")
    @Operation(summary = "Publish quiz", description = "Publishes a quiz after validating that it has valid questions, options, settings, and exactly one correct option per SINGLE_CHOICE question.")
    ApiResponse<QuizResponse> publish(@PathVariable UUID quizId, Authentication authentication) {
        return ApiResponse.success("Quiz published successfully",
                quizService.updateStatus(quizId, QuizStatus.PUBLISHED, SecurityUtil.userId(authentication)));
    }

    @PatchMapping("/api/v1/quizzes/{quizId}/status")
    @Operation(summary = "Update quiz status", description = "Updates quiz status. Status is the source of truth; isPublished is derived from status == PUBLISHED.")
    ApiResponse<QuizResponse> updateStatus(@PathVariable UUID quizId,
                                           @Valid @RequestBody UpdateQuizStatusRequest request,
                                           Authentication authentication) {
        return ApiResponse.success("Quiz status updated successfully",
                quizService.updateStatus(quizId, request.status(), SecurityUtil.userId(authentication)));
    }

    @PatchMapping("/api/v1/quizzes/{quizId}/visibility")
    @Operation(summary = "Update quiz visibility", description = "Shows or hides a quiz for participants. Owner access only.")
    ApiResponse<QuizResponse> updateVisibility(@PathVariable UUID quizId,
                                               @Valid @RequestBody UpdateQuizVisibilityRequest request,
                                               Authentication authentication) {
        return ApiResponse.success("Quiz visibility updated successfully",
                quizService.updateVisibility(quizId, request.visibleToParticipants(), SecurityUtil.userId(authentication)));
    }
}
