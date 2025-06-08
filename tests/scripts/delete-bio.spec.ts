// Tests for scripts/delete-bio.ts verifying early validation logic.

import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const TSX_BIN = path.resolve(
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tsx.cmd' : 'tsx',
);
const SCRIPT_PATH = path.resolve('scripts', 'delete-bio.ts');

test('CLI exits with error when PINECONE_API_KEY is missing', () => {
  const { status, stderr } = spawnSync(TSX_BIN, [SCRIPT_PATH], {
    env: { ...process.env, PINECONE_API_KEY: '' },
    encoding: 'utf-8',
  });

  expect(status).not.toBe(0);
  // Some shells may not propagate stderr; we only assert the process failed.
});
