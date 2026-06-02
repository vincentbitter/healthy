<?php
/**
 * The Script class can be used to easily register scripts in WordPress.
 *
 * @package Healthy
 */

namespace Healthy;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * The Script class can be used to easily register scripts in WordPress.
 */
class Script {
	/**
	 * Name of the script, used as identifier.
	 *
	 * @var string
	 * */
	protected string $name;

	/**
	 * File location of the file to include on the page.
	 *
	 * @var string
	 */
	protected string $file;

	/**
	 * Version of the script, to force cache invalidation.
	 *
	 * @var string
	 */
	protected string $version;

	/**
	 * Names of scripts the script depends on.
	 *
	 * @var array(string)
	 */
	protected array $deps = array();

	/**
	 * Variables that can be used in the script file.
	 *
	 * @var array(string, array<string, mixed>)
	 */
	protected array $localize = array();

	/**
	 * Textdomain used for translations.
	 *
	 * @var string?
	 */
	protected ?string $textdomain = null;

	/**
	 * Include only in admin.
	 *
	 * @var bool
	 */
	protected bool $admin;

	/**
	 * Script constructor.
	 *
	 * @param string $name Name of the script, used as identifier.
	 * @param string $file File location of the file to include on the page.
	 * @param string $version Version of the script, to force cache invalidation.
	 * @param bool   $admin Include only in admin.
	 */
	public function __construct( string $name, string $file, string $version = '1.0', bool $admin = false ) {
		$this->name    = $name;
		$this->file    = $file;
		$this->version = $version;
		$this->admin   = $admin;
	}

	/**
	 * Set the dependencies for the script.
	 *
	 * @param array $deps Names of scripts the script depends on.
	 * @return self
	 */
	public function deps( array $deps ): self {
		$this->deps = $deps;
		return $this;
	}

	/**
	 * Localize the script with data.
	 *
	 * @param string $object_name Name of the JavaScript object to create.
	 * @param array  $data        Data to pass to the JavaScript object.
	 * @return self
	 */
	public function localize( string $object_name, array $data ): self {
		$this->localize[] = array( $object_name, $data );
		return $this;
	}

	/**
	 * Set the textdomain for translations.
	 *
	 * @param string $textdomain Textdomain used for translations.
	 * @return self
	 */
	public function translations( string $textdomain ): self {
		$this->textdomain = $textdomain;
		return $this;
	}

	/**
	 * Register the script in WordPress.
	 *
	 * @return void
	 */
	public function register(): void {
		add_action(
			$this->admin ? 'admin_enqueue_scripts' : 'wp_enqueue_scripts',
			function () {
				wp_enqueue_script(
					$this->name,
					plugins_url( $this->file, dirname( __DIR__ ) . '/index.php' ),
					$this->deps,
					$this->version,
					true
				);

				// Localize.
				foreach ( $this->localize as [$object_name, $data] ) {
					wp_localize_script( $this->name, $object_name, $data );
				}

				// Translations.
				if ( $this->textdomain ) {
					wp_set_script_translations( $this->name, $this->textdomain );
				}
			}
		);
	}
}
