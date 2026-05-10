<?php

namespace Healthy;

if (!defined('ABSPATH')) {
    exit;
}

class Script
{
    protected string $name;
    protected string $file;
    protected string $version;
    protected array $deps = [];
    protected array $localize = [];
    protected ?string $textdomain = null;
    protected bool $admin;

    public function __construct(string $name, string $file, string $version = '1.0', bool $admin = false)
    {
        $this->name = $name;
        $this->file = $file;
        $this->version = $version;
        $this->admin = $admin;
    }

    public function deps(array $deps): self
    {
        $this->deps = $deps;
        return $this;
    }

    public function localize(string $object_name, array $data): self
    {
        $this->localize[] = [$object_name, $data];
        return $this;
    }

    public function translations(string $textdomain): self
    {
        $this->textdomain = $textdomain;
        return $this;
    }

    public function register(): void
    {
        add_action($this->admin ? 'admin_enqueue_scripts' : 'wp_enqueue_scripts', function () {
            wp_enqueue_script(
                $this->name,
                plugins_url($this->file, dirname(__DIR__) . '/index.php'),
                $this->deps,
                $this->version,
                true
            );

            // Localize
            foreach ($this->localize as [$object_name, $data]) {
                wp_localize_script($this->name, $object_name, $data);
            }

            // Translations
            if ($this->textdomain) {
                wp_set_script_translations($this->name, $this->textdomain);
            }
        });
    }
}
