import { ArrowUp } from 'lucide-react';
import { memo } from 'react';

import { useEnterSubmit } from '@/hooks';

import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSendMessage: () => void;
  isTyping: boolean;
  hasMessages: boolean;
}

const ChatInputComponent = ({
  message,
  setMessage,
  onSendMessage,
  isTyping,
  hasMessages,
}: ChatInputProps) => {
  const handleKeyDown = useEnterSubmit(onSendMessage);

  function handleSendMessage() {
    if (!message.trim()) return;
    onSendMessage();
  }

  function handleChange(val: string) {
    setMessage(val);
  }

  return (
    <div className="mx-auto max-w-3xl p-4 pt-2">
      {/* Wrapper to allow positioning button inside the input container */}
      <div className="relative overflow-hidden rounded-md border">
        <Textarea
          id="chat-input"
          placeholder={
            hasMessages ? 'Ask a follow up question…' : 'Ask me anything…'
          }
          value={message}
          onChange={e => {
            handleChange(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          className="no-scrollbar max-h-60 min-h-36 w-full resize-none rounded-none border-none pr-12 shadow-none"
          rows={2}
          disabled={isTyping}
        />

        {/* Send button */}
        <Button
          size="icon"
          onClick={handleSendMessage}
          disabled={!message.trim() || isTyping}
          className="absolute right-3 bottom-3 z-10 size-9 rounded-full"
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </div>
  );
};

export const ChatInput = memo(ChatInputComponent);
