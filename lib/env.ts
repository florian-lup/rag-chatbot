import { z } from 'zod';

const envSchema = z.object({
  // Required API keys
  OPENAI_API_KEY: z.string().min(1, 'OpenAI API key is required'),
  PINECONE_API_KEY: z.string().min(1, 'Pinecone API key is required'),

  // Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Optional public variables
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  // Vercel environment
  VERCEL_ENV: z.enum(['production', 'preview', 'development']).optional(),
});

// Parse and validate environment variables
export const env = envSchema.parse(process.env);

// Type for validated environment
export type Env = z.infer<typeof envSchema>;
