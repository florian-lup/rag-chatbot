# Anara Support - AI RAG Customer Support Chatbot

An intelligent customer support chatbot that uses Retrieval-Augmented Generation (RAG) to answer questions based on your product documentation.

## Features

- 🤖 **AI-Powered Responses**: Uses GPT-4 for generating accurate, contextual answers
- 🔍 **Smart Retrieval**: Query rewriting with GPT-4o-mini for better document matching
- 📚 **Semantic Search**: Document chunking by headings with OpenAI embeddings
- 💾 **Vector Database**: Pinecone integration for efficient similarity search
- 🎨 **Modern UI**: Clean, responsive chat interface with dark mode support
- 📝 **Source Citations**: Every answer includes references to source documentation
- 🔄 **Conversation Memory**: Maintains context throughout the chat session

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui with Radix UI
- **AI/ML**: OpenAI GPT-4, text-embedding-3-small
- **Vector Database**: Pinecone
- **Document Processing**: LangChain, markdown-it

## Prerequisites

- Node.js 18+ and pnpm
- OpenAI API key
- Pinecone account and API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo>
cd anara-support
pnpm install
```

### 2. Configure Environment Variables

Copy the example environment file and add your API keys:

```bash
cp env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment_here  # e.g., "us-east-1"
PINECONE_INDEX_NAME=customer-support-rag

# Model Configuration (optional - these are defaults)
EMBEDDING_MODEL=text-embedding-3-small
QUERY_REWRITE_MODEL=gpt-4o-mini
ANSWER_MODEL=gpt-4o
```

### 3. Create Pinecone Index

1. Go to [Pinecone Console](https://console.pinecone.io/)
2. Create a new index with these settings:
   - **Name**: `customer-support-rag` (or match your PINECONE_INDEX_NAME)
   - **Dimensions**: `1536` (for text-embedding-3-small)
   - **Metric**: `cosine`
   - **Cloud Provider**: Choose your preference
   - **Environment**: Note this for PINECONE_ENVIRONMENT

### 4. Index Your Documentation

The system will process all markdown files in the `docs/` directory:

```bash
pnpm run index:docs
```

This script will:

- Read all `.md` files from the `docs/` directory
- Split documents by semantic boundaries (headings)
- Generate embeddings using OpenAI
- Store vectors in Pinecone

You should see output like:

```
🚀 Starting document indexing...
Found 3 markdown files to index
Processing welcome.md...
  - Created 5 chunks
...
✅ Indexing complete!
Indexed 15 chunks from 3 files
```

### 5. Run the Application

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the chat interface.

## Project Structure

```
anara-support/
├── app/
│   ├── api/
│   │   └── chat/         # Chat API endpoint
│   ├── layout.tsx        # Root layout with theme provider
│   └── page.tsx          # Main chat interface page
├── components/
│   ├── chat/
│   │   └── chat-interface.tsx  # Main chat UI component
│   ├── ui/               # shadcn/ui components
│   └── theme-*.tsx       # Theme toggle components
├── docs/                 # Your documentation (markdown files)
├── lib/
│   ├── config.ts         # Configuration management
│   ├── rag-service.ts    # RAG pipeline implementation
│   └── utils.ts          # Utility functions
├── scripts/
│   └── index-documents.ts  # Document indexing script
└── types/                # TypeScript type definitions
```

## How It Works

### 1. Document Indexing Pipeline

- Reads markdown files from `docs/` directory
- Splits by semantic boundaries (H1, H2 headings)
- Generates embeddings with OpenAI's text-embedding-3-small
- Stores in Pinecone with metadata (source, section, subsection)

### 2. Query Processing (RAG Pipeline)

- **Query Rewriting**: User input is refined using GPT-4o-mini for better retrieval
- **Embedding**: Rewritten query is embedded using the same model
- **Retrieval**: Top 10 most similar chunks retrieved from Pinecone
- **Answer Generation**: GPT-4 generates response using retrieved context

### 3. Chat Interface

- Real-time message streaming
- Source attribution with relevance scores
- Conversation history maintained for context
- Responsive design with dark mode support

## Adding Your Documentation

1. Add markdown files to the `docs/` directory
2. Use proper heading hierarchy:
   - `# H1` - Main sections
   - `## H2` - Subsections (creates new chunks)
   - `### H3` - Sub-subsections (included in parent chunk)
3. Run `pnpm run index:docs` to update the index

## API Endpoints

### POST /api/chat

Send a message and get an AI response.

**Request:**

```json
{
  "message": "What file types does Anara support?",
  "conversationHistory": []
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "answer": "Anara supports a wide range of file types...",
    "sources": [
      {
        "text": "Document preview...",
        "source": "filetypes.md",
        "section": "Documents",
        "score": 0.92
      }
    ]
  }
}
```

## Customization

### Adjust Retrieval Settings

Edit `lib/config.ts`:

```typescript
retrieval: {
  topK: 10,        // Number of chunks to retrieve
  minScore: 0.7,   // Minimum similarity score
}
```

### Change Chunking Strategy

Edit `lib/config.ts`:

```typescript
chunking: {
  chunkSize: 1000,     // Max chunk size
  chunkOverlap: 200,   // Overlap between chunks
}
```

### Use Different Models

Update environment variables:

```env
EMBEDDING_MODEL=text-embedding-ada-002
QUERY_REWRITE_MODEL=gpt-3.5-turbo
ANSWER_MODEL=gpt-4-turbo-preview
```

## Troubleshooting

### "Configuration errors" on startup

- Ensure all environment variables are set correctly
- Check API keys are valid
- Verify Pinecone index exists with correct dimensions (1536)

### No results returned

- Verify documents are indexed: `pnpm run index:docs`
- Check Pinecone dashboard for vector count
- Lower `minScore` in `lib/config.ts`

### Slow responses

- Consider using faster models (gpt-3.5-turbo)
- Reduce `topK` value for fewer retrievals
- Check Pinecone region proximity

## Production Deployment

1. Set environment variables in your hosting platform
2. Run indexing script after deploying documentation updates
3. Consider implementing:
   - Rate limiting
   - Authentication
   - Analytics tracking
   - Error monitoring
   - Caching for common queries

## License

MIT

## Support

For issues or questions, please open a GitHub issue or contact support.
