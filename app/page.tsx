import { ChatInterface } from "@/components/chat/chat-interface";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarInset className="flex flex-col h-full overflow-hidden">
      <div className="flex h-full flex-col">
        {/* Header */}
        <header className="border-b px-6 py-4 bg-background flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
            </div>
            <div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden min-h-0">
          <ChatInterface />
        </div>
      </div>
    </SidebarInset>
  );
}
