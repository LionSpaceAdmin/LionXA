import { toUIMessageStream } from '@ai-sdk/langchain';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { createUIMessageStreamResponse, UIMessage } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

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

  const stream = await model.stream(
    messages.map((message) =>
      message.role === 'user'
        ? new HumanMessage(
            message.parts
              .map((part) => (part.type === 'text' ? part.text : ''))
              .join('')
          )
        : new AIMessage(
            message.parts
              .map((part) => (part.type === 'text' ? part.text : ''))
              .join('')
          )
    )
  );

  return createUIMessageStreamResponse({
    stream: toUIMessageStream(stream),
  });
}

