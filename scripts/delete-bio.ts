#!/usr/bin/env tsx

import 'dotenv/config';

/**
 * Delete all records from Pinecone background-context index.
 *
 * Index: "background-context"
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
const INDEX_NAME = 'background-context';

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
  const totalRecordsBefore = statsBefore.totalRecordCount || 0;

  if (totalRecordsBefore === 0) {
    console.log(`⚠️  Index '${INDEX_NAME}' is already empty`);
    return;
  }

  console.log(
    `📊 Found ${totalRecordsBefore} records in index '${INDEX_NAME}'`,
  );

  // Delete all records in the namespace
  await index.deleteAll();
  console.log(`🗑️  Deleted all records from index '${INDEX_NAME}'`);

  // Verify deletion by checking stats again
  const statsAfter = await index.describeIndexStats();
  const totalRecordsAfter = statsAfter.totalRecordCount || 0;

  if (totalRecordsAfter === 0) {
    console.log(`✔ Successfully cleared index '${INDEX_NAME}'`);
  } else {
    console.log(
      `⚠️  Index still contains ${totalRecordsAfter} records. Deletion may be in progress.`,
    );
  }
}

// Execute the main function
main().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

export { main };
