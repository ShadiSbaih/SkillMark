Table users {
  id uuid [pk]
  name varchar
  email varchar [unique]
  password_hash varchar
  role varchar
  created_at timestamptz
  updated_at timestamptz
}

Table students {
  id uuid [pk]
  user_id uuid [unique]
  created_at timestamptz
  updated_at timestamptz
}

Table organizations {
  id uuid [pk]
  name varchar
  owner_id uuid
  created_at timestamptz
  updated_at timestamptz
}

Table organization_students {
  organization_id uuid
  student_id uuid
  created_at timestamptz
}

Table courses {
  id uuid [pk]
  title varchar
  description varchar
  organization_id uuid
  created_at timestamptz
  updated_at timestamptz
}

Table course_students {
  course_id uuid
  student_id uuid
  created_at timestamptz
}

Table quizzes {
  id uuid [pk]
  title varchar
  course_id uuid
  created_at timestamptz
  updated_at timestamptz
}

Table resources {
  id uuid [pk]
  title varchar
  type varchar
  url varchar
  course_id uuid
  created_at timestamptz
  updated_at timestamptz
}

Table certificates {
  id uuid [pk]
  title varchar
  course_id uuid
  student_id uuid
  created_at timestamptz
  updated_at timestamptz
}

// Relationships
Ref: students.user_id - users.id
Ref: organizations.owner_id > users.id
Ref: organization_students.organization_id > organizations.id
Ref: organization_students.student_id > students.id
Ref: courses.organization_id > organizations.id
Ref: course_students.course_id > courses.id
Ref: course_students.student_id > students.id
Ref: quizzes.course_id > courses.id
Ref: resources.course_id > courses.id
Ref: certificates.course_id > courses.id
Ref: certificates.student_id > students.id