export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  marks: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  timeLimit: number; // in minutes
  negativeMarking: number; // points to deduct for a wrong answer
}

export interface Answer {
  questionId: string;
  selectedOption: string | null;
}

export interface QuizResult {
  username: string;
  quizTitle: string;
  quizId: string;
  score: number;
  correctAnswers: number;
  wrongAnswers: number;
  unattempted: number;
  timeTaken: number; // in seconds
  answers: Answer[];
}

export enum AppScreen {
  RoleSelection,
  TeacherLogin,
  TeacherDashboard,
  StudentDashboard,
  QuizEditor,
  TakeQuiz,
  Results,
  Leaderboard,
}
