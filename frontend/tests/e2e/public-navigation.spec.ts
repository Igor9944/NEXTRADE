import { test, expect } from '@playwright/test';

test('public navigation supports localized desktop and mobile flows', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.route('**/api/v1/profile/me', (route) => route.fulfill({
    status: 401,
    contentType: 'application/json',
    headers: {
      'access-control-allow-origin': new URL(page.url()).origin,
      'access-control-allow-credentials': 'true',
    },
    body: JSON.stringify({ message: 'Unauthorized' }),
  }));

  await page.goto('/');

  const frenchNavigation = page.getByRole('navigation', { name: 'Navigation principale' });
  await expect(frenchNavigation.getByRole('link', { name: 'Logistique' }))
    .toHaveAttribute('href', '/#logistics');

  await page.getByRole('button', { name: 'Changer de langue' }).click();
  await page.getByRole('button', { name: 'English' }).click();

  const englishNavigation = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(englishNavigation.getByRole('link', { name: 'Features' }))
    .toHaveAttribute('href', '/#features');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(englishNavigation.getByRole('link', { name: 'Logistics' })).toBeVisible();
  await englishNavigation.getByRole('link', { name: 'Logistics' }).click();

  await expect(page).toHaveURL(/#logistics$/);
  await expect(page.locator('#logistics')).toBeInViewport();
  await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
  await expect(pageErrors).toEqual([]);
});
