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

// Determine dev dependencies from composer.json
let devDeps = [];
function getDevDeps() {
    const composerJson = JSON.parse(
        fs.readFileSync(path.join(srcDir, 'composer.json'), 'utf8')
    );
    devDeps = Object.keys(composerJson['require-dev'] || []);
    console.log("Composer devDependencies loaded");
}
getDevDeps();

// Watch composer file
function watchComposer() {
    fs.watch(path.join(srcDir, 'composer.json'), (event, filename) => {
        if (filename) {
            console.log(`Composer file changed: ${filename}`);
            getDevDeps();
        }
    });

    console.log("Composer watching...");
}

// Clean dist
function cleanDist() {
    if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
        return;
    }

    for (const entry of fs.readdirSync(distDir)) {
        fs.rmSync(path.join(distDir, entry), { recursive: true, force: true });
    }

    console.log("Dist cleaned");
}

cleanDist();

// Create new autoload files
function dumpAutoload() {
  exec('composer dump-autoload -o', { cwd: srcDir }, (err, stdout, stderr) => {
    if (err) console.error(stderr);
    else console.log("Composer autoload updated");
  });
}

dumpAutoload();

// Copy PHP files
function copyPHP() {
    function copyRecursive(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(dir, entry.name);
            const relPath = path.relative(srcDir, srcPath);
            const destPath = path.join(distDir, relPath);

            // Skip devDependencies
            if (relPath.startsWith("vendor/") && devDeps.includes(relPath.substring(7))) {
                continue;
            }

            if (entry.isDirectory()) {
                copyRecursive(srcPath);
            } else if (entry.name === 'composer.json' || entry.name === 'composer.lock' || entry.name.endsWith('.php')) {
                fs.mkdirSync(path.dirname(destPath), { recursive: true });
                fs.copyFileSync(srcPath, destPath);
            }
        }
    }

    copyRecursive(srcDir);
    console.log("PHP copied");
}

// Initial copy
copyPHP();

// Watch PHP files
function watchPHP() {
    const debouncedDumpAutoload = debounce(dumpAutoload, 100);
    const debouncedCopy = debounce(copyPHP, 200);
    chokidar.watch(srcDir, {
        ignoreInitial: true,
        usePolling: true,
        interval: 200
    })
        .on('change', file => {
            if (file.endsWith('.php')) {
                console.log(`PHP changed: ${file}`);
                if (file.startsWith(srcDir + "/lib/"))
                    debouncedDumpAutoload();
                debouncedCopy();
            }
        })
        .on('add', file => {
            if (file.endsWith('.php')) {
                console.log(`PHP added: ${file}`);
                if (file.startsWith(srcDir + "/lib/"))
                    debouncedDumpAutoload();
                debouncedCopy();
            }
        })
        .on('unlink', file => {
            if (file.endsWith('.php')) {
                console.log(`PHP removed: ${file}`);
                if (file.startsWith(srcDir + "/lib/"))
                    debouncedDumpAutoload();
                removeFromDist(file);
            }
        });

    console.log("PHP watching...");
}

// Debounce helper
function debounce(fn, delay = 150) {
    let timer = null;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// Remove file from dist
function removeFromDist(file) {
    const relPath = path.relative(srcDir, file);
    const distPath = path.join(distDir, relPath);

    if (fs.existsSync(distPath)) {
        fs.rmSync(distPath, { force: true });
    }
}

// Build config
const config = {
    entryPoints: [
        'src/admin.js'
    ],
    bundle: true,
    outdir: 'dist',
    sourcemap: true,
    target: 'es2017'
};

const watch = process.argv.includes('--watch');

if (watch) {
    watchComposer();
    watchPHP();

    esbuild.context(config).then(ctx => {
        ctx.watch();
        console.log("JS watching...");
    });
} else {
    await esbuild.build(config);
    console.log("Build complete");
}