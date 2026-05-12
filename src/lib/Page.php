<?php

namespace Healthy;

if (!defined('ABSPATH')) {
    exit;
}

class Page
{
    protected string $view;

    public function __construct(string $view)
    {
        $this->view = $view;
    }

    public function register_options_page(
        string $page_title,
        string $menu_title,
        string $capability,
        string $slug
    ) {
        add_action('admin_menu', function () use ($page_title, $menu_title, $capability, $slug) {
            add_options_page(
                $page_title,
                $menu_title,
                $capability,
                $slug,
                [$this, 'render']
            );
        });

        return $this;
    }

    public function render()
    {
        $path = plugin_dir_path(__DIR__) . $this->view;

        if (! file_exists($path)) {
            /* translators: %s is the view file path */
            wp_die(sprintf(esc_html__("View not found: %s", 'healthy'), esc_html($this->view)));
        }

        include $path;
    }
}
