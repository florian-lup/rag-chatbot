import { useState, useEffect, memo } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";

const messages = [
  "thinking...",
  "processing...",
  "analyzing...",
  "generating response...",
  "almost there..."
];

const StatusIndicatorComponent = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-3">
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="bg-secondary">
          <Loader2 className="size-4 animate-spin" />
        </AvatarFallback>
      </Avatar>

      <Card className="max-w-[70%] p-2 border-0 bg-background">
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground animate-pulse">
            {messages[messageIndex]}
          </span>
        </div>
      </Card>
    </div>
  );
};

export const StatusIndicator = memo(StatusIndicatorComponent);
