// Provide a dummy key before any OpenAI client gets instantiated.
process.env['OPENAI_API_KEY'] = process.env['OPENAI_API_KEY'] ?? 'test';

import { expect, test } from '@playwright/test';
import { openai } from '@/lib/openai';
import { POST } from '@/app/api/chat/route';

// Utility to prepare a NextRequest-compatible object. We only need a `json()`
// method that returns the supplied data.
function makeRequest(payload: unknown) {
  return {
    async json() {
      return payload;
    },
  } as any;
}

// Minimal stub for OpenAI's chat completions so that the underlying `chat()`
// action invoked by the route returns a deterministic response.
function stubOpenAIReply(text: string) {
  (openai as any).chat = {
    completions: {
      create: async () => ({
        choices: [
          {
            message: {
              role: 'assistant',
              content: text,
            },
          },
        ],
      }),
    },
  };
}

test.describe('POST /api/chat', () => {
  test('returns 400 for invalid payload', async () => {
    const req = makeRequest({ invalid: true });
    const res = await POST(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  test('returns the assistant reply for a valid request', async () => {
    const replyText = 'Hi there!';
    stubOpenAIReply(replyText);

    const req = makeRequest({
      messages: [
        {
          role: 'user',
          content: 'Hello!',
        },
      ],
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.reply).toBe(replyText);
  });
});
