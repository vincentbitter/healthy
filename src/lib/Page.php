<?php
/**
 * The Page class can be used to easily register pages in WordPress.
 *
 * @package Healthy
 */

namespace Healthy;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The Page class can be used to easily register pages in WordPress.
 */
class Page {
	/**
	 * File location of the view to include on the page.
	 *
	 * @var string
	 */
	protected string $view;

	/**
	 * Page constructor.
	 *
	 * @param string $view File location of the view to include on the page.
	 */
	public function __construct( string $view ) {
		$this->view = $view;
	}

	/**
	 * Register the page as an options page in WordPress.
	 *
	 * @param string $page_title The text to be displayed in the title tags of the page when the menu is selected.
	 * @param string $menu_title The text to be used for the menu.
	 * @param string $capability The capability required for this menu to be displayed to the user.
	 * @param string $slug The slug name to refer to this menu by (should be unique for this menu).
	 * @return self
	 */
	public function register_options_page(
		string $page_title,
		string $menu_title,
		string $capability,
		string $slug
	): self {
		add_action(
			'admin_menu',
			function () use ( $page_title, $menu_title, $capability, $slug ) {
				add_options_page(
					$page_title,
					$menu_title,
					$capability,
					$slug,
					array( $this, 'render' )
				);
			}
		);

		return $this;
	}

	/**
	 * Render the page.
	 *
	 * @return void
	 */
	public function render(): void {
		$path = plugin_dir_path( __DIR__ ) . $this->view;

		if ( ! file_exists( $path ) ) {
			/* translators: %s is the view file path */
			wp_die( sprintf( esc_html__( 'View not found: %s', 'healthy' ), esc_html( $this->view ) ) );
		} else {
			include $path;
		}
	}
}
