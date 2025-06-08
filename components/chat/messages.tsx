import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

function ChatMessageComponent({ role, content }: ChatMessageType) {
  const isUser = role === 'user';

  if (isUser) {
    return (
      <div className="flex gap-3 flex-row-reverse">
        <Card className="w-fit max-w-[90%] sm:max-w-[70%] bg-muted p-2 border-none shadow-none">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Avatar className="size-8 shrink-0 hidden sm:block self-start">
        <AvatarFallback className="bg-secondary">
          <Sparkles className="size-4" />
        </AvatarFallback>
      </Avatar>
      <Card className="w-full flex-1 bg-background p-2 border-none shadow-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          className="prose prose-sm dark:prose-invert break-words max-w-none"
          components={{
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            a: ({ node: _unused, ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-primary hover:opacity-80"
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
