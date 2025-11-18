# RAG Customer Support Chatbot

An intelligent AI-powered customer support chatbot built with Retrieval-Augmented Generation (RAG). The chatbot provides accurate answers to user questions by retrieving relevant information and leveraging OpenAI's GPT models.

## ✨ Features

- 🤖 **AI-Powered Responses**: Uses GPT-5-mini for generating contextual, accurate answers
- 🔍 **Semantic Search**: Intelligent document retrieval using OpenAI embeddings
- 📚 **Smart Document Chunking**: Optimized content chunking with configurable size and overlap
- 💾 **Vector Database**: Pinecone integration for fast similarity search
- 🎨 **Modern UI**: Clean chat interface with dark mode support
- 📝 **Live Changelog**: Sidebar displaying Anara's latest updates and improvements
- 🔄 **Conversation Memory**: Maintains context throughout chat sessions
- 🌐 **Web Scraping**: Automated documentation and changelog scrapers
- 📊 **Index Management**: Utilities for managing vector database

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **React**: 19.1.0
- **TypeScript**: Type-safe development
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui with Radix UI primitives
- **Markdown**: react-markdown with GitHub Flavored Markdown

### Backend & AI

- **AI Models**:
  - OpenAI `gpt-5-mini-2025-08-07` (answer generation)
  - OpenAI `text-embedding-3-small` (embeddings)
- **Vector Database**: Pinecone for semantic search
- **Runtime**: Node.js 18+

### Development Tools

- **Package Manager**: pnpm
- **Web Scraping**: Playwright for automated documentation scraping
- **Code Quality**: ESLint, Prettier
- **Analytics**: Vercel Analytics (production)

## 📋 Prerequisites

