import { test, expect } from '@playwright/test';

test.describe('Chat Functionality', () => {
  const BACKGROUND_QUESTION = "What's your background and experience?";
  test('should complete the core chat flow', async ({ page }) => {
    // 1. Navigate to the chat page
    await page.goto('/');

    // Verify we're on the chat page by checking for the greeting
    await expect(page.getByText('Hello there!')).toBeVisible();
    await expect(page.getByText('How can I help you today?')).toBeVisible();

    // 2. Click help
    await page.getByRole('button', { name: 'help' }).click();

    // Wait for the dialog to open by waiting for the dialog content
    await page.waitForSelector('[data-slot="dialog-content"]', {
      timeout: 5000,
    });

    // Verify the help dialog opened by checking for the dialog title
    await expect(
      page.getByRole('heading', { name: 'About this Website' }),
    ).toBeVisible();

    // Close the help dialog by clicking outside or pressing escape
    await page.keyboard.press('Escape');

    // Wait for dialog to close completely
    await page.waitForSelector('[data-slot="dialog-content"]', {
      state: 'hidden',
      timeout: 5000,
    });

    // 3. Click one of the 4 questions
    // Wait for suggested questions to be visible
    await expect(page.getByText(BACKGROUND_QUESTION)).toBeVisible();

    // Click the first question about background and experience
    await page.getByText(BACKGROUND_QUESTION).click();

    // Verify the question was sent and we're waiting for a response
    await expect(page.getByText(BACKGROUND_QUESTION)).toBeVisible();

    // Just wait a bit for the AI to respond
    await page.waitForTimeout(3000);

    // 4. Type in the textarea and press enter
    const chatInput = page.locator('#chat-input');
    await chatInput.fill('Can you tell me more about your technical skills?');
    await chatInput.press('Enter');

    // Verify the message was sent
    await expect(
      page.getByText('Can you tell me more about your technical skills?'),
    ).toBeVisible();

    // Just wait a bit for the AI to respond
    await page.waitForTimeout(3000);

    // 5. Click new chat
    // The "New Chat" button should now be visible in the header since we have messages
    await expect(page.getByRole('button', { name: 'New Chat' })).toBeVisible();
    await page.getByRole('button', { name: 'New Chat' }).click();

    // Verify we're back to the initial state
    await expect(page.getByText('Hello there!')).toBeVisible();
    await expect(page.getByText('How can I help you today?')).toBeVisible();

    // Verify suggested questions are visible again
    await expect(page.getByText(BACKGROUND_QUESTION)).toBeVisible();
    await expect(
      page.getByText('What kind of projects have you worked on?'),
    ).toBeVisible();
    await expect(
      page.getByText('What technologies do you specialize in?'),
    ).toBeVisible();
    await expect(
      page.getByText('What are your interests outside of work?'),
    ).toBeVisible();
  });
});
