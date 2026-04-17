export type UserRole = "Admin" | "Teacher" | "Student";

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  school?: string;
  class?: string;
}

export type QuestionType = "MCQ" | "ShortAnswer" | "Essay";

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  correctKey?: string; // For MCQ/ShortAnswer
  rubric: string;
  maxMarks: number;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface Submission {
  id: string;
  studentId: string;
  studentName: string;
  questionId: string;
  questionText: string;
  answer: string;
  status: "Pending" | "Graded";
  score?: number;
  maxMarks: number;
  feedback?: string;
  gradedAt?: string;
  type: "MCQ" | "ShortAnswer" | "Essay";
}

export interface GradingResult {
  score: number;
  correctness_percentage: number;
  feedback: string;
  highlighted_errors?: string[];
  matched_keywords?: string[];
  strengths?: string[];
  weaknesses?: string[];
  suggested_improvement?: string;
}
