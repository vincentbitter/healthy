import esbuild from 'esbuild';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

function composerDumpAutoload(folder, prod) {
    exec('composer dump-autoload' + (prod ? ' --optimize --no-dev' : ''), { cwd: folder }, (err, stdout, stderr) => {
        if (err) console.error(stderr);
        else console.log("Composer autoload updated: " + folder);
    });
}

function composerDumpAutoloads() {
    composerDumpAutoload(srcDir, false);
    composerDumpAutoload(distDir, true);
}

function composerInstall(folder, prod) {
    exec('composer install' + (prod ? ' --optimize-autoloader --no-dev' : ''), { cwd: folder }, (err, stdout, stderr) => {
        if (err) console.error(stderr);
        else console.log("Composer install completed: " + folder);
    });
}

function syncComposer() {
    fs.copyFileSync(path.join(srcDir, 'composer.json'), path.join(distDir, 'composer.json'));
    composerInstall(distDir, true);
}

// Watch composer file: copy to dist and run composer install on dist
function watchComposer() {
    const debouncedSyncComposer = debounce(syncComposer, 1000);
    fs.watch(path.join(srcDir, 'composer.json'), (event, filename) => {
        console.log(`Composer file changed: ${filename}`);
        debouncedSyncComposer();
    });

    console.log("Composer watching...");
}

function cleanDist() {
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
        return;
    }

    for (const entry of fs.readdirSync(distDir)) {
        fs.rmSync(path.join(distDir, entry), { recursive: true, force: true });
    }

    console.log("Cleaned ./dist");
}

function copyPHP() {
    function copyRecursive(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(dir, entry.name);
            const relPath = path.relative(srcDir, srcPath);
            const destPath = path.join(distDir, relPath);

            // Skip ./vendor directory
            if (relPath.startsWith("vendor/")) {
                continue;
            }

            if (entry.isDirectory()) {
                copyRecursive(srcPath);
            } else if (entry.name.endsWith('.php')) {
                fs.mkdirSync(path.dirname(destPath), { recursive: true });
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    copyRecursive(srcDir);
    console.log("PHP files copied");
}


function watchPHPFiles() {
    const debouncedDumpAutoloads = debounce(composerDumpAutoloads, 1000);

    function fileChanged(file) {
        const destPath = path.join(distDir, path.relative(srcDir, file));
        if (!fs.existsSync(path.dirname(destPath)))
            fs.mkdirSync(path.dirname(destPath), { recursive: true });

        fs.copyFileSync(file, path.join(distDir, path.relative(srcDir, file)));
        if (file.startsWith(srcDir + "/lib/"))
            debouncedDumpAutoloads();
    }

    chokidar.watch(srcDir, {
        ignoreInitial: true,
        usePolling: true,
        interval: 200,
        ignored: (path, stats) => (stats?.isFile() && !path.endsWith('.php')) || path.startsWith(srcDir + "/vendor/")
    })
        .on('change', file => {
            console.log(`File changed: ${file}`);
            fileChanged(file);
        })
        .on('add', file => {
            console.log(`File added: ${file}`);
            fileChanged(file);
        })
        .on('unlink', file => {
            console.log(`File removed: ${file}`);
            const distPath = path.join(distDir, path.relative(srcDir, file));
            if (fs.existsSync(distPath))
                fs.rmSync(distPath, { force: true });
            if (file.startsWith(srcDir + "/lib/"))
                debouncedDumpAutoloads();
        })
        .on('unlinkDir', dir => {
            console.log(`Directory removed: ${dir}`);
            const distPath = path.join(distDir, path.relative(srcDir, dir));
            if (fs.existsSync(distPath)) {
                fs.rmSync(distPath, { force: true, recursive: true });
            }
        });

    console.log("Watching files...");
}

function debounce(fn, delay = 150) {
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

const buildConfig = {
    entryPoints: [
        'src/admin.js'
    ],
    bundle: true,
    outdir: 'dist',
    sourcemap: true,
    target: 'es2017'
};

// Bootstrap
cleanDist();
composerInstall(srcDir, false);
copyPHP();
syncComposer();

// Watch mode
if (process.argv.includes('--watch')) {
    watchComposer();
    watchPHPFiles();

    esbuild.context(buildConfig).then(ctx => {
        ctx.watch();
        console.log("JS watching...");
    });
}
// Build mode
else {
    await esbuild.build(buildConfig);
    console.log("Build complete");
}