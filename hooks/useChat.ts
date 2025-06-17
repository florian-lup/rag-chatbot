import { useState } from 'react';

import type { ChatMessage, ChatApiError } from '@/types';

interface UseChatReturn {
  messages: ChatMessage[];
  isTyping: boolean;
  send: (content: string) => Promise<void>;
  reset: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const send = async (content: string) => {
    if (!content.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: content.trim() };
    const history = [...messages, userMsg];
    setMessages(history);
    setIsTyping(true);

    let assistantReply = '';
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok) {
        const errorData: ChatApiError = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      assistantReply = data.reply || 'No response received';
    } catch (err: unknown) {
      const error = err as Error;
      assistantReply = error.message || 'Sorry, something went wrong.';
    }
    setMessages((prev: ChatMessage[]) => [
      ...prev,
      { role: 'assistant', content: assistantReply },
    ]);
    setIsTyping(false);
  };

  const reset = () => {
    setMessages([]);
    setIsTyping(false);
  };

  return { messages, isTyping, send, reset };
}
