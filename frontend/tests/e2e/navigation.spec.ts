import { test, expect } from '@playwright/test';

test.describe('Navigation Between Protected Routes', () => {
  test('should navigate between protected routes without losing session', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input#login-email', 'demo.supplier@nextrade.test');
    await page.fill('input#login-password', 'ClientPass123!');
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();

    // Wait for successful supplier login
    await page.waitForURL(url => url.pathname === '/supplier/dashboard', { timeout: 10000 });

    // Verify we're logged in
    await expect(page.getByRole('button', { name: /déconnexion|log out/i })).toBeVisible();

    // Navigate to supplier routes within the dedicated workspace
    const routesToTest = [
      '/supplier/dashboard',
      '/supplier/documents',
      '/supplier/notifications',
      '/supplier/profile'
    ];

    for (const route of routesToTest) {
      await page.goto(route);
      // Wait for page to load
      await page.waitForTimeout(1000);

      // Should still be logged in (logout button visible)
      await expect(page.getByRole('button', { name: /déconnexion|log out/i })).toBeVisible();

      // Should not see login prompt
      await expect(page.getByRole('heading', { name: /connexion|sign in/i })).not.toBeVisible();
    }
  });
});