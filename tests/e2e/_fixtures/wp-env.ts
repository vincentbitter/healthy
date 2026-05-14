import { test as base, expect } from '@playwright/test';
import AdminPage from '../page-objects/admin-page';
import LoginPage from '../page-objects/login-page';
import SettingsPage from '../page-objects/settings-page';

type WPFixtures = {
    wp: {
        ready: boolean;
    };
    adminPage: AdminPage;
    loginPage: LoginPage;
    settingsPage: SettingsPage;
};

export const test = base.extend<WPFixtures>({
    wp: async ({ baseURL }, use) => {
        for (let i = 0; i < 30; i++) {
            try {
                const res = await fetch(`${baseURL}`);
                if (res.ok) break;
            } catch { }
            console.log(`Waiting for WordPress to be ready on ${baseURL}...`);
            await new Promise(r => setTimeout(r, 1000));
        }
        await use({ ready: true });
    },

    adminPage: async ({ page }, use) => {
        await use(new AdminPage(page));
    },

    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    settingsPage: async ({ page }, use) => {
        await use(new SettingsPage(page));
    },
});

export { expect };
