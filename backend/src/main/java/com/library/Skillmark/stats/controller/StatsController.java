package com.library.Skillmark.stats.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.security.AuthUser;
import com.library.Skillmark.stats.dto.OrganizationStatsResponse;
import com.library.Skillmark.stats.dto.ProgramStatsResponse;
import com.library.Skillmark.stats.dto.QuizStatsResponse;
import com.library.Skillmark.stats.service.StatsService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

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
}
