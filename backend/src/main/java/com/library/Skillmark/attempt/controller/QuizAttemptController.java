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
import com.library.Skillmark.certificate.dto.CertificateResponse;
import com.library.Skillmark.certificate.dto.IssueCertificateRequest;
import com.library.Skillmark.certificate.service.CertificateService;
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
@Tag(name = "Attempts")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class QuizAttemptController {
    private final QuizAttemptService attemptService;
    private final CertificateService certificateService;

    public QuizAttemptController(QuizAttemptService attemptService, CertificateService certificateService) {
        this.attemptService = attemptService;
        this.certificateService = certificateService;
    }

    @PostMapping("/quizzes/{quizId}/attempts")
    @Operation(summary = "Start quiz attempt", description = "Starts an attempt for a published quiz. Requires ACTIVE PARTICIPANT membership and available attempt quota.")
    ResponseEntity<ApiResponse<StartAttemptResponse>> start(@PathVariable UUID quizId, AuthUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Quiz attempt started successfully",
                attemptService.start(quizId, currentUser.id())));
    }

    @PostMapping("/quiz-attempts/{attemptId}/submit")
    @Operation(summary = "Submit quiz attempt", description = "Submits answers for the current user's attempt. The backend validates answers, calculates score/pass status, and may issue an automatic certificate.")
    ApiResponse<AttemptResultResponse> submit(@PathVariable UUID attemptId,
                                              @Valid @RequestBody SubmitAttemptRequest request,
                                              AuthUser currentUser) {
        return ApiResponse.success("Quiz attempt submitted successfully",
                attemptService.submit(attemptId, request, currentUser.id()));
    }

    @GetMapping("/quiz-attempts/{attemptId}")
    @Operation(summary = "Get attempt", description = "Returns an attempt for the attempt owner or the owner of the quiz organization.")
    ApiResponse<AttemptResponse> get(@PathVariable UUID attemptId, AuthUser currentUser) {
        return ApiResponse.success("Attempt retrieved successfully",
                attemptService.get(attemptId, currentUser.id()));
    }

    @GetMapping("/quizzes/{quizId}/attempts")
    @Operation(summary = "List quiz attempts", description = "Lists attempts for a quiz. Requires owner permission for the quiz organization.")
    ApiResponse<PageResponse<AttemptResponse>> listForQuiz(@PathVariable UUID quizId,
                                                           AuthUser currentUser,
                                                           @RequestParam(defaultValue = "0") int page,
                                                           @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success("Quiz attempts retrieved successfully",
                attemptService.listForQuiz(quizId, currentUser.id(), page, size));
    }

    @PostMapping("/quiz-attempts/{attemptId}/certificate")
    @Operation(summary = "Issue certificate for attempt", description = "Manually issues a certificate for a submitted passing attempt. Requires owner permission.")
    ResponseEntity<ApiResponse<CertificateResponse>> issueCertificate(@PathVariable UUID attemptId,
                                                                      @RequestBody(required = false) IssueCertificateRequest request,
                                                                      AuthUser currentUser) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Certificate issued successfully",
                certificateService.issue(request, currentUser.id())));
    }
}
