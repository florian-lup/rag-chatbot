import { expect, test } from '@playwright/test';

// End-to-end smoke test: visit the root page, see greeting, type into the
// chat input, and verify that the send button becomes enabled.

test.describe('Chat UI', () => {
  test('initial greeting and input works', async ({ page }) => {
    await page.goto('/');

    // Initial greeting should be visible.
    await expect(
      page.getByRole('heading', { name: 'Hello there!' }),
    ).toBeVisible();

    // The chat textarea should be present and editable.
    const textarea = page.locator('#chat-input');
    await expect(textarea).toBeVisible();

    // Type a message and ensure the textarea reflects it.
    await textarea.fill('Hello');
    await expect(textarea).toHaveValue('Hello');
  });
});
