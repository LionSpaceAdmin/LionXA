import { toUIMessageStream } from '@ai-sdk/langchain';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createUIMessageStreamResponse } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Missing GOOGLE_GENERATIVE_AI_API_KEY' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const model = new ChatGoogleGenerativeAI({
    apiKey,
    model: 'gemini-1.5-flash',
    temperature: 0,
  });

  const parser = new StringOutputParser();

  const stream = await model.pipe(parser).stream(prompt);

  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream),
  });
}