- Node.js 18 or higher
- pnpm package manager
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Pinecone account and API key ([Sign up here](https://www.pinecone.io/))

## 🚀 Setup Instructions

### 1. Clone and Install

```bash
git clone https://github.com/florian-lup/rag-chatbot
cd rag-chatbot
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Pinecone Configuration
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_ENVIRONMENT=your_pinecone_environment  # e.g., "us-east-1"
PINECONE_INDEX_NAME=anara-support-docs          # or your preferred index name
```

### 3. Create Pinecone Index

1. Go to [Pinecone Console](https://app.pinecone.io/)
2. Create a new index with these settings:
   - **Name**: `anara-support-docs` (or match your `PINECONE_INDEX_NAME`)
   - **Dimensions**: `1536` (for text-embedding-3-small)
   - **Metric**: `cosine`
   - **Cloud Provider**: Choose your preference
   - **Region**: Note this for `PINECONE_ENVIRONMENT`

### 4. Scrape and Index Documentation

The project includes utilities to scrape Anara's documentation and index it:

```bash
# Scrape the complete documentation from Anara's docs site
pnpm run scrape:guides

# Scrape the changelog from Anara's website
pnpm run scrape:changelog

# Index the scraped documentation into Pinecone
pnpm run index:docs
```

The indexing script will:

- Read documentation from `public/guides/anara-docs-complete.json`
- Split documents into optimized chunks (300-1500 characters)
- Generate embeddings using OpenAI
- Store vectors with metadata in Pinecone

### 5. Run the Development Server

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the chatbot interface.

## 📁 Project Structure

```
rag-chatbot/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── chat/                # Chat endpoint (RAG pipeline)
│   │   │   └── route.ts
│   │   └── changelog/           # Changelog API endpoint
│   │       └── route.ts
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Main chat page
│
├── components/                   # React components
│   ├── chat/
│   │   └── chat-interface.tsx   # Main chat UI component
│   ├── ui/                      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── sidebar.tsx
│   │   └── ...                  # Other UI primitives
│   ├── app-sidebar.tsx          # Changelog sidebar component
│   ├── theme-provider.tsx       # Dark mode provider
│   └── theme-toggle.tsx         # Theme switcher
│
├── config/
│   └── config.ts                # Application configuration
│
├── docs/                        # Sample markdown documentation
│   ├── concepts.md
│   ├── filetypes.md
│   └── welcome.md
│
├── hooks/
│   ├── hooks.ts                 # Custom React hooks
│   └── use-mobile.ts            # Mobile detection hook
│
├── lib/
│   ├── rag-service.ts           # RAG pipeline implementation
│   └── utils.ts                 # Utility functions
│
├── public/
│   ├── changelog/               # Scraped changelog data
│   │   └── changelog.json
│   └── guides/                  # Scraped documentation
│       ├── anara-docs-complete.json
│       ├── index.json
│       └── ...                  # Category-specific JSON files
│
├── scripts/                     # Utility scripts
│   ├── check-index.ts           # Check Pinecone index stats
│   ├── clear-index.ts           # Clear all vectors from index
│   ├── debug-scraper.ts         # Debug web scraping
│   ├── index-documents.ts       # Index docs into Pinecone
│   ├── scrape-changelog.ts      # Scrape Anara changelog
│   └── scrape-guides.ts         # Scrape Anara documentation
│
├── types/
│   └── types.ts                 # TypeScript type definitions
│
└── Configuration files
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── tailwind.config.ts
    └── components.json          # shadcn/ui config
```

## 🔄 How It Works

### RAG Pipeline Overview

1. **User Query** → Chat interface captures user input
2. **Embedding Generation** → Query is embedded using OpenAI's text-embedding-3-small
3. **Vector Search** → Pinecone retrieves top 10 most similar document chunks
4. **Context Building** → Retrieved chunks are formatted with metadata
5. **Answer Generation** → GPT-5-mini generates response using retrieved context
6. **Display** → Answer is rendered with markdown formatting

### Document Indexing Process

The indexing pipeline (`scripts/index-documents.ts`) implements intelligent chunking:

1. **Load Documentation**: Reads from `public/guides/anara-docs-complete.json`
2. **Smart Chunking**:
   - Splits content into chunks (300-1500 characters)
   - Maintains paragraph boundaries
   - Overlaps chunks by 2 lines for continuity
   - Combines small trailing chunks
3. **Context Enhancement**: Each chunk includes:
   - Category and title
   - Page description
   - Section information
4. **Batch Embedding**: Generates embeddings in batches of 20
5. **Vector Storage**: Upserts to Pinecone with rich metadata

### Configuration

Edit `config/config.ts` to customize behavior:

```typescript
// Retrieval settings
retrieval: {
  topK: 10,           // Number of chunks to retrieve
  minScore: 0.25,     // Minimum similarity threshold (0-1)
}

// Chunking strategy
chunking: {
  minChunkSize: 300,  // Minimum characters per chunk
  maxChunkSize: 1500, // Maximum characters per chunk
  overlapLines: 2,    // Lines to overlap between chunks
}

// Chat settings
chat: {
  maxConversationHistory: 4,  // Messages to keep in context
  systemPrompt: "...",        // System instructions for the AI
}
```

## 🔧 Available Scripts

### Development

```bash
pnpm run dev          # Start dev server with Turbopack
pnpm run build        # Build for production
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
pnpm run format       # Format code with Prettier
pnpm run format:check # Check formatting
```

### Documentation Management

```bash
pnpm run scrape:guides     # Scrape Anara documentation
pnpm run scrape:changelog  # Scrape Anara changelog
pnpm run index:docs        # Index scraped docs to Pinecone
pnpm run check:index       # Check Pinecone index statistics
pnpm run clear:index       # Clear all vectors from index
pnpm run debug:scraper     # Debug web scraping issues
```

## 🚀 Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Ensure these are set in your hosting platform:

```env
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=...
PINECONE_INDEX_NAME=...
NODE_ENV=production
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for [Anara](https://anara.com) - AI-enabled research workspace
- Powered by [OpenAI](https://openai.com) GPT models
- Vector search by [Pinecone](https://www.pinecone.io/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

---

**Note**: This chatbot is specifically configured for Anara's documentation. To adapt it for other use cases, update the scraping scripts, system prompt, and documentation sources accordingly.
