import { NextRequest, NextResponse } from 'next/server';
import type { ChatMessage, ChatApiError } from '@/types/chat';
import { z } from 'zod';
import { chat } from '@/app/actions/chat';

export async function POST(req: NextRequest) {
  const messageSchema = z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1),
  });
  const bodySchema = z.object({
    messages: z.array(messageSchema).min(1, 'No messages provided'),
  });

  const json = await req.json().catch((err) => {
    console.error('Failed to parse request body', err);
    const error: ChatApiError = { error: 'Invalid JSON payload' };
    return NextResponse.json(error, { status: 400 });
  });
  if (json instanceof NextResponse) return json;

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const error: ChatApiError = { error: parsed.error.message };
    return NextResponse.json(error, { status: 400 });
  }

  const { messages } = parsed.data as { messages: ChatMessage[] };

  try {
    const reply = await chat(messages);
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const error = err as Error;
    const resp: ChatApiError = { error: error.message || 'Server error' };
    return NextResponse.json(resp, { status: 500 });
  }
}
