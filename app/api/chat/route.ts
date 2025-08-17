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
  const startTime = Date.now();
  console.log("\n🌐 CHAT API REQUEST DEBUG LOG:");
  console.log("===============================");
  console.log(`⏰ Request timestamp: ${new Date().toISOString()}`);

  try {
    const body = (await request.json()) as ChatApiRequest | unknown;
    // Narrow type
    const { message, conversationHistory = [] } =
      (body as ChatApiRequest) || ({} as ChatApiRequest);

    console.log(`📨 Request details:`);
    console.log(`   - Message: "${message}"`);
    console.log(
      `   - Message length: ${typeof message === "string" ? message.length : "N/A"} characters`,
    );
    console.log(
      `   - Conversation history length: ${Array.isArray(conversationHistory) ? conversationHistory.length : "N/A"} messages`,
    );

    if (!message || typeof message !== "string") {
      console.log("❌ Invalid message - not a string or empty");
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 },
      );
    }

    // Validate conversation history
    if (!Array.isArray(conversationHistory)) {
      console.log("❌ Invalid conversation history - not an array");
      return NextResponse.json({ error: "Conversation history must be an array" }, { status: 400 });
    }

    // Get RAG service instance
    const service = getRagService();

    console.log(`🚀 Starting RAG pipeline processing...`);

    // Process the query through the RAG pipeline
    const answer = await service.processQuery(message, conversationHistory as ChatMessage[]);

    const processingTime = Date.now() - startTime;
    console.log(`📤 Response prepared:`);
    console.log(`   - Answer length: ${answer.length} characters`);
    console.log(`   - Processing time: ${processingTime}ms`);
    console.log("===============================\n");

    // Return the response
    return NextResponse.json({
      success: true,
      data: {
        answer,
      },
    });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error("❌ Error in chat API:", error);
    console.log(`⏱️  Failed after ${processingTime}ms`);
    console.log("===============================\n");

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
