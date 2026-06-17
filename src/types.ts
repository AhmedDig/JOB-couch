export interface TaskItem {
  id: string;
  text: string;
  isCompleted: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  duration: string;
  checklist: TaskItem[];
  inspiration: string;
}

export interface GoalBlueprint {
  title: string;
  category: string;
  description: string;
  skills: string[];
  milestones: Milestone[];
  targetGoal: string;
  timeFrame: string;
  details?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ActionableRevision {
  originalText: string;
  suggestedText: string;
  reasoning: string;
}

export interface ResumeCritique {
  overallScore: number;
  strengths: string[];
  criticalGaps: string[];
  keywordGaps: string[];
  actionableRevisions: ActionableRevision[];
  targetRole?: string;
  isAnalyzed: boolean;
}

export interface InterviewTurn {
  question: string;
  answer?: string;
  evaluation?: string;
  score?: number;
  proTips?: string[];
}

export interface MockInterview {
  role: string;
  company: string;
  turns: InterviewTurn[];
  currentTurnIndex: number;
  isLoading: boolean;
  isCompleted: boolean;
  overallScore: number;
}

export interface InteractiveState {
  hasApiKey: boolean;
  selectedTab: "dashboard" | "coach" | "builder" | "resume" | "interview";
  activePlan: GoalBlueprint | null;
  chatHistory: Message[];
  resumeCritique: ResumeCritique | null;
  interviewSession: MockInterview | null;
}
