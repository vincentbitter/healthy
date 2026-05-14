import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: '../',
    timeout: 30_000,
    globalSetup: './global-setup.ts',
    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:8080',
        trace: 'retain-on-failure',
    },
    reporter: [
        ['html', {
            open: 'never',
            outputFolder: '../../../test-report/e2e/html/'
        }],
        ['junit', { outputFile: '../../../test-report/e2e/playwright-junit.xml' }]
    ],
});