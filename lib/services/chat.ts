import type OpenAI from 'openai';
import { z } from 'zod';

import { getOpenAI } from '@/lib/clients/openai';
import { CHAT_CONFIG, SEARCH_BIO_TOOL } from '@/lib/config';
import { SYSTEM_PROMPT } from '@/lib/prompt';
import { runSearchBio } from '@/lib/services/search-bio';
import type { ChatMessage } from '@/types';

// Zod schemas for validation
const searchBioArgsSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
});

const openAIChoiceSchema = z.object({
  message: z.object({
    role: z.literal('assistant').optional(), // OpenAI response may not include role
    content: z.string().nullable(),
    tool_calls: z
      .array(
        z.object({
          id: z.string(),
          type: z.literal('function').optional(), // May not be present in response
          function: z.object({
            name: z.string(),
            arguments: z.string(),
          }),
        }),
      )
      .optional(),
  }),
});

const openAIResponseSchema = z.object({
  choices: z
    .array(openAIChoiceSchema)
    .min(1, 'OpenAI response must have at least one choice'),
});

export async function chat(messages: ChatMessage[]): Promise<string> {
  if (messages.length === 0) {
    throw new Error('No messages provided');
  }

  const openai = getOpenAI();
  const tools = [SEARCH_BIO_TOOL] satisfies OpenAI.ChatCompletionTool[];

  const messagesForOpenAI = [
    { role: 'system', content: SYSTEM_PROMPT } as const,
    ...messages,
  ] satisfies OpenAI.ChatCompletionMessageParam[];

  const firstResponse = await openai.chat.completions.create({
    model: CHAT_CONFIG.model,
    messages: messagesForOpenAI,
    tools,
    tool_choice: 'auto',
  });

  // Validate OpenAI response structure
  const validatedResponse = openAIResponseSchema.parse(firstResponse);
  const firstChoice = validatedResponse.choices[0];
  if (!firstChoice) {
    throw new Error('OpenAI returned no choices');
  }

  const firstMsg = firstChoice.message;

  const toolCall = firstMsg.tool_calls?.[0];
  if (toolCall) {
    // Validate tool arguments with Zod
    const rawArgs: unknown = JSON.parse(toolCall.function.arguments || '{}');
    const args = searchBioArgsSchema.parse(rawArgs);

    let searchResult: string;
    try {
      searchResult = await runSearchBio(args.query);
    } catch (err) {
      console.error('runSearchBio error', err);
      searchResult = CHAT_CONFIG.noContextMessage;
    }

    const followupMessages = [
      ...messagesForOpenAI,
      {
        role: 'assistant',
        content: firstMsg.content,
        tool_calls: firstMsg.tool_calls?.map(tc => ({
          id: tc.id,
          type: 'function' as const,
          function: tc.function,
        })),
      },
      {
        role: 'tool',
        name: 'search_bio',
        tool_call_id: toolCall.id,
        content: searchResult,
      },
    ] as unknown as OpenAI.ChatCompletionMessageParam[];

    const finalResp = await openai.chat.completions.create({
      model: CHAT_CONFIG.model,
      messages: followupMessages,
      tools,
      tool_choice: 'none',
    });

    // Validate final response structure
    const validatedFinalResponse = openAIResponseSchema.parse(finalResp);
    const finalChoice = validatedFinalResponse.choices[0];
    const assistantReply = finalChoice?.message.content ?? '';
    return assistantReply;
  }

  if (firstMsg.content === null) {
    return '';
  }
  return firstMsg.content;
}
