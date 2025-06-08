import { Pinecone } from '@pinecone-database/pinecone';

/**
 * Pinecone client. When no apiKey is supplied, the SDK reads it from the PINECONE_API_KEY env var.
 */
export const pinecone = new Pinecone();
