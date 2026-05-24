Table users {
  id uuid [pk]
  name varchar [not null]
  email varchar [not null, unique]
  password_hash varchar [not null]

  email_verified boolean [not null, default: false]
  status varchar [not null, default: 'ACTIVE'] // ACTIVE, DISABLED, DELETED

  created_at timestamptz [not null]
  updated_at timestamptz [not null]
}

Table organizations {
  id uuid [pk]
  name varchar [not null]

  owner_id uuid [not null]

  status varchar [not null, default: 'ACTIVE'] // ACTIVE, DISABLED, DELETED

  created_at timestamptz [not null]
  updated_at timestamptz [not null]
  deleted_at timestamptz
}

Table organization_memberships {
  organization_id uuid [not null]
  user_id uuid [not null]

  role varchar [not null] // OWNER, STUDENT
  status varchar [not null, default: 'ACTIVE'] // ACTIVE, DISABLED, REMOVED

  created_at timestamptz [not null]
  updated_at timestamptz [not null]

  indexes {
    (organization_id, user_id) [pk]
    user_id
    organization_id
    role
  }
}

Table courses {
  id uuid [pk]

  organization_id uuid [not null]

  title varchar [not null]
  description varchar

  status varchar [not null, default: 'ACTIVE'] // DRAFT, ACTIVE, ARCHIVED, DELETED

  created_at timestamptz [not null]
  updated_at timestamptz [not null]
  deleted_at timestamptz

  indexes {
    organization_id
  }
}

Table course_enrollments {
  course_id uuid [not null]
  user_id uuid [not null]

  status varchar [not null, default: 'ACTIVE'] // ACTIVE, COMPLETED, CANCELLED, REMOVED

  enrolled_at timestamptz [not null]
  completed_at timestamptz

  indexes {
    (course_id, user_id) [pk]
    course_id
    user_id
  }
}

Table resources {
  id uuid [pk]

  course_id uuid [not null]

  title varchar [not null]
  description varchar

  type varchar [not null] // LINK, FILE

  // For LINK resources
  url varchar

  // For FILE resources
  file_url varchar
  original_file_name varchar
  content_type varchar
  size_bytes bigint

  status varchar [not null, default: 'ACTIVE'] // ACTIVE, ARCHIVED, DELETED

  created_at timestamptz [not null]
  updated_at timestamptz [not null]
  deleted_at timestamptz

  indexes {
    course_id
    type
  }
}

Table quizzes {
  id uuid [pk]

  course_id uuid [not null]

  title varchar [not null]
  description varchar

  passing_score decimal [not null, default: 60.00]
  is_published boolean [not null, default: false]

  status varchar [not null, default: 'ACTIVE'] // ACTIVE, ARCHIVED, DELETED

  created_at timestamptz [not null]
  updated_at timestamptz [not null]
  deleted_at timestamptz

  indexes {
    course_id
    is_published
  }
}

Table quiz_questions {
  id uuid [pk]

  quiz_id uuid [not null]

  text text [not null]
  type varchar [not null, default: 'SINGLE_CHOICE'] // SINGLE_CHOICE
  points decimal [not null, default: 1.00]
  position int [not null, default: 0]

  created_at timestamptz [not null]
  updated_at timestamptz [not null]

  indexes {
    quiz_id
  }
}

Table quiz_options {
  id uuid [pk]

  question_id uuid [not null]

  text text [not null]
  is_correct boolean [not null, default: false]
  position int [not null, default: 0]

  created_at timestamptz [not null]
  updated_at timestamptz [not null]

  indexes {
    question_id
  }
}

Table quiz_attempts {
  id uuid [pk]

  quiz_id uuid [not null]
  user_id uuid [not null]

  score decimal
  passed boolean

  status varchar [not null, default: 'IN_PROGRESS'] // IN_PROGRESS, SUBMITTED, CANCELLED

  started_at timestamptz [not null]
  submitted_at timestamptz

  indexes {
    quiz_id
    user_id
    status
  }
}

Table quiz_attempt_answers {
  id uuid [pk]

  attempt_id uuid [not null]
  question_id uuid [not null]
  selected_option_id uuid [not null]

  is_correct boolean
  points_awarded decimal

  created_at timestamptz [not null]

  indexes {
    attempt_id
    question_id
    (attempt_id, question_id) [unique]
  }
}

Table certificates {
  id uuid [pk]

  certificate_number varchar [not null, unique]
  verification_code varchar [not null, unique]

  organization_id uuid [not null]
  course_id uuid [not null]
  user_id uuid [not null]

  title varchar [not null]

  student_name_snapshot varchar [not null]
  course_title_snapshot varchar [not null]
  organization_name_snapshot varchar [not null]

  status varchar [not null, default: 'ACTIVE'] // ACTIVE, REVOKED

  issued_at timestamptz [not null]
  revoked_at timestamptz
  revoke_reason varchar

  pdf_url varchar

  created_at timestamptz [not null]
  updated_at timestamptz [not null]

  indexes {
    organization_id
    course_id
    user_id
    verification_code
    (course_id, user_id)
  }
}

Table refresh_tokens {
  id uuid [pk]

  user_id uuid [not null]

  token_hash varchar [not null, unique]
  expires_at timestamptz [not null]
  revoked_at timestamptz
  replaced_by_token_id uuid

  created_at timestamptz [not null]

  indexes {
    user_id
    expires_at
  }
}

Table email_verification_tokens {
  id uuid [pk]

  user_id uuid [not null]

  token_hash varchar [not null, unique]
  expires_at timestamptz [not null]
  used_at timestamptz

  created_at timestamptz [not null]

  indexes {
    user_id
    expires_at
  }
}

Table password_reset_tokens {
  id uuid [pk]

  user_id uuid [not null]

  token_hash varchar [not null, unique]
  expires_at timestamptz [not null]
  used_at timestamptz

  created_at timestamptz [not null]

  indexes {
    user_id
    expires_at
  }
}

Table audit_logs {
  id uuid [pk]

  actor_user_id uuid
  organization_id uuid

  action varchar [not null]
  entity_type varchar
  entity_id uuid

  ip_address varchar
  user_agent text
  metadata jsonb

  created_at timestamptz [not null]

  indexes {
    actor_user_id
    organization_id
    action
    created_at
  }
}


// Relationships

Ref: organizations.owner_id > users.id

Ref: organization_memberships.organization_id > organizations.id
Ref: organization_memberships.user_id > users.id

Ref: courses.organization_id > organizations.id

Ref: course_enrollments.course_id > courses.id
Ref: course_enrollments.user_id > users.id

Ref: resources.course_id > courses.id

Ref: quizzes.course_id > courses.id

Ref: quiz_questions.quiz_id > quizzes.id
Ref: quiz_options.question_id > quiz_questions.id

Ref: quiz_attempts.quiz_id > quizzes.id
Ref: quiz_attempts.user_id > users.id

Ref: quiz_attempt_answers.attempt_id > quiz_attempts.id
Ref: quiz_attempt_answers.question_id > quiz_questions.id
Ref: quiz_attempt_answers.selected_option_id > quiz_options.id

Ref: certificates.organization_id > organizations.id
Ref: certificates.course_id > courses.id
Ref: certificates.user_id > users.id

Ref: refresh_tokens.user_id > users.id
Ref: refresh_tokens.replaced_by_token_id > refresh_tokens.id

Ref: email_verification_tokens.user_id > users.id

Ref: password_reset_tokens.user_id > users.id

Ref: audit_logs.actor_user_id > users.id
Ref: audit_logs.organization_id > organizations.id