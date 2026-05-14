export default class LoginPage {
    page: any;

    constructor(page: any) {
        this.page = page;
    }

    async goto() {
        console.log('Navigate to login page');
        await this.page.goto('/wp-login.php');
        await this.page.waitForLoadState('networkidle');
    }

    async enterUsername(username: string) {
        await this.page.fill(this.selectors.usernameInput, username);
    }

    async enterPassword(password: string) {
        await this.page.fill(this.selectors.passwordInput, password);
    }

    async clickLoginButton() {
        await this.page.click(this.selectors.loginButton);
    }

    async login(username: string, password: string) {
        console.log(`Login as "${username}"`);
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLoginButton();

        const result = await Promise.race([
            this.page.waitForURL('**/wp-admin/**'),
            this.page.waitForSelector('#login_error', { timeout: 3000 })
        ]);

        if (result && typeof result === 'object' && 'textContent' in result) {
            throw new Error('Login failed: ' + await this.getErrorMessage());
        }
    }

    async getErrorMessage() {
        return await this.page.textContent(this.selectors.errorMessage);
    }

    get selectors() {
        return {
            usernameInput: 'input#user_login',
            passwordInput: 'input#user_pass',
            loginButton: 'input#wp-submit',
            errorMessage: '#login_error'
        };
    }
}