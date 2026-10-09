import { test, expect } from '@playwright/test';

test.describe('Session Persistence', () => {
  test('should maintain session after page refresh', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input#login-email', 'demo.supplier@nextrade.test');
    await page.fill('input#login-password', 'ClientPass123!');
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();

    // Wait for successful supplier login
    await page.waitForURL(url => url.pathname === '/supplier/dashboard', { timeout: 10000 });

    // Verify we're logged in
    await expect(page.getByRole('button', { name: /déconnexion|log out/i })).toBeVisible();

    // Refresh the page
    await page.reload();

    // Wait for page to reload and initializeSession to run
    await page.waitForTimeout(2000);

    // Should still be logged in
    await expect(page.getByRole('button', { name: /déconnexion|log out/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /connexion|sign in/i })).not.toBeVisible();
  });

  test('should restore session on direct navigation to protected route', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input#login-email', 'demo.supplier@nextrade.test');
    await page.fill('input#login-password', 'ClientPass123!');
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();

    // Wait for successful supplier login
    await page.waitForURL(url => url.pathname === '/supplier/dashboard', { timeout: 10000 });

    // Get the cookies to verify they're set
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'nextrade_session');
    expect(sessionCookie).toBeTruthy();

    // Now navigate directly to a protected supplier route
    await page.goto('/supplier/documents');

    // Should be able to access the page without redirect to login
    await expect(page.getByRole('link', { name: 'Documents', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: /connexion|sign in/i })).not.toBeVisible();
  });
});