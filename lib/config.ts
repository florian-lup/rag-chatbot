import { z } from 'zod';

const chatConfigSchema = z.object({
  model: z.literal('gpt-4.1-mini-2025-04-14'),
  embeddingModel: z.literal('text-embedding-3-small'),
  pineconeIndex: z.string().min(1),
  topK: z.number().positive(),
  noContextMessage: z.string().min(1),
});

export const CHAT_CONFIG = chatConfigSchema.parse({
  model: 'gpt-4.1-mini-2025-04-14' as const,
  embeddingModel: 'text-embedding-3-small' as const,
  pineconeIndex: 'background-context' as const,
  topK: 10,
  noContextMessage: 'No relevant context found.',
});

export const SEARCH_BIO_TOOL = {
  type: 'function',
  function: {
    name: 'search_bio',
    description:
      "Semantic search over Florian's bio knowledge base to retrieve relevant information.",
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Standalone search query derived from the user question.',
        },
      },
      required: ['query'],
    },
  },
} as const;
