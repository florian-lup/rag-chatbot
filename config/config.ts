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
}

// Validated configuration (exported after validation)
export let config: Config;

// Get raw configuration (lazy loading - only read env vars when called)
function getRawConfig() {
  return {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      embeddingModel: "text-embedding-3-small",
      answerModel: "gpt-5-2025-08-07",
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
  };
}
