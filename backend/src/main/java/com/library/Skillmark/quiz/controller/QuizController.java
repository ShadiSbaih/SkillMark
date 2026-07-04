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
import com.library.Skillmark.security.AuthUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Quizzes")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class QuizController {
    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/programs/{programId}/quizzes")
    @Operation(summary = "Create quiz", description = "Creates a draft quiz in an owned program.")
    ResponseEntity<ApiResponse<QuizResponse>> create(@PathVariable UUID programId,
                                                     @Valid @RequestBody CreateQuizRequest request,
                                                     AuthUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Quiz created successfully",
                quizService.create(programId, request, currentUser.id())));
    }

    @GetMapping("/quizzes")
    @Operation(summary = "List accessible quizzes", description = "Owners see organization quizzes; participants see published quizzes in organizations where they are active members.")
    ApiResponse<PageResponse<QuizResponse>> list(AuthUser currentUser,
                                                 @RequestParam(defaultValue = "0") int page,
                                                 @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Quizzes retrieved successfully",
                quizService.listAccessible(currentUser.id(), page, size));
    }

    @GetMapping("/programs/{programId}/quizzes")
    @Operation(summary = "List program quizzes", description = "Owners see all non-deleted quizzes; participants see only published quizzes if enrolled.")
    ApiResponse<PageResponse<QuizResponse>> listByProgram(@PathVariable UUID programId,
                                                          AuthUser currentUser,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Quizzes retrieved successfully",
                quizService.listByProgram(programId, currentUser.id(), page, size));
    }

    @GetMapping("/quizzes/{quizId}")
    @Operation(summary = "Get quiz", description = "Returns quiz details for the organization owner or active member when the quiz is published.")
    ApiResponse<QuizResponse> get(@PathVariable UUID quizId, AuthUser currentUser) {
        return ApiResponse.success("Quiz retrieved successfully", quizService.get(quizId, currentUser.id()));
    }

    @PutMapping("/quizzes/{quizId}")
    @Operation(summary = "Update quiz", description = "Updates quiz settings. After attempts exist, only title and description can change.")
    ApiResponse<QuizResponse> update(@PathVariable UUID quizId,
                                     @Valid @RequestBody UpdateQuizRequest request,
                                     AuthUser currentUser) {
        return ApiResponse.success("Quiz updated successfully",
                quizService.update(quizId, request, currentUser.id()));
    }

    @DeleteMapping("/quizzes/{quizId}")
    @Operation(summary = "Archive quiz", description = "Archives a quiz using a soft deletion policy. Requires owner permission.")
    ApiResponse<Void> archive(@PathVariable UUID quizId, AuthUser currentUser) {
        quizService.delete(quizId, currentUser.id());
        return ApiResponse.success("Quiz deleted successfully", null);
    }

    @PostMapping("/quizzes/{quizId}/questions")
    @Operation(summary = "Add quiz question", description = "Adds a SINGLE_CHOICE question with options. Exactly one option must be correct.")
    ResponseEntity<ApiResponse<QuestionResponse>> addQuestion(@PathVariable UUID quizId,
                                                              @Valid @RequestBody CreateQuestionRequest request,
                                                              AuthUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Question added successfully",
                quizService.addQuestion(quizId, request, currentUser.id())));
    }

    @PutMapping("/quizzes/{quizId}/questions/{questionId}")
    @Operation(summary = "Update quiz question", description = "Updates a question and its options until the quiz has submitted attempts. Requires owner permission.")
    ApiResponse<QuestionResponse> updateQuestion(@PathVariable UUID quizId,
                                                 @PathVariable UUID questionId,
                                                 @Valid @RequestBody CreateQuestionRequest request,
                                                 AuthUser currentUser) {
        return ApiResponse.success("Question updated successfully",
                quizService.updateQuestion(quizId, questionId, request, currentUser.id()));
    }

    @DeleteMapping("/quizzes/{quizId}/questions/{questionId}")
    @Operation(summary = "Delete quiz question", description = "Deletes a question until the quiz has submitted attempts. Submitted attempt history is protected from destructive changes.")
    ApiResponse<Void> deleteQuestion(@PathVariable UUID quizId,
                                     @PathVariable UUID questionId,
                                     AuthUser currentUser) {
        quizService.deleteQuestion(quizId, questionId, currentUser.id());
        return ApiResponse.success("Question deleted successfully", null);
    }

    @PostMapping("/quizzes/{quizId}/questions/{questionId}/options")
    @Operation(summary = "Add quiz option", description = "Adds an option until the quiz has submitted attempts. Requires owner permission.")
    ResponseEntity<ApiResponse<OptionResponse>> addOption(@PathVariable UUID quizId,
                                                          @PathVariable UUID questionId,
                                                          @Valid @RequestBody CreateOptionRequest request,
                                                          AuthUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Option added successfully",
                quizService.addOption(quizId, questionId, request, currentUser.id())));
    }

    @PutMapping("/quizzes/{quizId}/questions/{questionId}/options/{optionId}")
    @Operation(summary = "Update quiz option", description = "Updates an option until the quiz has submitted attempts. Requires owner permission.")
    ApiResponse<OptionResponse> updateOption(@PathVariable UUID quizId,
                                             @PathVariable UUID questionId,
                                             @PathVariable UUID optionId,
                                             @Valid @RequestBody CreateOptionRequest request,
                                             AuthUser currentUser) {
        return ApiResponse.success("Option updated successfully",
                quizService.updateOption(quizId, questionId, optionId, request, currentUser.id()));
    }

    @DeleteMapping("/quizzes/{quizId}/questions/{questionId}/options/{optionId}")
    @Operation(summary = "Delete quiz option", description = "Deletes an option until the quiz has submitted attempts. Submitted attempt history is protected from destructive changes.")
    ApiResponse<Void> deleteOption(@PathVariable UUID quizId,
                                   @PathVariable UUID questionId,
                                   @PathVariable UUID optionId,
                                   AuthUser currentUser) {
        quizService.deleteOption(quizId, questionId, optionId, currentUser.id());
        return ApiResponse.success("Option deleted successfully", null);
    }

    @PatchMapping("/quizzes/{quizId}/status")
    @Operation(summary = "Update quiz status", description = "Updates quiz status. Status is the source of truth; isPublished is derived from status == PUBLISHED.")
    ApiResponse<QuizResponse> updateStatus(@PathVariable UUID quizId,
                                           @Valid @RequestBody UpdateQuizStatusRequest request,
                                           AuthUser currentUser) {
        return ApiResponse.success("Quiz status updated successfully",
                quizService.updateStatus(quizId, request.status(), currentUser.id()));
    }

    @PatchMapping("/quizzes/{quizId}/visibility")
    @Operation(summary = "Update quiz visibility", description = "Shows or hides a quiz for participants. Owner access only.")
    ApiResponse<QuizResponse> updateVisibility(@PathVariable UUID quizId,
                                               @Valid @RequestBody UpdateQuizVisibilityRequest request,
                                               AuthUser currentUser) {
        return ApiResponse.success("Quiz visibility updated successfully",
                quizService.updateVisibility(quizId, request.visibleToParticipants(), currentUser.id()));
    }
}
