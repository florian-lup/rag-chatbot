import OpenAI from 'openai';

/**
 * OpenAI client.
 *
 * The SDK automatically picks up the OPENAI_API_KEY environment variable when no apiKey is provided.
 */
export const openai = new OpenAI();
