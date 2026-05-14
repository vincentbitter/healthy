import { test, expect } from './_fixtures/wp-env';

test('Healthy is available in settings menu', async ({ adminPage, loginPage, settingsPage }) => {
    // Arrange
    await loginPage.goto();
    await loginPage.login('admin', 'admin');

    // Act
    const menuItem = await adminPage.getMenuItem("Settings", "Healthy");

    // Assert
    expect(menuItem).not.toBeNull();
});