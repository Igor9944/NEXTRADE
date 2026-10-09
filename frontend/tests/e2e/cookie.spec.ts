import { test, expect } from '@playwright/test';

test.describe('Cookie HTTPOnly Verification', () => {
  test('should set HttpOnly cookie after login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input#login-email', 'demo.supplier@nextrade.test');
    await page.fill('input#login-password', 'ClientPass123!');
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();

    // Wait for successful supplier login
    await page.waitForURL(url => url.pathname === '/supplier/dashboard', { timeout: 10000 });

    // Get all cookies
    const cookies = await page.context().cookies();

    // Find the nextrade_session cookie
    const sessionCookie = cookies.find(cookie => cookie.name === 'nextrade_session');

    expect(sessionCookie).toBeTruthy();
    expect(sessionCookie?.httpOnly).toBe(true);
    // Secure should be false in development (since we're not using HTTPS)
    // In production it would be true
    expect(sessionCookie?.secure).toBe(false); // Development
    expect(sessionCookie?.sameSite).toBe('Lax'); // or 'Lax'
    expect(sessionCookie?.path).toBe('/');
  });

  test('should not be accessible via document.cookie', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input#login-email', 'demo.supplier@nextrade.test');
    await page.fill('input#login-password', 'ClientPass123!');
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();

    // Wait for successful supplier login
    await page.waitForURL(url => url.pathname === '/supplier/dashboard', { timeout: 10000 });

    // Try to access the cookie via JavaScript
    const cookieValue = await page.evaluate(() => {
      return document.cookie;
    });

    // The nextrade_session cookie should not be visible in document.cookie
    // because it's HttpOnly
    expect(cookieValue).not.toContain('nextrade_session');
  });
});