package com.library.Skillmark.stats.controller;

import com.library.Skillmark.common.response.ApiResponse;
import com.library.Skillmark.config.OpenApiConfig;
import com.library.Skillmark.security.SecurityUtil;
import com.library.Skillmark.stats.dto.OrganizationStatsResponse;
import com.library.Skillmark.stats.dto.ProgramStatsResponse;
import com.library.Skillmark.stats.service.StatsService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@Tag(name = "Statistics")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class StatsController {
    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/api/v1/organizations/{organizationId}/stats")
    ApiResponse<OrganizationStatsResponse> organizationStats(@PathVariable UUID organizationId, Authentication authentication) {
        return ApiResponse.success("Organization stats retrieved successfully",
                statsService.organizationStats(organizationId, SecurityUtil.userId(authentication)));
    }

    @GetMapping("/api/v1/programs/{programId}/stats")
    ApiResponse<ProgramStatsResponse> programStats(@PathVariable UUID programId, Authentication authentication) {
        return ApiResponse.success("Program stats retrieved successfully",
                statsService.programStats(programId, SecurityUtil.userId(authentication)));
    }
}
