import {
  DashboardStats,
  GlobalSearchResult,
  LearningPath,
  ModuleItem,
  Note,
  PracticeTask,
  ReviewItem,
  Topic,
  TopicStatus,
  MasteryLevel,
} from '../types';

export interface CreateLearningPathDTO {
  title: string;
  description: string;
  goal: string;
  targetLevel: string;
  seedTemplate?: string;
}

export interface CreateModuleDTO {
  pathId: string;
  title: string;
  description: string;
  order: number;
}

export interface CreateTopicDTO {
  moduleId: string;
  pathId: string;
  title: string;
  objective: string;
  estimatedMinutes: number;
  order: number;
  resourceUrls?: string[];
}

export interface UpdateTopicDTO {
  status?: TopicStatus;
  mastery?: MasteryLevel;
  objective?: string;
  estimatedMinutes?: number;
}

export interface SaveNoteDTO {
  pathId: string;
  topicId: string;
  title: string;
  contentMarkdown: string;
  tags?: string[];
}

export interface CreatePracticeTaskDTO {
  pathId: string;
  topicId: string;
  title: string;
  instructions: string;
  type: PracticeTask['type'];
  verificationCriteria?: string;
}

export interface UpdatePracticeTaskDTO {
  status?: PracticeTask['status'];
  evidence?: string;
}

export interface IStudyForgeService {
  // Health & Dashboard
  getHealth(): Promise<{ status: string; timestamp: string }>;
  getDashboardStats(): Promise<DashboardStats>;

  // Learning Paths
  getLearningPaths(): Promise<LearningPath[]>;
  getLearningPathById(pathId: string): Promise<LearningPath | null>;
  createLearningPath(dto: CreateLearningPathDTO): Promise<LearningPath>;
  updateLearningPath(pathId: string, updates: Partial<LearningPath>): Promise<LearningPath>;
  deleteLearningPath(pathId: string): Promise<boolean>;

  // Seed Data
  seedLinuxDevOpsPath(): Promise<LearningPath>;

  // Modules & Topics
  createModule(dto: CreateModuleDTO): Promise<ModuleItem>;
  createTopic(dto: CreateTopicDTO): Promise<Topic>;
  updateTopic(topicId: string, updates: UpdateTopicDTO): Promise<Topic>;

  // Smart Notes
  getNoteByTopic(topicId: string): Promise<Note | null>;
  getAllNotes(filterTag?: string): Promise<Note[]>;
  saveNote(dto: SaveNoteDTO): Promise<Note>;
  deleteNote(noteId: string): Promise<boolean>;

  // Practice Tasks
  getPracticeTasksByTopic(topicId: string): Promise<PracticeTask[]>;
  getAllPracticeTasks(statusFilter?: PracticeTask['status']): Promise<PracticeTask[]>;
  createPracticeTask(dto: CreatePracticeTaskDTO): Promise<PracticeTask>;
  updatePracticeTask(taskId: string, updates: UpdatePracticeTaskDTO): Promise<PracticeTask>;

  // Spaced Review & Search
  getReviewQueue(): Promise<ReviewItem[]>;
  searchGlobal(query: string): Promise<GlobalSearchResult>;
}
