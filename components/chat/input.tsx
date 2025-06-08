import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp } from "lucide-react";
import { useEnterSubmit } from "@/hooks/useEnterSubmit";

interface ChatInputProps {
  message: string;
  setMessage: (message: string) => void;
  onSendMessage: () => void;
  isTyping: boolean;
  hasMessages: boolean;
}

const ChatInputComponent = ({ message, setMessage, onSendMessage, isTyping, hasMessages }: ChatInputProps) => {
  const handleKeyDown = useEnterSubmit(onSendMessage);

  function handleSendMessage() {
    if (!message.trim()) return;
    onSendMessage();
  }

  function handleChange(val: string) {
    setMessage(val);
  }

  return (
    <div className="max-w-3xl mx-auto p-4 pt-2">
      {/* Composite input: textarea + footer */}
      <div className="rounded-md border overflow-hidden p-2">
        {/* Text area */}
        <Textarea
          id="chat-input"
          placeholder={hasMessages ? "Ask a follow up question…" : "Ask me anything…"}
          value={message}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full resize-none border-none rounded-none p-3 min-h-[72px] max-h-40 shadow-none"
          rows={2}
          disabled={isTyping}
        />

        {/* Footer */}
        <div className="flex justify-end gap-2 p-2">
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!message.trim() || isTyping}
            className="size-9 rounded-full"
          >
            <ArrowUp className="size-4" />
          </Button>
          {/* Future buttons can be added here */}
        </div>
      </div>
    </div>
  );
};

export const ChatInput = memo(ChatInputComponent);
