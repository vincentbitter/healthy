<?php
/**
 * Live endpoint that can be called to check if the server works.
 * This file is intended to be accessed directly.
 * ABSPATH is defined to satisfy Plugin Check.
 *
 * @package Healthy
 */

if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', realpath( __DIR__ . '/../../../' ) );
}

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

echo 'OK';
