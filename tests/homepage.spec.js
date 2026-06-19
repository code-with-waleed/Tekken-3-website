import { test, expect } from '@playwright/test';

test.describe('Homepage - Header & Hero Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('navbar renders with logo and 5 navigation links', async ({ page }) => {
    await expect(page.locator('.navbar')).toBeVisible();
    await expect(page.locator('.brand-text')).toContainText('TEKKEN');
    await expect(page.locator('.brand-number')).toContainText('3');
    await expect(page.locator('.nav-links a')).toHaveCount(5);
    await expect(page.locator('.nav-links a').filter({ hasText: 'Home' })).toBeVisible();
    await expect(page.locator('.nav-links a').filter({ hasText: 'Admin' })).toBeVisible();
  });

  test('hero section displays correctly', async ({ page }) => {
    await expect(page.locator('.hero-section')).toBeVisible();
    await expect(page.locator('.hero-title')).toContainText('Fighter');
    await expect(page.locator('.hero-btn.primary')).toContainText('Explore Roster');
    await expect(page.locator('.hero-btn.secondary')).toContainText('Play Arcade');
  });

  test('hero character display shows character info', async ({ page }) => {
    await expect(page.locator('.hero-character-frame')).toBeVisible();
    await expect(page.locator('.hci-name')).toBeVisible();
    await expect(page.locator('.hci-detail')).toBeVisible();
  });

  test('hero character selector has 6 buttons', async ({ page }) => {
    const buttons = page.locator('.hero-char-btn');
    await expect(buttons).toHaveCount(6);
    await expect(buttons.first()).toHaveClass(/active/);
    await buttons.nth(1).click();
    await expect(buttons.nth(1)).toHaveClass(/active/);
  });

  test('stats section renders with 4 stat cards', async ({ page }) => {
    await expect(page.locator('.stat-card')).toHaveCount(4);
  });

  test('fighters grid renders with cards', async ({ page }) => {
    const count = await page.locator('.fighter-grid-card').count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test('lore preview and quick links render', async ({ page }) => {
    await expect(page.locator('.lore-title')).toContainText('Mishima Saga');
    await expect(page.locator('.quick-link')).toHaveCount(3);
  });
});

test.describe('Navigation', () => {
  test('roster link navigates to roster page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('.nav-links a').filter({ hasText: 'Roster' }).click();
    await page.waitForURL('**/roster');
    await expect(page.locator('.roster-page')).toBeVisible();
  });

  test('admin page loads correctly via hash route', async ({ page }) => {
    await page.goto('/#/admin');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.admin-page')).toBeVisible();
    await expect(page.locator('.admin-header h1')).toContainText('Admin Panel');
  });

  test('admin page shows character table with rows', async ({ page }) => {
    await page.goto('/#/admin');
    await page.waitForLoadState('networkidle');
    const count = await page.locator('.admin-table tbody tr').count();
    expect(count).toBeGreaterThanOrEqual(10);
  });

  test('admin settings tab is clickable', async ({ page }) => {
    await page.goto('/#/admin');
    await page.waitForLoadState('networkidle');
    await page.locator('.admin-tab').filter({ hasText: 'Settings' }).click();
    await expect(page.locator('.settings-card').first()).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('hamburger menu opens on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('.nav-toggle').click();
    await expect(page.locator('.nav-links')).toHaveClass(/open/);
  });
});
