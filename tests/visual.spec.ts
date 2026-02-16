import { test, expect } from '@playwright/test';

const testUrls = [
    { name: 'Dashboard', path: '/' },
    { name: 'Fund Holdings', path: '/holdings' },
    { name: 'Equity Holdings', path: '/equities' },
    { name: 'Performance', path: '/performance' },
    // Using deterministic IDs from portfolio-data.ts
    { name: 'Fund Detail - PE001', path: '/holdings/PE001' },
    { name: 'Stock Detail - AAPL', path: '/equities/AAPL' },
];

test.describe('Visual QA', () => {
    for (const { name, path } of testUrls) {
        test(`Snapshot: ${name}`, async ({ page }) => {
            // Visit page
            await page.goto(path);

            // Wait for content (heuristic: wait for 1s or specific element)
            // Since data is client-side generated locally (fast), networkidle is ok.
            await page.waitForLoadState('networkidle');

            // Take a full page screenshot
            // Saves to tests/visual.spec.ts-snapshots/
            await expect(page).toHaveScreenshot(`${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`, { fullPage: true });
        });
    }
});
