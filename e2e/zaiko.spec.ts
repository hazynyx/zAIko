import { test, expect } from '@playwright/test';

test.describe('zAIko Application', () => {
  test('should run the complete user flow', async ({ page }) => {
    // 1. Auth Flow
    await page.goto('/login');
    
    // Fill credentials
    await page.fill('input[type="email"]', 'admin@zaiko.ai');
    await page.fill('input[type="password"]', 'zaiko123');
    await page.click('button[type="submit"]');

    // Verify redirection and toast
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Successfully logged in')).toBeVisible();

    // 2. Bento Grid Verification (Dashboard)
    await expect(page.locator('h1', { hasText: 'Dashboard' })).toBeVisible();
    await expect(page.locator('text=Total Inventory Value')).toBeVisible();
    await expect(page.locator('text=Active Alerts')).toBeVisible();
    await expect(page.locator('text=ML Forecast Accuracy')).toBeVisible();
    await expect(page.locator('text=Quick Actions')).toBeVisible();

    // 3. Navigation and Heading Assertion
    
    // Inventory Page
    await page.click('text=Live Inventory');
    await expect(page).toHaveURL('/inventory');
    await expect(page.locator('h1', { hasText: 'Live Inventory' })).toBeVisible();
    
    // Forecasts Page
    await page.click('text=Forecasts');
    await expect(page).toHaveURL('/forecasts');
    await expect(page.locator('h1', { hasText: 'Demand Forecasts' })).toBeVisible();
    
    // Simulator Page
    await page.click('text=Simulator');
    await expect(page).toHaveURL('/simulator');
    await expect(page.locator('h1', { hasText: 'What-If Simulator' })).toBeVisible();

    // 4. Interaction (Optimizations)
    await page.click('text=Optimizations');
    await expect(page).toHaveURL('/optimizations');
    await expect(page.locator('h1', { hasText: 'AI Optimizations' })).toBeVisible();
    
    // Click 'Approve' on the first pending optimization
    const approveButton = page.locator('button:has-text("Approve")').first();
    await approveButton.click();
    
    // Verify toast notification
    await expect(page.locator('text=Optimization approved and scheduled for execution')).toBeVisible();
    
    // We can also verify that the badge changed to 'Approved'
    // Since there are multiple badges, we check that at least one "Approved" badge exists
    // Wait for state to update
    await page.waitForTimeout(500);
    const approvedBadges = await page.locator('span:has-text("Approved")').count();
    expect(approvedBadges).toBeGreaterThan(0);
  });
});
