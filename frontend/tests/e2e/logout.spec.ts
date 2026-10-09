import { test, expect } from '@playwright/test';

test.describe('Logout Functionality', () => {
  test('should log out and clear session', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input#login-email', 'demo.supplier@nextrade.test');
    await page.fill('input#login-password', 'ClientPass123!');
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();

    // Wait for successful supplier login
    await page.waitForURL(url => url.pathname === '/supplier/dashboard', { timeout: 10000 });

    // Verify we're logged in
    await expect(page.getByRole('button', { name: /déconnexion|log out/i })).toBeVisible();

    // The response body is unavailable after the logout navigation replaces the page.
    const logoutResponsePromise = page.waitForResponse('**/api/v1/auth/logout');
    await page.getByRole('button', { name: /déconnexion|log out/i }).click();
    const logoutResponse = await logoutResponsePromise;

    // Verify the logout endpoint completed successfully.
    expect(logoutResponse.status()).toBe(200);
    expect(await page.context().cookies()).not.toContainEqual(
      expect.objectContaining({ name: 'nextrade_session' })
    );

    // Should be redirected to login page
    await page.waitForURL('**/login**');

    // Verify login form is visible again
    await expect(page.locator('input#login-email')).toBeVisible();
    await expect(page.getByRole('heading', { name: /connexion|sign in/i })).toBeVisible();
  });

  test('should not be able to access protected routes after logout', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input#login-email', 'demo.supplier@nextrade.test');
    await page.fill('input#login-password', 'ClientPass123!');
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();

    // Wait for successful supplier login
    await page.waitForURL(url => url.pathname === '/supplier/dashboard', { timeout: 10000 });

    // Log out
    await page.getByRole('button', { name: /déconnexion|log out/i }).click();
    await page.waitForURL('**/login**');

    // Try to access a protected supplier route directly
    await page.goto('/supplier/documents');

    // Should be redirected back to login
    await page.waitForURL('**/login**');
    await expect(page.locator('input#login-email')).toBeVisible();
  });

  test('should remain logged out after refresh', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input#login-email', 'demo.supplier@nextrade.test');
    await page.fill('input#login-password', 'ClientPass123!');
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();

    // Wait for successful supplier login
    await page.waitForURL(url => url.pathname === '/supplier/dashboard', { timeout: 10000 });

    // Log out
    await page.getByRole('button', { name: /déconnexion|log out/i }).click();
    await page.waitForURL('**/login**');

    // Refresh the page
    await page.reload();
    await page.waitForTimeout(2000);

    // Should still be on login page
    await page.waitForURL('**/login**');
    await expect(page.locator('input#login-email')).toBeVisible();
  });
});