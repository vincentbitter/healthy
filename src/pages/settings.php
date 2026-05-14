<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="wrap">
    <h1><?php echo esc_html__('Healthy', 'healthy'); ?></h1>
    <div class="card">
        <h2><?php echo esc_html__('Health Endpoint', 'healthy'); ?></h2>
        <p><?php echo esc_html__('The health endpoint is available at the following URL:', 'healthy'); ?></p>
        <pre id="healthy-live-endpoint"><?php echo esc_html(plugins_url('live.php', dirname(__DIR__) . '/index.php')); ?></pre>
        <p><?php echo esc_html__('Test result:', 'healthy'); ?></p>
        <pre><code id="healthy-test-result"></code></pre>
        <button id="healthy-test-button" class="button button-primary">
            <?php echo esc_html__('Refresh', 'healthy'); ?>
        </button>
    </div>
</div>