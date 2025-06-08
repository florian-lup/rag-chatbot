// Tests for scripts/upsert-bio.ts focusing on helper function and env validation.

import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const TSX_BIN = path.resolve(
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tsx.cmd' : 'tsx',
);
const SCRIPT_PATH = path.resolve('scripts', 'upsert-bio.ts');

test.describe('upsert-bio script', () => {
  test('CLI exits with error when required env vars are missing', () => {
    const { status, stderr } = spawnSync(TSX_BIN, [SCRIPT_PATH], {
      env: { ...process.env, OPENAI_API_KEY: '', PINECONE_API_KEY: '' },
      encoding: 'utf-8',
    });

    expect(status).not.toBe(0);
    // Only check that the script exits with non-zero status.
  });
});
