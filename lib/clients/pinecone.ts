import { Pinecone } from '@pinecone-database/pinecone';

/**
 * Pinecone client factory function.
 *
 * Creates and returns a new Pinecone client instance.
 * When no apiKey is supplied, the SDK reads it from the PINECONE_API_KEY env var.
 *
 * This lazy initialization approach prevents the app from crashing on startup
 * if the API key is missing but Pinecone functionality isn't being used.
 */
export function getPinecone(): Pinecone {
  return new Pinecone();
}
