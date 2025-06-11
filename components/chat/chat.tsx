'use client';

import { useState } from 'react';

import { useAutoScroll, useChat } from '@/hooks';

import { Button } from '../ui/button';

import { Header } from './header';
import { HelpDialog } from './help';
import { ChatInput } from './input';
import { ChatMessage as ChatMessageComponent } from './messages';
import { StatusIndicator } from './status-indicator';
import { SuggestedQuestions } from './suggested-questions';

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
    <div className="flex h-screen flex-col">
      {/* Header */}
      <Header hasMessages={messages.length > 0} onNewChat={reset} />

      {/* Main chat content area */}
      <div className="no-scrollbar flex-1 overflow-y-auto">
        <div className="mx-auto h-full max-w-3xl p-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-start justify-center text-left">
              {/* Initial greeting when no messages exist */}
              <div className="space-y-3">
                <h1 className="text-foreground text-4xl font-bold">
                  Hello there!
                </h1>
                <p className="text-muted-foreground text-xl">
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
                <ChatMessageComponent
                  key={index}
                  role={msg.role}
                  content={msg.content}
                />
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
          <div className="mx-auto max-w-3xl p-4 pb-2">
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
