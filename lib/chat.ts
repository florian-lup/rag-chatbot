'use server';

import type OpenAI from 'openai';

import { CHAT_CONFIG, SEARCH_BIO_TOOL } from '@/lib/config';
import { getOpenAI } from '@/lib/openai';
import { SYSTEM_PROMPT } from '@/lib/prompt';
import { runSearchBio } from '@/lib/search-bio';
import type { ChatMessage } from '@/types';

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

  const firstChoice = firstResponse.choices[0];
  if (!firstChoice) {
    throw new Error('OpenAI returned no choices');
  }

  const firstMsg = firstChoice.message;

  const toolCall = firstMsg.tool_calls?.[0];
  if (toolCall) {
    const args = JSON.parse(toolCall.function.arguments || '{}') as {
      query: string;
    };

    let searchResult: string;
    try {
      searchResult = await runSearchBio(args.query);
    } catch (err) {
      console.error('runSearchBio error', err);
      searchResult = CHAT_CONFIG.noContextMessage;
    }

    const followupMessages = [
      ...messagesForOpenAI,
      firstMsg,
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

    const finalChoice = finalResp.choices[0];
    const assistantReply = finalChoice?.message.content ?? '';
    return assistantReply;
  }

  if (firstMsg.content === null) {
    return '';
  }
  return firstMsg.content;
}
