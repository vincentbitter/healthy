import { execSync } from 'node:child_process';

async function globalSetup() {
    const raw = execSync(
        'wp option get siteurl --path=/var/www/html --allow-root',
        { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );

    const lines = raw.trim().split('\n');
    const url = lines[lines.length - 1].trim();

    process.env.BASE_URL = url;
    console.log(`🌐 BASE_URL set to: ${url}`);

    try {
        execSync(
            'wp plugin activate healthy --path=/var/www/html --allow-root',
            { stdio: ['pipe', 'pipe', 'ignore'] }
        );
        console.log('🔌 Healthy plugin activated');
    } catch (err) {
        console.error('❌ Failed to activate Healthy plugin');
        throw err;
    }
}

export default globalSetup;
