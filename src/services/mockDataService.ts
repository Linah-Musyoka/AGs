import { Submission, Question } from "../types";

export const mockQuestions: Question[] = [
  {
    id: "q1",
    type: "MCQ",
    text: "What is the capital of Kenya?",
    correctKey: "B",
    rubric: "Score 2 for B, 0 otherwise.",
    maxMarks: 2,
    topic: "Geography",
    difficulty: "Easy"
  },
  {
    id: "q2",
    type: "ShortAnswer",
    text: "Name one function of a leaves in a plant.",
    correctKey: "photosynthesis, gaseous exchange, transpiration",
    rubric: "Award 1 mark for any correct biological function.",
    maxMarks: 1,
    topic: "Biology",
    difficulty: "Medium"
  },
  {
    id: "q3",
    type: "Essay",
    text: "Discuss the impacts of global warming on Kenyan agriculture.",
    rubric: "Max 20 marks. Content: 8, Language: 6, Organization: 6. Look for mentions of drought, crop failure, irrigation.",
    maxMarks: 20,
    topic: "Environment",
    difficulty: "Hard"
  }
];

export function generateMockSubmissions(count: number): Submission[] {
  const submissions: Submission[] = [];
  for (let i = 0; i < count; i++) {
    const qIndex = i % mockQuestions.length;
    const q = mockQuestions[qIndex];
    submissions.push({
      id: `s${i}`,
      studentId: `st${i % 10}`,
      studentName: `Student ${i % 10}`,
      questionId: q.id,
      questionText: q.text,
      answer: q.type === "MCQ" ? (Math.random() > 0.5 ? q.correctKey! : "A") : (q.type === "ShortAnswer" ? "Plants use leaves for photosynthesis." : "Global warming has led to unpredictable rainfall patterns in Kenya. This has caused massive crop failures in areas like Kitui and Machakos..."),
      status: "Pending",
      maxMarks: q.maxMarks,
      type: q.type
    });
  }
  return submissions;
}
