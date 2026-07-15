package com.library.Skillmark.invitation.dto;

import com.library.Skillmark.invitation.entity.InvitationLink;
import com.library.Skillmark.invitation.enums.InvitationStatus;
import com.library.Skillmark.program.enums.ProgramStatus;

public record InvitationPreviewResponse(
        String code,
        String programTitle,
        String organizationName,
        boolean valid
) {
    public static InvitationPreviewResponse from(InvitationLink invitation) {
        boolean valid = invitation.getStatus() == InvitationStatus.ACTIVE
                && invitation.getProgram().getStatus() == ProgramStatus.PUBLISHED
                && invitation.getProgram().getDeletedAt() == null;
        return new InvitationPreviewResponse(
                invitation.getCode(),
                invitation.getProgram().getTitle(),
                invitation.getOrganization().getName(),
                valid);
    }
}
