import { test, expect } from './_fixtures/wp-env';

test('Liveness endpoint returns OK', async ({ wp, request }) => {
    expect(wp.ready).toBe(true);

    const res = await request.get('http://localhost:8080/wp-content/plugins/healthy/live.php');
    expect(res.status()).toBe(200);

    const text = await res.text();
    expect(text).toBe('OK');
});