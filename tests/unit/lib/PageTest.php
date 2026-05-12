<?php

namespace Healthy\Tests\Unit\Lib;

use Mockery;
use Brain\Monkey;
use Brain\Monkey\Actions;
use Brain\Monkey\Functions;
use PHPUnit\Framework\TestCase;
use Healthy\Page;

class PageTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        Monkey\setUp();

        Functions\stubEscapeFunctions();
        Functions\stubTranslationFunctions();
    }

    protected function tearDown(): void
    {
        Monkey\tearDown();
        parent::tearDown();
    }

    public function test_register_options_page_adds_admin_menu_action()
    {
        // Arrange
        $page = new Page('views/settings.php');

        Functions\expect('add_options_page')
            ->once()
            ->with(
                'Website Settings',
                'Website',
                'manage_options',
                'test-settings',
                [$page, 'render']
            );

        Actions\expectAdded('admin_menu')
            ->once()
            ->with(Mockery::type('callable'))
            ->whenHappen(function ($callback) {
                $callback();
            });

        // Act
        $page->register_options_page(
            'Website Settings',
            'Website',
            'manage_options',
            'test-settings',
        );

        do_action('admin_menu');

        // Assert
        $this->assertTrue(true);
    }

    public function test_render_includes_view_when_file_exists()
    {
        // Arrange
        $tempDir = sys_get_temp_dir() . '/tests';
        @mkdir($tempDir);

        $tempView = $tempDir . '/tmp_test.php';
        file_put_contents($tempView, '<?php echo "OK";');

        $page = new Page('tmp_test.php');

        Functions\when('plugin_dir_path')->alias(function () use ($tempDir) {
            return rtrim($tempDir, '/') . '/';
        });

        Functions\expect('wp_die')->never();

        // Act
        ob_start();
        $page->render();
        $output = ob_get_clean();

        // Assert
        $this->assertSame('OK', $output);
    }

    public function test_render_calls_wp_die_when_view_missing()
    {
        // Arrange
        $tempDir = sys_get_temp_dir() . '/tests';
        $tempView = $tempDir . '/tmp_test_missing.php';
        $page = new Page($tempView);

        Functions\when('plugin_dir_path')->returnArg(1);

        Functions\expect('wp_die')
            ->once()
            ->with('View not found: ' . $tempView);

        // Act
        $page->render();

        $this->assertTrue(true);
    }
}
