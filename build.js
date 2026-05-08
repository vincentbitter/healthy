//import esbuild from 'esbuild';
import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

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

// Copy PHP files
function copyPHP() {
    function copyRecursive(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(dir, entry.name);
            const relPath = path.relative(srcDir, srcPath);
            const destPath = path.join(distDir, relPath);

            if (entry.isDirectory()) {
                fs.mkdirSync(destPath, { recursive: true });
                copyRecursive(srcPath);
            } else if (entry.name.endsWith('.php')) {
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
    fs.watch(srcDir, { recursive: true }, (event, filename) => {
        if (filename && filename.endsWith('.php')) {
            console.log(`PHP changed: ${filename}`);
            copyPHP();
        }
    });
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
        'src/admin.js',
        'src/frontend.js'
    ],
    bundle: true,
    outdir: 'dist',
    sourcemap: true,
    target: 'es2017'
};

const watch = process.argv.includes('--watch');

if (watch) {
    // const ctx = await esbuild.context(config);
    // await ctx.watch();
    // console.log("JS watching...");

    const debouncedCopy = debounce(copyPHP, 200);
    chokidar.watch(srcDir, {
        ignoreInitial: true,
        usePolling: true,
        interval: 200
    })
        .on('change', file => {
            if (file.endsWith('.php')) {
                console.log(`PHP changed: ${file}`);
                debouncedCopy();
            }
        })
        .on('add', file => {
            if (file.endsWith('.php')) {
                console.log(`PHP added: ${file}`);
                debouncedCopy();
            }
        })
        .on('unlink', file => {
            if (file.endsWith('.php')) {
                console.log(`PHP removed: ${file}`);
                removeFromDist(file);
            }
        });

    console.log("PHP watching...");
} else {
    // await esbuild.build(config);
    // console.log("Build complete");
}