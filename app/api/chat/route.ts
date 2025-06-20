import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { chat } from '@/lib/services/chat';
import type { ChatMessage, ChatApiError } from '@/types';

export async function POST(req: NextRequest) {
  const messageSchema = z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().min(1),
  });
  const bodySchema = z.object({
    messages: z.array(messageSchema).min(1, 'No messages provided'),
  });

  let json: unknown;
  try {
    json = await req.json();
  } catch (err: unknown) {
    console.error('Failed to parse request body', err);
    const error: ChatApiError = { error: 'Invalid JSON payload' };
    return NextResponse.json(error, { status: 400 });
  }

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

export const revalidate = 0; // no ISR
export const dynamic = 'force-dynamic';
