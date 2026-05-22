Table users {
  id int [pk]
  name varchar
  email varchar
}

Table students {
  id int [pk]
  user_id int [unique]
}

Table organizations {
  id int [pk]
  name varchar
  owner_id int
}

Table organization_students {
  organization_id int
  student_id int
}

Table courses {
  id int [pk]
  title varchar
  organization_id int
}

Table course_students {
  course_id int
  student_id int
}

Table quizzes {
  id int [pk]
  title varchar
  course_id int
}

Table resources {
  id int [pk]
  title varchar
  url varchar
  course_id int
}

Table certificates {
  id int [pk]
  title varchar
  course_id int
  student_id int
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

Ref: "users"."id" < "users"."email"