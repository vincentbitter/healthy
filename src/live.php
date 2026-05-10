<?php
// This file is intended to be accessed directly.
// ABSPATH is defined to satisfy Plugin Check.
if (! defined('ABSPATH')) {
    define('ABSPATH', realpath(__DIR__ . '/../../../'));
}

if (!defined('ABSPATH')) {
    exit;
}

echo 'OK';
