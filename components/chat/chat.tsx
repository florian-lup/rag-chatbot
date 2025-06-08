'use client';

import { useState } from 'react';
import { ChatMessage as ChatMessageComponent } from '@/components/chat/messages';
import { StatusIndicator } from '@/components/chat/status-indicator';
import { SuggestedQuestions } from '@/components/chat/suggested-questions';
import { ChatInput } from '@/components/chat/input';
import { HelpDialog } from '@/components/chat/help';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/chat/header';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { useChat } from '@/hooks/useChat';

export function ChatInterface() {
  const [message, setMessage] = useState('');
  const { messages, isTyping, send, reset } = useChat();
  const messagesEndRef = useAutoScroll([messages, isTyping]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    await send(userMessage);
  };

  const handlePromptClick = async (prompt: string) => {
    const userMessage = prompt.trim();
    await send(userMessage);
    setMessage('');
  };

  const handleSendClick = () => {
    void handleSendMessage();
  };

  const handlePromptClickWrapper = (prompt: string) => {
    void handlePromptClick(prompt);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <Header hasMessages={messages.length > 0} onNewChat={reset} />

      {/* Main chat content area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-3xl mx-auto p-6 h-full">
          {messages.length === 0 ? (
            <div className="flex flex-col justify-center items-start h-full text-left">
              {/* Initial greeting when no messages exist */}
              <div className="space-y-3">
                <h1 className="text-4xl font-bold text-foreground">Hello there!</h1>
                <p className="text-xl text-muted-foreground">
                  How can I{' '}
                  <HelpDialog>
                    <Button variant="link">help</Button>
                  </HelpDialog>{' '}
                  you today?
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Display conversation history */}
              {messages.map((msg, index) => (
                <ChatMessageComponent key={index} role={msg.role} content={msg.content} />
              ))}
              {/* Show typing indicator when AI is responding */}
              {isTyping && <StatusIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Fixed input area at the bottom */}
      <div>
        {/* Show suggested questions above input only when no messages */}
        {messages.length === 0 && (
          <div className="max-w-3xl mx-auto p-4 pb-2">
            <SuggestedQuestions onPromptClick={handlePromptClickWrapper} />
          </div>
        )}

        {/* Input area */}
        <ChatInput
          message={message}
          setMessage={setMessage}
          onSendMessage={handleSendClick}
          isTyping={isTyping}
          hasMessages={messages.length > 0}
        />
      </div>
    </div>
  );
}
