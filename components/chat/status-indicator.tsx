import { Loader2 } from 'lucide-react';
import { useState, useEffect, memo } from 'react';

import { Avatar, AvatarFallback } from '../ui/avatar';
import { Card } from '../ui/card';

const messages = [
  'thinking...',
  'processing...',
  'analyzing...',
  'generating response...',
  'almost there...',
];

const StatusIndicatorComponent = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex gap-3">
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="bg-secondary">
          <Loader2 className="size-4 animate-spin" />
        </AvatarFallback>
      </Avatar>

      <Card className="bg-background max-w-[70%] border-0 p-2">
        <div className="flex items-center">
          <span className="text-muted-foreground animate-pulse text-sm leading-none">
            {messages[messageIndex]}
          </span>
        </div>
      </Card>
    </div>
  );
};

export const StatusIndicator = memo(StatusIndicatorComponent);
