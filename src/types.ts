export type TopicStatus = 'not_started' | 'learning' | 'practicing' | 'review' | 'mastered';

export type TaskStatus = 'todo' | 'doing' | 'done';

export type PracticeTaskType = 'command' | 'configuration' | 'troubleshooting' | 'conceptual' | 'lab';

export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string | null;
}

export interface Topic {
  id: string;
  moduleId: string;
  pathId: string;
  title: string;
  objective: string;
  prerequisites?: string[];
  estimatedMinutes: number;
  order: number;
  status: TopicStatus;
  mastery: MasteryLevel;
  resourceUrls: string[];
}

export interface ModuleItem {
  id: string;
  pathId: string;
  title: string;
  description: string;
  order: number;
  topics?: Topic[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  goal: string;
  targetLevel: string;
  createdAt?: string;
  updatedAt: string;
  modules?: ModuleItem[];
  topics?: Topic[];
  progressPercent?: number;
}

export interface RecallQuestion {
  id: string;
  question: string;
  suggestedAnswer: string;
}

export interface Note {
  id: string;
  pathId: string;
  topicId: string;
  title: string;
  contentMarkdown: string;
  whyItMatters?: string;
  mentalModel?: string;
  keyConcepts?: string[];
  commands?: string[];
  workedExample?: string;
  pitfalls?: string[];
  practiceCompleted?: string[];
  recallQuestions?: RecallQuestion[];
  fiveLineSummary?: string;
  tags: string[];
  createdAt?: string;
  updatedAt: string;
}

export interface PracticeTask {
  id: string;
  pathId: string;
  topicId: string;
  title: string;
  instructions: string;
  type: PracticeTaskType;
  status: TaskStatus;
  evidence: string;
  verificationCriteria?: string;
  updatedAt?: string;
}

export interface ReviewItem {
  topicId: string;
  pathId: string;
  topicTitle: string;
  pathTitle: string;
  currentMastery: MasteryLevel;
  lastReviewedAt: string;
  nextReviewDue: string;
  recallQuestions: RecallQuestion[];
}

export interface DashboardStats {
  totalPaths: number;
  totalTopics: number;
  masteredTopics: number;
  inProgressTopics: number;
  totalNotes: number;
  completedTasks: number;
  pendingReviews: number;
  currentStreakDays: number;
}

export interface GlobalSearchResult {
  paths: LearningPath[];
  topics: Topic[];
  notes: Note[];
  practiceTasks: PracticeTask[];
}
