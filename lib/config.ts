export const CHAT_CONFIG = {
  model: 'o4-mini' as const,
  embeddingModel: 'text-embedding-3-small' as const,
  pineconeIndex: 'background-context' as const,
  topK: 10,
  noContextMessage: 'No relevant context found.',
} as const;

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
