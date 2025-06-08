#!/usr/bin/env tsx

import 'dotenv/config';

/**
 * Delete all records from bio namespace in Pinecone.
 *
 * Index: "flo"
 * Namespace: "bio"
 *
 * Usage:
 *   pnpm run delete-bio     # or npm run delete-bio / yarn delete-bio
 *
 * Environment variables required (see README or .env):
 *   PINECONE_API_KEY      – Pinecone secret key
 */

import process from 'node:process';

// External SDKs
import { Pinecone } from '@pinecone-database/pinecone';

// ────────────────────────────────────────────────────────────────────────────────
// Config ✏️ adjust if needed
// ────────────────────────────────────────────────────────────────────────────────
const INDEX_NAME = 'flo';
const NAMESPACE = 'bio';

// ────────────────────────────────────────────────────────────────────────────────
// Entry point
// ────────────────────────────────────────────────────────────────────────────────
async function main() {
  const { PINECONE_API_KEY } = process.env;

  // Basic runtime checks to fail early if something is missing
  if (!PINECONE_API_KEY) throw new Error('Missing PINECONE_API_KEY');

  // Initialise SDK client
  const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

  // Get index stats before deletion to see what we're deleting
  const index = pinecone.index(INDEX_NAME);
  const statsBefore = await index.describeIndexStats();
  const namespaceBefore = statsBefore.namespaces?.[NAMESPACE];

  if (!namespaceBefore || namespaceBefore.recordCount === 0) {
    console.log(`⚠️  Namespace '${NAMESPACE}' is already empty or doesn't exist`);
    return;
  }

  console.log(`📊 Found ${namespaceBefore.recordCount} records in namespace '${NAMESPACE}'`);

  // Delete all records in the namespace
  await index.namespace(NAMESPACE).deleteAll();
  console.log(`🗑️  Deleted all records from namespace '${NAMESPACE}' in index '${INDEX_NAME}'`);

  // Verify deletion by checking stats again
  const statsAfter = await index.describeIndexStats();
  const namespaceAfter = statsAfter.namespaces?.[NAMESPACE];

  if (!namespaceAfter || namespaceAfter.recordCount === 0) {
    console.log(`✔ Successfully cleared namespace '${NAMESPACE}'`);
  } else {
    console.log(
      `⚠️  Namespace still contains ${namespaceAfter.recordCount} records. Deletion may be in progress.`,
    );
  }
}

// Execute if called directly (node scripts/delete-bio.ts)
if (require.main === module) {
  main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}
