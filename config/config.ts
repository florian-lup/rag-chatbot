// Configuration interface
interface Config {
  openai: {
    apiKey: string;
    embeddingModel: string;
    answerModel: string;
  };
  pinecone: {
    apiKey: string;
    environment: string;
    indexName: string;
  };
  retrieval: {
    topK: number;
    minScore: number;
  };
  chunking: {
    minChunkSize: number;
    maxChunkSize: number;
    overlapLines: number;
  };
  chat: {
    maxConversationHistory: number;
    systemPrompt: string;
    fallbackErrorMessage: string;
    noResultsMessage: string;
  };
}

// Validated configuration (exported after validation)
export let config: Config;

// Get raw configuration (lazy loading - only read env vars when called)
function getRawConfig() {
  return {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      embeddingModel: "text-embedding-3-small",
      answerModel: "gpt-5-mini-2025-08-07",
    },
    pinecone: {
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
      indexName: process.env.PINECONE_INDEX_NAME,
    },
    retrieval: {
      topK: 10,
      minScore: 0.25,
    },
    chunking: {
      minChunkSize: 300, // Minimum characters per chunk
      maxChunkSize: 1500, // Maximum characters per chunk
      overlapLines: 2, // Lines to overlap between chunks
    },
    chat: {
      maxConversationHistory: 4,
      systemPrompt: `You are a helpful customer support assistant for Anara, an AI-enabled research workspace. Answer strictly from the "Context from documentation" and the conversation so far.

Rules:
1. Be concise, correct, and actionable. Default to under 120 words unless the user asks for more detail.
2. If the answer is not present in the context, say so explicitly and offer one clarifying question or a next step.
3. Do not invent features, links, dates, or policies. Never guess.
4. Use Markdown sparingly: short paragraphs, bulleted lists for steps, inline links, and fenced code blocks for commands or code (with a language tag) when helpful. Avoid overly long blocks.
5. When the question is ambiguous, ask exactly one clarifying question before proceeding.
6. Do not cite or mention the bracketed source IDs (e.g., [1]) or refer to "documentation context"; the UI will show sources.
7. Prefer step-by-step instructions for how-to questions; highlight prerequisites and caveats from the context.
8. Maintain a friendly, professional tone. Do not add filler like "As an AI".
9. If limits, requirements, or warnings appear in the context, call them out explicitly.
10. If no relevant information is retrieved, respond with the provided no-results message.
11. End responses declaratively when the user's question has been fully answered. Do not add unnecessary follow-up questions or offers to help with related tasks unless the answer is incomplete or the user explicitly asks for next steps.`,
      fallbackErrorMessage: "I apologize, but I couldn't generate an answer. Please try again.",
      noResultsMessage:
        "I couldn't find any relevant information in the documentation to answer your question. Could you please rephrase or provide more details?",
    },
  };
}

// Validate configuration
export function validateConfig() {
  // Get config lazily - this ensures env vars are read AFTER dotenv has loaded them
  const rawConfig = getRawConfig();

  const errors: string[] = [];

  if (!rawConfig.openai.apiKey) {
    errors.push("OPENAI_API_KEY is not set");
  }

  if (!rawConfig.pinecone.apiKey) {
    errors.push("PINECONE_API_KEY is not set");
  }

  if (!rawConfig.pinecone.environment) {
    errors.push("PINECONE_ENVIRONMENT is not set");
  }

  if (!rawConfig.pinecone.indexName) {
    errors.push("PINECONE_INDEX_NAME is not set");
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join("\n")}`);
  }

  // If validation passes, assign the properly typed config
  config = {
    openai: {
      apiKey: rawConfig.openai.apiKey!,
      embeddingModel: rawConfig.openai.embeddingModel,
      answerModel: rawConfig.openai.answerModel,
    },
    pinecone: {
      apiKey: rawConfig.pinecone.apiKey!,
      environment: rawConfig.pinecone.environment!,
      indexName: rawConfig.pinecone.indexName!,
    },
    retrieval: rawConfig.retrieval,
    chunking: rawConfig.chunking,
    chat: rawConfig.chat,
  };
}
