#!/usr/bin/env tsx

import 'dotenv/config';

/**
 * Upsert bio.md chunks into Pinecone.
 *
 * Index: "flo"
 * Namespace: "bio"
 * Embedding model: text-embedding-3-small (1536-D, cosine)
 *
 * Usage:
 *   pnpm run upsert          # or npm run upsert / yarn upsert
 *
 * Environment variables required (see README or .env):
 *   OPENAI_API_KEY        – OpenAI secret key
 *   PINECONE_API_KEY      – Pinecone secret key
*/

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import process from 'node:process';

// External SDKs
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

// ────────────────────────────────────────────────────────────────────────────────
// Config ✏️ adjust if needed
// ────────────────────────────────────────────────────────────────────────────────
const INDEX_NAME = 'flo';
const NAMESPACE = 'bio';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const SOURCE_FILE = path.resolve('documents', 'bio.md');

// ────────────────────────────────────────────────────────────────────────────────
// Entry point
// ────────────────────────────────────────────────────────────────────────────────
async function main() {
  const { OPENAI_API_KEY, PINECONE_API_KEY } = process.env;

  // Basic runtime checks to fail early if something is missing
  if (!OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY');
  if (!PINECONE_API_KEY) throw new Error('Missing PINECONE_API_KEY');

  // Initialise SDK clients (both are lightweight)
  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

  // 1. Read markdown file
  const markdown = await fs.readFile(SOURCE_FILE, 'utf8');
  const richChunks = splitMarkdown(markdown); // { text, section }
  console.log(`Split markdown into ${richChunks.length} chunks`);

  // 2. Embed all chunk texts in one batch – OpenAI can handle up to 2048 inputs
  const { data: embeddings } = (await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: richChunks.map((c) => c.text),
  })) as { data: { embedding: number[] }[] };

  // 3. Build vectors to upsert
  const vectors = embeddings.map((item, i) => ({
    id: sha256(richChunks[i].text).slice(0, 16),
    values: item.embedding as number[],
    metadata: {
      text: richChunks[i].text,
      source: 'bio.md',
      index: i,
    },
  }));

  // 4. Upsert into Pinecone
  const index = pinecone.index(INDEX_NAME).namespace(NAMESPACE);
  await index.upsert(vectors);
  console.log(`✔ Upserted ${vectors.length} vectors into ${INDEX_NAME}/${NAMESPACE}`);
}

// ────────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────────
function sha256(text: string) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

interface RichChunk {
  text: string;
  section: string;
}

/**
 * Smarter markdown splitter that keeps a heading with its body until the next
 * heading appears.  It also tags each chunk with the nearest `##` section name
 * so we can later filter (e.g. section === "projects").
 */
function splitMarkdown(md: string): RichChunk[] {
  const approxTokenLimit = 400 * 4.5; // allow larger chunks (~400 tokens)

  const chunks: RichChunk[] = [];
  let buffer: string[] = [];
  let currentSection = 'general';

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/\[[^\]]+\]\([^\)]+\)/g, '') // remove markdown links
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

  const push = () => {
    if (buffer.length) {
      const text = buffer.join('\n').trim();
      if (text) chunks.push({ text, section: currentSection });
      buffer = [];
    }
  };

  const lines = md.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      // Start of a new chunk -> flush previous
      push();

      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();

      // Update current section label when we hit a level-2 heading (##)
      if (level === 2) {
        currentSection = slugify(headingText) || 'general';
      }

      buffer.push(line); // include the heading itself
    } else {
      buffer.push(line);
    }

    // If the buffer grows too large, force a cut (rare for bios)
    const charCount = buffer.reduce((acc, l) => acc + l.length, 0);
    if (charCount >= approxTokenLimit) push();
  }

  push();
  return chunks;
}

// Execute if called directly (node scripts/upsert-bio.ts)
if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
} 