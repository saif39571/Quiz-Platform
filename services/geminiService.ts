import { GoogleGenAI, Type } from "@google/genai";
import { Question } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function generateQuizQuestions(topic: string, numQuestions: number, numOptions: number): Promise<Question[]> {
  try {
    const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: `Generate ${numQuestions} multiple-choice questions about ${topic}. Each question must have exactly ${numOptions} options. Ensure one option is the correct answer.`,
       config: {
         responseMimeType: "application/json",
         responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                questionText: {
                  type: Type.STRING,
                  description: 'The text of the quiz question.',
                },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING,
                  },
                  description: `An array of ${numOptions} possible answers.`,
                },
                correctAnswer: {
                  type: Type.STRING,
                  description: 'The correct answer from the options array.',
                },
                marks: {
                    type: Type.NUMBER,
                    description: 'The number of marks for this question. Default is 1.',
                }
              },
              required: ["questionText", "options", "correctAnswer"],
            },
          },
       },
    });

    const jsonText = response.text;
    const questionsData = JSON.parse(jsonText);

    // Validate that options array has numOptions items, and correctAnswer is one of them.
    const validatedQuestions = questionsData.filter((q: any) => 
        Array.isArray(q.options) && q.options.length === numOptions && q.options.includes(q.correctAnswer)
    );

    if(validatedQuestions.length !== questionsData.length) {
        console.warn(`Some generated questions were filtered out due to invalid format. Expected ${numOptions} options per question.`);
    }
    
    if (validatedQuestions.length === 0 && questionsData.length > 0) {
        throw new Error("AI generated questions in a valid JSON but with invalid content (e.g., wrong number of options).");
    }

    return validatedQuestions.map((q: any, index: number) => ({
      ...q,
      id: `q-${Date.now()}-${index}`,
      marks: q.marks || 1,
    }));

  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw new Error("Failed to generate quiz questions from Gemini API.");
  }
}
