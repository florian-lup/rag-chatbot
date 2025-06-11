import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import type { ChatMessage as ChatMessageType } from '@/types';

import { Card } from '../ui/card';

function ChatMessageComponent({ role, content }: ChatMessageType) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="flex flex-row-reverse gap-3">
        <Card className="bg-muted w-fit max-w-[90%] border-none p-2 shadow-none sm:max-w-[70%]">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Card className="bg-background w-full flex-1 border-none p-2 shadow-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className="prose prose-sm dark:prose-invert max-w-none break-words"
          components={{
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            a: ({ node: _unused, ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:opacity-80"
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </Card>
    </div>
  );
}

export const ChatMessage = memo(ChatMessageComponent);
