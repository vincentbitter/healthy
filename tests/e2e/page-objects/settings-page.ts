export default class SettingsPage {
    page: any;

    constructor(page: any) {
        this.page = page;
    }

    async goto() {
        await this.page.goto('/wp-admin/options-general.php?page=healthy-settings');
        await this.page.waitForLoadState('networkidle');
    }

    async getLiveEndpoint() {
        return await this.page.innerHTML(this.selectors.liveEndpoint);
    }

    async getLiveEndpointTestResult() {
        return await this.page.innerHTML(this.selectors.liveEndpointTestResult);
    }

    async clickTestButton() {
        await this.page.click(this.selectors.testButton);
    }

    get selectors() {
        return {
            liveEndpoint: '#healthy-live-endpoint',
            liveEndpointTestResult: '#healthy-test-result',
            testButton: '#healthy-test-button'
        };
    }
}