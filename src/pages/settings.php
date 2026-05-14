<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<style type="text/css">
    .healthy-page {
        padding-top: 68px;
    }

    .healthy-page-header {
        background-color: #fff;
        height: 68px;
        position: fixed;
        top: 32px;
        left: 160px;
        right: 0;
        z-index: 9980;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    @media(min-width: 782px) {
        body.folded .healthy-page-header {
            left: 36px
        }
    }

    @media (max-width: 960px) {
        body.auto-fold .healthy-page-header {
            left: 36px;
        }
    }

    @media (max-width: 782px) {
        body.auto-fold .healthy-page-header {
            left: 0;
            top: 0;
            position: absolute;
            margin-left: -10px;
        }
    }

    .healthy-page-header h1 img {
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }
</style>

<div class="healthy-page">
    <header class="healthy-page-header">
        <h1>
            <img src="<?php echo plugins_url('public/img/logo.svg', __DIR__); ?>" alt="<?php echo esc_html__('Healthy', 'healthy'); ?>" />
        </h1>
    </header>

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