import { test, expect } from '@playwright/test';

test.describe('Login Response Verification', () => {
  test('should not contain JWT in login response body', async ({ page }) => {
    // Capture the real login request before submitting credentials
    await page.goto('/login');
    const loginResponse = page.waitForResponse('**/api/v1/auth/login');

    await page.fill('input#login-email', 'demo.supplier@nextrade.test');
    await page.fill('input#login-password', 'ClientPass123!');
    await page.getByRole('button', { name: /se connecter|sign in/i }).click();

    const response = await loginResponse;
    const responseBody = await response.json();

    // Verify that the response does NOT contain token fields
    expect(responseBody).not.toHaveProperty('token');
    expect(responseBody).not.toHaveProperty('accessToken');
    expect(responseBody).not.toHaveProperty('refreshToken');

    // But it should contain user info
    expect(responseBody).toHaveProperty('status', 'success');
    expect(responseBody).toHaveProperty('data');
    expect(responseBody.data).toHaveProperty('user');
  });
});
