import { NextRequest, NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';
import { OpenAIApi, Configuration } from 'openai';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll('images') as File[];
  let ocrTexts: string[] = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
    ocrTexts.push(text);
  }

  const combinedText = ocrTexts.join('\n');

  // Use OpenAI to parse and fill in recipe details
  const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
  const openai = new OpenAIApi(configuration);
  const prompt = `Extract the recipe name, ingredients (as a list), and instructions (as a list of steps) from the following text. Fill in any missing or unclear information as needed.\n\n${combinedText}`;
  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that extracts and completes recipes from OCR text.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  });
  const responseText = completion.data.choices[0].message?.content || '';

  // Simple parsing: expect OpenAI to return JSON
  let recipe;
  try {
    recipe = JSON.parse(responseText);
  } catch {
    // fallback: return as description
    recipe = { title: 'Extracted Recipe', description: responseText };
  }

  return NextResponse.json(recipe);
} 