package com.library.Skillmark.audit.enums;

import com.library.Skillmark.audit.entity.*;
import com.library.Skillmark.audit.enums.*;
import com.library.Skillmark.audit.repository.*;
import com.library.Skillmark.audit.service.*;
public enum AuditAction {
    ORGANIZATION_CREATED,
    ORGANIZATION_UPDATED,
    ORGANIZATION_DELETED,
    MEMBER_ADDED,
    MEMBER_REMOVED,
    PROGRAM_CREATED,
    PROGRAM_UPDATED,
    PROGRAM_PUBLISHED,
    PROGRAM_ARCHIVED,
    USER_ENROLLED,
    USER_REMOVED_FROM_PROGRAM,
    INVITATION_CREATED,
    INVITATION_DISABLED,
    RESOURCE_CREATED,
    RESOURCE_ARCHIVED,
    QUIZ_CREATED,
    QUIZ_UPDATED,
    QUIZ_PUBLISHED,
    QUIZ_ARCHIVED,
    ATTEMPT_SUBMITTED,
    CERTIFICATE_ISSUED,
    CERTIFICATE_REVOKED,
    LOGIN_FAILED,
    PASSWORD_RESET_COMPLETED
}
