import { Suspense } from 'react';
import dynamicImport from 'next/dynamic';

const ChatInterface = dynamicImport(
  () => import('@/components/chat/chat').then((m) => m.ChatInterface),
  {
    loading: () => <div className="p-4">Loading chat…</div>,
  },
);

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div className="p-4">Loading chat…</div>}>
        <ChatInterface />
      </Suspense>
    </div>
  );
}

export const dynamic = 'force-dynamic';
