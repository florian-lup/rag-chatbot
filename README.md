# RAG Chatbot

AI chatbot that utilizes Retrieval-Augmented Generation (RAG) to provide
contextually accurate responses. Built with Next.js, OpenAI & Pinecone.

## Features

- 🤖 **Intelligent Conversations**: AI-powered chat with memory
- 🔍 **Semantic Search**: Vector-based retrieval of relevant context
- 🎨 **Modern UI**: Clean, responsive interface with dark/light theme support

## Live Example

Check out a live example at
[https://www.florianlup.com](https://www.florianlup.com)

## Tech Stack

- **Next.js 15** + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **Radix UI** + **shadcn/ui**
- **OpenAI API** (language model + embeddings)
- **Pinecone** (vector database)

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- OpenAI API key
- Pinecone API key

### Installation

1. **Clone and install**

   ```bash
   git clone https://github.com/florian-lup/rag-chatbot
   cd rag-chatbot
   pnpm install
   ```

2. **Environment variables**

   Create `.env`:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   NEXT_PUBLIC_SITE_URL=your_site_url_here
   ```

3. **Prepare data and upload**

   Create `documents/bio.md` with your content, then:

   ```bash
   pnpm upsert-bio
   ```

4. **Run development server**

   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Pinecone Setup

The `background-context` index will be created automatically when you run
`pnpm upsert-bio`:

- **Dimensions**: 1536 (text-embedding-3-small)
- **Metric**: Cosine
- **Region**: us-east-1 (customizable via `PINECONE_REGION`)

## Project Structure

```
rag-chatbot/
├── app/                  # Next.js App Router
│   ├── api/chat/         # Chat API endpoint
│   └── page.tsx          # Main chat page
├── components/           # React components
│   ├── chat/             # Chat-specific components
│   └── ui/               # Reusable UI components
├── documents/bio.md      # Source data for RAG
├── scripts/              # Data management scripts
├── tests/                # Comprehensive test suite
└── lib/                  # Utilities and configs
├── hooks/                # Custom hooks
```

## Scripts

- `pnpm dev --turbopack` - Development server
- `pnpm build` - Production build
- `pnpm test` - Run Playwright tests
- `pnpm upsert-bio` - Upload data to Pinecone
- `pnpm delete-bio` - Clear Pinecone index
