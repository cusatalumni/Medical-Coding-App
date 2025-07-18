
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface UserAnswer {
  questionId: number;
  answer: number; // The index of the selected option
}

export interface TestResult {
  testId: string;
  userId: string;
  testType: 'free' | 'paid';
  answers: UserAnswer[];
  score: number; // Percentage
  correctCount: number;
  totalQuestions: number;
  timestamp: number;
  review: AnswerReview[];
}

export interface AnswerReview {
    questionId: number;
    question: string;
    options: string[];
    userAnswer: number; // index of user's answer
    correctAnswer: number; // index of correct answer
}

export interface CertificateData {
    certificateNumber: string;
    candidateName: string;
    finalScore: number;
    date: string;
    totalQuestions: number;
}