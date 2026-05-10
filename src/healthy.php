<?php

/**
 * Plugin Name: Healthy
 * Plugin URI: https://github.com/vincentbitter/healthy
 * Description: Provides a health endpoint for WordPress environments, suitable for uptime monitoring, Kubernetes probes and automated infrastructure checks.
 * Version: 0.0.0
 * Author: Vincent Bitter
 * Author URI: https://github.com/vincentbitter
 * License: GPL-3.0
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 * Text Domain: healthy
 *
 * @package Healthy
 */

if (!defined('ABSPATH')) {
    exit;
}

require __DIR__ . '/vendor/autoload.php';

use Healthy\Page;
use Healthy\Script;

(new Page('pages/settings.php'))
    ->register_options_page(
        'Healthy',
        'Healthy',
        'manage_options',
        'healthy-settings'
    );

(new Script('healthy-admin', 'admin.js', '1.0', true))
    ->localize('HealthyConfig', [
        'checkUrl' => plugins_url('live.php', __FILE__),
    ])
    ->translations('healthy')
    ->register();
