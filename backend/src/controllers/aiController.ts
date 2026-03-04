import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const getModel = () => genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// POST /api/ai/summarize-notes
export const summarizeNotes = async (req: any, res: Response) => {
    try {
        const { notes } = req.body;
        if (!notes || notes.trim().length < 20) {
            return res.status(400).json({ message: 'Please provide notes with at least 20 characters.' });
        }

        const model = getModel();
        const prompt = `You are an expert academic tutor. A student has shared the following study notes. 
Please provide a clear, structured summary that helps them understand and remember the key concepts.
Format the response with:
- A brief overview (2-3 sentences)
- Key Points (as a bullet list of the most important concepts)
- Key Terms (important vocabulary with short definitions)

Student Notes:
${notes}`;

        const result = await model.generateContent(prompt);
        const summary = result.response.text();
        res.json({ summary });
    } catch (error: any) {
        res.status(500).json({ message: 'AI summarization failed. Please ensure GEMINI_API_KEY is set.', error: error.message });
    }
};

// POST /api/ai/generate-quiz
export const generateQuiz = async (req: any, res: Response) => {
    try {
        const { notes } = req.body;
        if (!notes || notes.trim().length < 20) {
            return res.status(400).json({ message: 'Please provide notes with at least 20 characters.' });
        }

        const model = getModel();
        const prompt = `You are an expert quiz generator. Based on the following study notes, generate exactly 5 multiple-choice quiz questions to help the student test their understanding.

IMPORTANT: Respond ONLY with valid JSON, no explanations or markdown. Use exactly this format:
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Brief explanation of why this is correct."
    }
  ]
}

Study Notes:
${notes}`;

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();

        // Strip markdown code fences if present
        text = text.replace(/^```json\n?/, '').replace(/^```\n?/, '').replace(/\n?```$/, '').trim();

        const quiz = JSON.parse(text);
        res.json(quiz);
    } catch (error: any) {
        res.status(500).json({ message: 'Quiz generation failed. Please ensure GEMINI_API_KEY is set.', error: error.message });
    }
};
