import { NextRequest, NextResponse } from "next/server";
import { RAGService } from "@/lib/rag-service";
import type { ChatMessage, ChatApiRequest } from "@/types/types";

// Initialize RAG service
let ragService: RAGService | null = null;

function getRagService() {
  if (!ragService) {
    ragService = new RAGService();
  }
  return ragService;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatApiRequest | unknown;
    // Narrow type
    const { message, conversationHistory = [] } =
      (body as ChatApiRequest) || ({} as ChatApiRequest);

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 },
      );
    }

    // Validate conversation history
    if (!Array.isArray(conversationHistory)) {
      return NextResponse.json({ error: "Conversation history must be an array" }, { status: 400 });
    }

    // Get RAG service instance
    const service = getRagService();

    // Process the query through the RAG pipeline
    const answer = await service.processQuery(message, conversationHistory as ChatMessage[]);

    // Return the response
    return NextResponse.json({
      success: true,
      data: {
        answer,
      },
    });
  } catch (error) {
    console.error("❌ Error in chat API:", error);

    // Check if it's a configuration error
    if (error instanceof Error && error.message.includes("Configuration errors")) {
      return NextResponse.json(
        {
          error: "Service configuration error. Please check your environment variables.",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 },
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    // Try to initialize the service to check configuration
    getRagService();

    return NextResponse.json({
      status: "healthy",
      service: "chat-api",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        service: "chat-api",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
