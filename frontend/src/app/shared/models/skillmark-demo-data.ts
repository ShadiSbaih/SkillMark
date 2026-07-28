export type Status =
  | 'ACTIVE'
  | 'PUBLISHED'
  | 'DRAFT'
  | 'ARCHIVED'
  | 'REVOKED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'COMPLETED'
  | 'DISABLED'
  | 'REMOVED';



export interface Program {
  id: string;
  title: string;
  description: string;
  status: Status;
  startDate: string;
  endDate: string;
  enrollments: number;
  resources: number;
  quizzes: number;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'LINK' | 'FILE' | 'IMAGE' | 'VIDEO_LINK';
  visibleToParticipants: boolean;
  status: Status;
}

export interface Quiz {
  id: string;
  programId: string;
  title: string;
  description: string;
  status: Status;
  passingScore: number;
  durationMinutes: number;
  maxAttempts: number;
  certificateIssueMode: 'AUTO' | 'MANUAL' | 'NONE';
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  points: number;
  options: { id: string; text: string; isCorrect: boolean }[];
}

export interface Attempt {
  id: string;
  quizTitle: string;
  participant: string;
  score: number;
  status: Status;
  submittedAt: string;
  passed: boolean;
}

export interface Certificate {
  id: string;
  verificationCode: string;
  recipientName: string;
  programTitle: string;
  quizTitle: string;
  issuedAt: string;
  status: Status;
}

export interface AuditLog {
  id: string;
  time: string;
  actor: string;
  action: string;
  entity: string;
}



export const programs: Program[] = [
  {
    id: 'program-git',
    title: 'Git Foundations',
    description: 'A four-week path from commits and branches to collaborative review habits.',
    status: 'PUBLISHED',
    startDate: '2026-02-02',
    endDate: '2026-03-02',
    enrollments: 64,
    resources: 8,
    quizzes: 3,
  },
  {
    id: 'program-web',
    title: 'Web APIs Bootcamp',
    description: 'Build, document, test, and certify REST API fundamentals.',
    status: 'DRAFT',
    startDate: '2026-04-08',
    endDate: '2026-05-10',
    enrollments: 22,
    resources: 5,
    quizzes: 2,
  },
];

export const resources: Resource[] = [
  {
    id: 'res-1',
    title: 'Workshop Handbook',
    description: 'Reference PDF for the Git Foundations sessions.',
    type: 'FILE',
    visibleToParticipants: true,
    status: 'ACTIVE',
  },
  {
    id: 'res-2',
    title: 'Branching Strategy Walkthrough',
    description: 'Short video covering feature branches and pull requests.',
    type: 'VIDEO_LINK',
    visibleToParticipants: true,
    status: 'ACTIVE',
  },
  {
    id: 'res-3',
    title: 'Instructor Notes',
    description: 'Internal facilitation checklist for mentors.',
    type: 'LINK',
    visibleToParticipants: false,
    status: 'ACTIVE',
  },
];

export const quizzes: Quiz[] = [
  {
    id: 'quiz-git-final',
    programId: 'program-git',
    title: 'Git Basics Final Quiz',
    description: 'Validates command fluency, branch hygiene, and collaboration concepts.',
    status: 'PUBLISHED',
    passingScore: 70,
    durationMinutes: 35,
    maxAttempts: 3,
    certificateIssueMode: 'AUTO',
    questions: [
      {
        id: 'q1',
        text: 'Which command creates a new branch and switches to it?',
        points: 10,
        options: [
          { id: 'q1-a', text: 'git checkout -b feature/profile', isCorrect: true },
          { id: 'q1-b', text: 'git branch --delete feature/profile', isCorrect: false },
          { id: 'q1-c', text: 'git remote add feature/profile', isCorrect: false },
        ],
      },
      {
        id: 'q2',
        text: 'What should happen before merging a reviewed pull request?',
        points: 10,
        options: [
          { id: 'q2-a', text: 'Resolve comments and pass the checks', isCorrect: true },
          { id: 'q2-b', text: 'Delete the default branch', isCorrect: false },
          { id: 'q2-c', text: 'Commit build artifacts manually', isCorrect: false },
        ],
      },
    ],
  },
];

export const attempts: Attempt[] = [
  {
    id: 'attempt-1',
    quizTitle: 'Git Basics Final Quiz',
    participant: 'Sara Nasser',
    score: 86,
    status: 'SUBMITTED',
    submittedAt: '2026-05-18 10:30',
    passed: true,
  },
  {
    id: 'attempt-2',
    quizTitle: 'Git Basics Final Quiz',
    participant: 'Ahmad Khalil',
    score: 64,
    status: 'SUBMITTED',
    submittedAt: '2026-05-18 09:45',
    passed: false,
  },
  {
    id: 'attempt-3',
    quizTitle: 'Git Basics Final Quiz',
    participant: 'Lina Omar',
    score: 92,
    status: 'COMPLETED',
    submittedAt: '2026-05-17 14:15',
    passed: true,
  },
];

export const certificates: Certificate[] = [
  {
    id: 'cert-1',
    verificationCode: 'A3FX9KL2MN8PQR7Z',
    recipientName: 'Sara Nasser',
    programTitle: 'Git Foundations',
    quizTitle: 'Git Basics Final Quiz',
    issuedAt: '2026-05-18',
    status: 'ACTIVE',
  },
  {
    id: 'cert-2',
    verificationCode: 'REV0KED9CERT2222',
    recipientName: 'Omar Saleh',
    programTitle: 'Web APIs Bootcamp',
    quizTitle: 'HTTP Fundamentals',
    issuedAt: '2026-04-28',
    status: 'REVOKED',
  },
];

export const auditLogs: AuditLog[] = [
  {
    id: 'log-1',
    time: 'May 18, 10:45 AM',
    actor: 'Ahmad Khalil',
    action: 'CERTIFICATE_ISSUED',
    entity: 'Sara Nasser',
  },
  {
    id: 'log-2',
    time: 'May 18, 10:30 AM',
    actor: 'Sara Nasser',
    action: 'ATTEMPT_SUBMITTED',
    entity: 'Git Basics Final Quiz',
  },
  {
    id: 'log-3',
    time: 'May 17, 09:00 AM',
    actor: 'Ahmad Khalil',
    action: 'QUIZ_PUBLISHED',
    entity: 'Git Basics Final Quiz',
  },
  {
    id: 'log-4',
    time: 'May 12, 08:00 AM',
    actor: 'Ahmad Khalil',
    action: 'PROGRAM_CREATED',
    entity: 'Git Foundations',
  },
];



export const programStats = {
  totalEnrollments: 64,
  activeEnrollments: 58,
  resourcesCount: 8,
  quizzesCount: 3,
  attemptsCount: 116,
  passedParticipants: 49,
  certificatesIssued: 47,
  averageScore: 84,
};
