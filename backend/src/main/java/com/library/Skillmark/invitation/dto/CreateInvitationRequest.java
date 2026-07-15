package com.library.Skillmark.invitation.dto;

import jakarta.validation.constraints.Email;

import java.util.List;

public record CreateInvitationRequest(String description,
                                      List<@Email String> emails) {
}
