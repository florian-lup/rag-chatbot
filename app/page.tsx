import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const ChatInterface = dynamic(() => import('@/components/chat/chat').then((m) => m.ChatInterface), {
  ssr: false,
  loading: () => <div className="p-4">Loading chat…</div>,
});

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="p-4">Loading chat…</div>}>
        <ChatInterface />
      </Suspense>
    </div>
  );
}
