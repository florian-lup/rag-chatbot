import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  // This will go to your localhost (uses baseURL from config)
  await page.goto('/');

  // Test your actual page title
  await expect(page).toHaveTitle(/Next.js Starter Kit/);
});

test('home page loads correctly', async ({ page }) => {
  await page.goto('/');

  // Test that the Next.js logo is visible
  await expect(page.getByAltText('Next.js logo')).toBeVisible();

  // Test that the scaffold description is visible
  await expect(page.getByText('A starter template for your Next.js project')).toBeVisible();

  // Test that the main action links are visible
  await expect(page.getByRole('link', { name: /Learn/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Docs/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Go to nextjs\.org/ })).toBeVisible();
});
