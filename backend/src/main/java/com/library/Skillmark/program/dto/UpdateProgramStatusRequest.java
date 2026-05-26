package com.library.Skillmark.program.dto;

import com.library.Skillmark.program.enums.ProgramStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateProgramStatusRequest(@NotNull ProgramStatus status) {
}
