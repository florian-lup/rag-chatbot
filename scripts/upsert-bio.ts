#!/usr/bin/env tsx

import 'dotenv/config';

/**
 * Upsert bio.md chunks into Pinecone.
 *
 * Index: "background-context"
 * Embedding model: text-embedding-3-small (1536-D, cosine)
 *
 * Usage:
 *   pnpm run upsert-bio          # or npm run upsert-bio / yarn upsert-bio
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
const INDEX_NAME = 'background-context';
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
    input: richChunks.map(c => c.text),
  })) as { data: { embedding: number[] }[] };

  // 3. Build vectors to upsert
  const vectors = embeddings.map((item, i) => {
    const chunk = richChunks[i];
    if (!chunk) {
      throw new Error(
        `richChunks[${i}] is undefined – lengths are out of sync`,
      );
    }

    return {
      id: sha256(chunk.text).slice(0, 16),
      values: item.embedding as number[],
      metadata: {
        text: chunk.text,
        source: 'bio.md',
        index: i,
      },
    };
  });

  // 4. Ensure the index exists (create if it doesn't)
  const listResponse = await pinecone.listIndexes();
  const indexes = Array.isArray(listResponse)
    ? listResponse
    : ((listResponse as { indexes?: any[] }).indexes ?? []);

  const indexExists = indexes.some(idx =>
    typeof idx === 'string' ? idx === INDEX_NAME : idx?.name === INDEX_NAME,
  );

  if (!indexExists) {
    console.log(`ℹ️  Index '${INDEX_NAME}' does not exist. Creating it...`);
    await pinecone.createIndex({
      name: INDEX_NAME,
      dimension: 1536, // text-embedding-3-small output dimensionality
      metric: 'cosine',
      spec: {
        serverless: {
          cloud: 'aws',
          region: 'us-east-1',
        },
      },
    });
    console.log(
      `✔ Created index '${INDEX_NAME}'. Waiting for it to be ready...`,
    );

    // Poll until the index becomes available
    let ready = false;
    while (!ready) {
      try {
        await pinecone.index(INDEX_NAME).describeIndexStats();
        ready = true;
      } catch (err) {
        // Index not ready yet; wait and retry
        await new Promise(res => setTimeout(res, 3000));
      }
    }
  }

  // 5. Upsert into Pinecone (default namespace)
  const index = pinecone.index(INDEX_NAME);
  await index.upsert(vectors);
  console.log(
    `✔ Upserted ${vectors.length} vectors into index '${INDEX_NAME}'`,
  );
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
    const line = lines[i]!; // non-null assertion (safe because i < lines.length)

    const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headingMatch) {
      // Start of a new chunk -> flush previous
      push();

      const level = headingMatch[1]!.length;
      const headingText = headingMatch[2]!.trim();

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

// Execute the main function
main().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

export { main, splitMarkdown };
