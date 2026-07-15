package com.library.Skillmark.stats.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.security.AuthUser;
import com.library.Skillmark.stats.dto.OrganizationCertificatesTimelineResponse;
import com.library.Skillmark.stats.dto.OrganizationStatsResponse;
import com.library.Skillmark.stats.dto.ProgramCompletionStatsResponse;
import com.library.Skillmark.stats.dto.ProgramEnrollmentTimelineResponse;
import com.library.Skillmark.stats.dto.ProgramStatsResponse;
import com.library.Skillmark.stats.dto.QuizAttemptTimelineResponse;
import com.library.Skillmark.stats.dto.QuizQuestionStatsResponse;
import com.library.Skillmark.stats.dto.QuizScoreDistributionResponse;
import com.library.Skillmark.stats.dto.QuizStatsResponse;
import com.library.Skillmark.stats.service.StatsService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Statistics")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class StatsController {
    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/organizations/{organizationId}/stats")
    ApiResponse<OrganizationStatsResponse> organizationStats(@PathVariable UUID organizationId, AuthUser currentUser) {
        return ApiResponse.success("Organization stats retrieved successfully",
                statsService.organizationStats(organizationId, currentUser.id()));
    }

    @GetMapping("/programs/{programId}/stats")
    ApiResponse<ProgramStatsResponse> programStats(@PathVariable UUID programId, AuthUser currentUser) {
        return ApiResponse.success("Program stats retrieved successfully",
                statsService.programStats(programId, currentUser.id()));
    }

    @GetMapping("/quizzes/{quizId}/stats")
    ApiResponse<QuizStatsResponse> quizStats(@PathVariable UUID quizId, AuthUser currentUser) {
        return ApiResponse.success("Quiz stats retrieved successfully",
                statsService.quizStats(quizId, currentUser.id()));
    }

    @GetMapping("/quizzes/{quizId}/questions/stats")
    ApiResponse<List<QuizQuestionStatsResponse>> quizQuestionStats(@PathVariable UUID quizId, AuthUser currentUser) {
        return ApiResponse.success("Quiz question stats retrieved successfully",
                statsService.quizQuestionStats(quizId, currentUser.id()));
    }

    @GetMapping("/quizzes/{quizId}/score-distribution")
    ApiResponse<QuizScoreDistributionResponse> quizScoreDistribution(@PathVariable UUID quizId, AuthUser currentUser) {
        return ApiResponse.success("Quiz score distribution retrieved successfully",
                statsService.quizScoreDistribution(quizId, currentUser.id()));
    }

    @GetMapping("/quizzes/{quizId}/attempts/timeline")
    ApiResponse<QuizAttemptTimelineResponse> quizAttemptTimeline(@PathVariable UUID quizId, AuthUser currentUser) {
        return ApiResponse.success("Quiz attempts timeline retrieved successfully",
                statsService.quizAttemptTimeline(quizId, currentUser.id()));
    }

    @GetMapping("/programs/{programId}/enrollments/timeline")
    ApiResponse<ProgramEnrollmentTimelineResponse> programEnrollmentTimeline(@PathVariable UUID programId, AuthUser currentUser) {
        return ApiResponse.success("Program enrollment timeline retrieved successfully",
                statsService.programEnrollmentTimeline(programId, currentUser.id()));
    }

    @GetMapping("/programs/{programId}/completion")
    ApiResponse<ProgramCompletionStatsResponse> programCompletionStats(@PathVariable UUID programId, AuthUser currentUser) {
        return ApiResponse.success("Program completion stats retrieved successfully",
                statsService.programCompletionStats(programId, currentUser.id()));
    }

    @GetMapping("/organizations/{organizationId}/certificates/timeline")
    ApiResponse<OrganizationCertificatesTimelineResponse> organizationCertificateTimeline(@PathVariable UUID organizationId, AuthUser currentUser) {
        return ApiResponse.success("Organization certificates timeline retrieved successfully",
                statsService.organizationCertificateTimeline(organizationId, currentUser.id()));
    }
}
