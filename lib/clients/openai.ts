import OpenAI from 'openai';

/**
 * OpenAI client factory function.
 *
 * Creates and returns a new OpenAI client instance.
 * The SDK automatically picks up the OPENAI_API_KEY environment variable when no apiKey is provided.
 *
 * This lazy initialization approach prevents the app from crashing on startup
 * if the API key is missing but OpenAI functionality isn't being used.
 */
export function getOpenAI(): OpenAI {
  return new OpenAI();
}
