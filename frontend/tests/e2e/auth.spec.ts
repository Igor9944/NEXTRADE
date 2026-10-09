import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login with valid credentials', async ({ page }) => {
    // Start from login page
    await page.goto('/login');

    // Fill in login form with the documented local demo account
    await page.fill('input#login-email', 'demo.supplier@nextrade.test');
    await page.fill('input#login-password', 'ClientPass123!');

    // Submit form
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();

    // Supplier users must enter their dedicated workspace
    await page.waitForURL(url => url.pathname === '/supplier/dashboard', { timeout: 10000 });

    // Verify we're logged in by checking for user-specific element
    await expect(page.getByRole('button', { name: /déconnexion|log out/i })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input#login-email', 'wrong@nextrade.test');
    await page.fill('input#login-password', 'WrongPassword');

    await page.getByRole('button', { name: /se connecter|sign in/i }).click();

    // Wait for error message
    await expect(page.getByRole('alert')).toBeVisible();
  });

  test('should apply right-to-left direction for Arabic', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input#login-email', 'demo.supplier@nextrade.test');
    await page.fill('input#login-password', 'ClientPass123!');
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();
    await page.waitForURL(url => url.pathname === '/supplier/dashboard', { timeout: 10000 });

    const languageSelect = page.getByRole('complementary').locator('select').first();
    for (const [language, direction] of [['en', 'ltr'], ['ar', 'rtl'], ['fr', 'ltr']] as const) {
      await languageSelect.selectOption(language);
      await expect(page.locator('html')).toHaveAttribute('lang', language);
      await expect(page.locator('html')).toHaveAttribute('dir', direction);
    }
  });

  test('should keep suppliers out of admin routes', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input#login-email', 'demo.supplier@nextrade.test');
    await page.fill('input#login-password', 'ClientPass123!');
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();
    await page.waitForURL(url => url.pathname === '/supplier/dashboard', { timeout: 10000 });

    await page.goto('/admin/dashboard');

    await expect(page).toHaveURL(/\/supplier\/dashboard$/);
    await expect(page.getByRole('heading', { name: /tableau de bord fournisseur/i })).toBeVisible();
  });
});