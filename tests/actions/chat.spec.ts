// Ensure a dummy key is present *before* any OpenAI client is instantiated.
process.env['OPENAI_API_KEY'] = process.env['OPENAI_API_KEY'] ?? 'test';

import { expect, test } from '@playwright/test';
import { openai } from '@/lib/openai';
import { pinecone } from '@/lib/pinecone';

// Helper to reset object properties between tests
function resetMocks() {
  delete (openai as any).chat;
  delete (openai as any).embeddings;
}

/**
 * Creates a minimal stub for OpenAI's chat completions endpoint that returns the
 * provided array of messages on successive invocations.
 */
function stubChatCompletions(returnValues: Array<any>) {
  let call = 0;
  (openai as any).chat = {
    completions: {
      create: async () => returnValues[Math.min(call++, returnValues.length - 1)],
    },
  };
}

/**
 * Creates a minimal stub for OpenAI's embedding endpoint – it only needs to
 * return an object with the expected shape for the code under test.
 */
function stubEmbeddings() {
  (openai as any).embeddings = {
    create: async () => ({
      data: [
        {
          embedding: [0.1, 0.2, 0.3],
        },
      ],
    }),
  };
}

/**
 * Stubs Pinecone so that `pinecone.index('flo').namespace('bio').query(...)` returns
 * a deterministic match array.
 */
function stubPinecone() {
  (pinecone as any).index = () => ({
    namespace: () => ({
      query: async () => ({
        matches: [
          {
            metadata: { text: 'He is a really great developer.' },
          },
        ],
      }),
    }),
  });
}

test.describe('chat() action utility', () => {
  test.beforeEach(() => {
    resetMocks();
    stubEmbeddings();
    stubPinecone();
  });

  test('throws when called with an empty message array', async () => {
    const { chat } = await import('@/app/actions/chat');
    await expect(chat([])).rejects.toThrow('No messages provided');
  });

  test('returns the assistant reply when no tool call is present', async () => {
    stubChatCompletions([
      {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Hello world! 👋',
            },
          },
        ],
      },
    ]);

    const { chat } = await import('@/app/actions/chat');
    const reply = await chat([{ role: 'user', content: 'Say hello' } as any]);

    expect(reply).toBe('Hello world! 👋');
  });

  test('handles a tool call and returns the follow-up assistant reply', async () => {
    stubChatCompletions([
      {
        choices: [
          {
            message: {
              role: 'assistant',
              tool_calls: [
                {
                  id: 'toolcall-1',
                  function: {
                    name: 'search_bio',
                    arguments: JSON.stringify({ query: 'Who is Florian?' }),
                  },
                },
              ],
            },
          },
        ],
      },
      {
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Florian is a seasoned developer with a knack for witty remarks.',
            },
          },
        ],
      },
    ]);

    const { chat } = await import('@/app/actions/chat');
    const reply = await chat([{ role: 'user', content: 'Tell me about Florian.' } as any]);

    expect(reply).toBe('Florian is a seasoned developer with a knack for witty remarks.');
  });
});
