import { GoogleGenAI, Type } from "@google/genai";
import { Question, GradingResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const gradingService = {
  async gradeMCQ(studentAnswer: string, correctAnswer: string, maxMarks: number): Promise<GradingResult> {
    const isCorrect = studentAnswer.trim().toUpperCase() === correctAnswer.trim().toUpperCase();
    return {
      score: isCorrect ? maxMarks : 0,
      correctness_percentage: isCorrect ? 100 : 0,
      feedback: isCorrect ? "Excellent! Correct answer." : `Incorrect. The correct answer was ${correctAnswer}.`,
      highlighted_errors: isCorrect ? [] : ["Answer does not match key"],
      matched_keywords: isCorrect ? [studentAnswer] : []
    };
  },

  async gradeShortAnswer(question: Question, studentAnswer: string): Promise<GradingResult> {
    // Attempt rule-based keyword matching first
    const keywords = question.correctKey?.toLowerCase().split(",") || [];
    const matched = keywords.filter(k => studentAnswer.toLowerCase().includes(k.trim().toLowerCase()));
    
    // If accuracy is high enough, we could return here, but for "90% target" we use AI as secondary or primary
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an experienced Kenyan secondary school teacher (Machakos County curriculum) grading student answers strictly according to the official KNEC marking scheme. Be fair, consistent, and objective. Output MUST be valid JSON only.
+
+Short-answer user prompt:
+Question: ${question.text} (Total: ${question.maxMarks} marks)
+Correct Answer Key: ${question.correctKey}
+Student Answer: ${studentAnswer}
+Rubric: ${question.rubric}
+
+Grade and return ONLY this JSON: {"score": number (0-${question.maxMarks}), "correctness_percentage": number (0-100), "feedback": "precise 1-sentence analysis", "matched_keywords": [...]}
+`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              correctness_percentage: { type: Type.NUMBER },
              feedback: { type: Type.STRING },
              highlighted_errors: { type: Type.ARRAY, items: { type: Type.STRING } },
              matched_keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["score", "correctness_percentage", "feedback"]
          }
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("AI Grading Error:", error);
      // Fallback to keyword matching
      const score = (matched.length / keywords.length) * question.maxMarks;
      return {
        score: Math.round(score),
        correctness_percentage: Math.round((matched.length / keywords.length) * 100),
        feedback: "Graded via keyword matching (AI fallback).",
        matched_keywords: matched
      };
    }
  },

  async gradeEssay(question: Question, essay: string): Promise<GradingResult> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an experienced Kenyan secondary school teacher (Machakos County curriculum) grading student answers strictly according to the official marking scheme and rubric provided. Be fair, consistent, and objective. Output MUST be valid JSON only.

Essay user prompt:
Question: ${question.text}
Marking Rubric (total ${question.maxMarks} marks): ${question.rubric}
Student Essay: ${essay}
Return ONLY this JSON: {"score": 0-100, "correctness_percentage": 0-100, "feedback": "2-4 helpful sentences", "strengths": [...], "weaknesses": [...], "suggested_improvement": "...", "highlighted_errors": [...]}
`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              correctness_percentage: { type: Type.NUMBER },
              feedback: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggested_improvement: { type: Type.STRING },
              highlighted_errors: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["score", "correctness_percentage", "feedback"]
          }
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("AI Essay Grading Error:", error);
      throw error;
    }
  }
};
