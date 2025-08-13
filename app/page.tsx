import { ChatInterface } from "@/components/chat/chat-interface";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, MessageSquare, Search, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-80 border-r bg-muted/30 p-6 hidden lg:block">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Anara Support</h1>
          </div>
          <p className="text-sm text-muted-foreground">AI-powered customer support assistant</p>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex gap-2">
                <Search className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium">Smart Retrieval</p>
                  <p className="text-xs text-muted-foreground">
                    Your query is refined and matched against our documentation
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Sparkles className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs font-medium">AI-Generated Answers</p>
                  <p className="text-xs text-muted-foreground">
                    Get accurate, contextual responses with source citations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-xs space-y-1 text-muted-foreground">
                <li>• Be specific in your questions</li>
                <li>• Ask about features, workflows, or troubleshooting</li>
                <li>• Check the sources for detailed information</li>
                <li>• You can continue the conversation naturally</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Example Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <button className="text-xs text-left w-full p-2 rounded hover:bg-muted transition-colors">
                  &quot;What file types does Anara support?&quot;
                </button>
                <button className="text-xs text-left w-full p-2 rounded hover:bg-muted transition-colors">
                  &quot;How do I organize my research library?&quot;
                </button>
                <button className="text-xs text-left w-full p-2 rounded hover:bg-muted transition-colors">
                  &quot;Can Anara generate flashcards from my documents?&quot;
                </button>
                <button className="text-xs text-left w-full p-2 rounded hover:bg-muted transition-colors">
                  &quot;What AI models are available in Anara?&quot;
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Theme toggle at bottom of sidebar */}
        <div className="absolute bottom-6 left-6">
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b px-6 py-4 bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:hidden">
              <Bot className="w-6 h-6 text-primary" />
              <h1 className="text-lg font-semibold">Anara Support</h1>
            </div>
            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold">Chat Assistant</h2>
              <p className="text-sm text-muted-foreground">
                Ask questions about Anara&apos;s features and capabilities
              </p>
            </div>
            <div className="lg:hidden">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Chat Interface */}
        <div className="flex-1 overflow-hidden">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}
