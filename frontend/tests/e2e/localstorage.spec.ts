import { test, expect } from '@playwright/test';

test.describe('LocalStorage Verification', () => {
  test('should not store auth tokens in localStorage after login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input#login-email', 'demo.supplier@nextrade.test');
    await page.fill('input#login-password', 'ClientPass123!');
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();

    // Wait for successful supplier login
    await page.waitForURL(url => url.pathname === '/supplier/dashboard', { timeout: 10000 });

    // Check localStorage
    const localStorageState = await page.evaluate(() => {
      return Object.assign({}, window.localStorage);
    });
    const sessionStorageState = await page.evaluate(() => {
      return Object.assign({}, window.sessionStorage);
    });

    // Verify auth tokens are NOT in localStorage
    expect(localStorageState.nextrade_token).toBeUndefined();
    expect(localStorageState.nextrade_user).toBeUndefined();
    expect(sessionStorageState.nextrade_token).toBeUndefined();
    expect(sessionStorageState.nextrade_user).toBeUndefined();

    // But language preferences may still be there
    // These are OK to have in localStorage
  });

  test('should clear localStorage auth tokens on logout', async ({ page }) => {
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

    // Check localStorage after logout
    const localStorageState = await page.evaluate(() => {
      return Object.assign({}, window.localStorage);
    });
    const sessionStorageState = await page.evaluate(() => {
      return Object.assign({}, window.sessionStorage);
    });

    // Verify auth tokens are NOT in localStorage
    expect(localStorageState.nextrade_token).toBeUndefined();
    expect(localStorageState.nextrade_user).toBeUndefined();
    expect(sessionStorageState.nextrade_token).toBeUndefined();
    expect(sessionStorageState.nextrade_user).toBeUndefined();
  });
});