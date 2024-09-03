import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemPrompt = `You are an expert flashcard creator, specializing in generating concise, educational flashcards from given text. Follow these guidelines strictly:

1. Create exactly 10 flashcards from the provided text.
2. Each flashcard should have a 'front' and 'back' side.
3. The 'front' should be a question or prompt, and the 'back' should be the answer or explanation.
4. Both 'front' and 'back' must be single sentences, clear and concise.
5. Ensure that the content is accurate and directly related to the input text.
6. Cover key concepts, definitions, facts, or relationships from the text.
7. Avoid repetition across flashcards.
8. Use simple language, avoiding jargon unless it's essential to the subject.
9. For numerical facts, use the 'front' to ask about the number and the 'back' to provide it.
10. For cause-effect relationships, put the cause on the 'front' and the effect on the 'back'.
11. Only generate 10 flashcards, no more or less.
Return the flashcards in this exact JSON format:

{
  "flashcards": [
    {
      "front": "What is [concept/term/fact]?",
      "back": "[Clear, concise explanation or answer]"
    },
    // ... (8 more flashcards)
  ]
}

Ensure all JSON is valid and properly formatted.
IMPORTANT: Your response must be ONLY the JSON object. Do not include any other text before or after the JSON.`;

export async function POST(req) {
  try {
    // Parse the request body
    const body = await req.json(); // Ensure proper parsing
    const { text } = body;

    // Check if text exists
    if (!text) {
      return NextResponse.json({ error: 'Text is required to generate flashcards' }, { status: 400 });
    }

    // Initialize Google Generative AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5' });

    // Prepare the prompt
    const prompt = `${systemPrompt}\n\nHere's the text to create flashcards from:\n${text}`;

    // Generate content
    const result = await model.generateContent({ prompt });
    const responseText = await result.response.text();

    // Parse and validate response
    let flashcards;
    try {
      flashcards = JSON.parse(responseText);
      if (!Array.isArray(flashcards.flashcards) || flashcards.flashcards.length !== 10) {
        throw new Error('Invalid flashcards format or count');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return NextResponse.json({ error: 'Invalid response format from AI' }, { status: 500 });
    }

    // Return the flashcards
    return NextResponse.json(flashcards.flashcards);
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate flashcards' }, { status: 500 });
  }
}
