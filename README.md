# RAG Chatbot

AI chatbot that utilizes Retrieval-Augmented Generation (RAG) to provide contextually accurate responses based on biographical information. Built with Next.js, OpenAI & Pinecone.

## Features

- 🤖 **Intelligent Conversations**: AI-powered chat with personality and context awareness
- 🔍 **Semantic Search**: Vector-based retrieval of relevant biographical information
- 🎨 **Modern UI**: Clean, responsive interface with dark/light theme support

## Tech Stack

- **Next.js 15** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Modern component library
- **OpenAI API** - Language model and embeddings
- **Pinecone** - Vector database for semantic search

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- OpenAI API key
- Pinecone API key and index setup

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mirror-image
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   PINECONE_API_KEY=your_pinecone_api_key_here
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

4. **Prepare your biographical data**

   Create `documents/bio.md` with the biographical information you want the AI to reference.

5. **Upload biographical data to Pinecone**

   ```bash
   npm run upsert
   ```

   This script will:

   - Read your `bio.md` file
   - Split it into semantic chunks
   - Generate embeddings using OpenAI
   - Store the vectors in your Pinecone index

   **Optional: Clear existing data**

   ```bash
   npm run delete-bio
   ```

   Use this to delete all records from the `bio` namespace before uploading new data.

6. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

### Pinecone Setup

1. Create a Pinecone account and get your API key
2. Create an index with the following settings:
   - **Dimensions**: 1536 (for text-embedding-3-small)
   - **Metric**: Cosine
   - **Namespace**: `bio` (used automatically by the upsert script)

## Project Structure

```
rag-chatbot/
├── app/                      # Next.js App Router
│   ├── actions/             # Server actions
│   ├── api/                 # API routes
│   │   └── chat/           # Chat API endpoint
│   └── page.tsx            # Main chat page
├── components/              # React components
│   ├── chat/               # Chat-specific components
│   └── ui/                 # Reusable UI components
├── documents/              # Source documents for RAG
│   └── bio.md             # Biographical information
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries and configs
├── scripts/                # Utility scripts
│   ├── upsert-bio.ts      # Data upload script
│   └── delete-bio.ts      # Data deletion script
├── tests/                  # Test files
├── types/                  # TypeScript type definitions
├── components.json         # shadcn/ui configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies and scripts
├── playwright.config.ts    # Playwright test configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

## Testing

The project includes comprehensive test coverage using Playwright:

### Test Structure

```
tests/
├── actions/                # Unit tests for server actions
│   └── chat.spec.ts       # Tests for chat action with mocked OpenAI/Pinecone
├── api/                   # Unit tests for API routes
│   └── chat-route.spec.ts # Tests for /api/chat endpoint
├── scripts/               # Tests for utility scripts
│   ├── delete-bio.spec.ts # Tests for delete-bio script
│   └── upsert-bio.spec.ts # Tests for upsert-bio script
└── e2e/                   # End-to-end browser tests
    └── chat-flow.spec.ts  # UI interaction tests
```

### Running Tests

- `npm run test` - Run all Playwright tests
- `pnpm exec playwright test tests/actions` - Run action tests only
- `pnpm exec playwright test tests/api` - Run API tests only
- `pnpm exec playwright test tests/scripts` - Run script tests only
- `pnpm exec playwright test tests/e2e` - Run end-to-end tests only

### Test Coverage

- **Unit Tests**: Mock external dependencies (OpenAI, Pinecone) to test business logic
- **Integration Tests**: Test API endpoints with realistic request/response cycles
- **Script Tests**: Validate CLI tools handle missing environment variables gracefully
- **E2E Tests**: Browser-based tests ensuring UI components render and function correctly

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run all tests with Playwright
- `npm run upsert` - Upload biographical data to Pinecone
- `npm run delete-bio` - Delete all records from bio namespace in Pinecone

## Deployment

The application is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch
