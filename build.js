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

function copyRecursive(dir, ignored) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(dir, entry.name);
        const relPath = path.relative(srcDir, srcPath);
        const destPath = path.join(distDir, relPath);

        if (ignored && ignored(relPath))
            continue;

        if (entry.isDirectory()) {
            copyRecursive(srcPath, ignored);
        } else {
            fs.mkdirSync(path.dirname(destPath), { recursive: true });
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

function copyPublic() {
    copyRecursive(path.join(srcDir, "public"),
        (file) => file.endsWith('.ts'));
    console.log("Public files copied");
}

function watchPublicFiles() {
    function fileChanged(file) {
        const destPath = path.join(distDir, path.relative(srcDir, file));
        if (!fs.existsSync(path.dirname(destPath)))
            fs.mkdirSync(path.dirname(destPath), { recursive: true });

        fs.copyFileSync(file, path.join(distDir, path.relative(srcDir, file)));
    }

    chokidar.watch(path.join(srcDir, "public"), {
        ignoreInitial: true,
        usePolling: true,
        interval: 500,
        ignored: (val, stats) => (stats?.isFile() && (val.endsWith('.ts') || val.endsWith('.php'))) || val.startsWith(path.join(srcDir, "/vendor/"))
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
        })
        .on('unlinkDir', dir => {
            console.log(`Directory removed: ${dir}`);
            const distPath = path.join(distDir, path.relative(srcDir, dir));
            if (fs.existsSync(distPath))
                fs.rmSync(distPath, { force: true, recursive: true });
        });

    console.log("Watching Public files...");
}

function copyPHP() {
    copyRecursive(srcDir,
        (file) => (!fs.statSync(path.join(srcDir, file)).isDirectory() && !file.endsWith('.php') && file !== 'readme.txt')
            || ["public", "vendor"].includes(file));
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
        ignored: (val, stats) => (stats?.isFile() && !val.endsWith('.php') && val !== path.join(srcDir, "readme.txt")) || val.startsWith(path.join(srcDir, '/vendor/'))
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

    console.log("Watching PHP files...");
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
        'src/public/js/admin.ts'
    ],
    bundle: true,
    outdir: 'dist/public/js',
    target: 'es2017',
    loader: {
        '.ts': 'ts',
        '.js': 'js'
    }
};

// Bootstrap
cleanDist();
composerInstall(srcDir, false);
copyPHP();
copyPublic();
syncComposer();

// Watch mode
if (process.argv.includes('--watch')) {
    watchComposer();
    watchPHPFiles();
    watchPublicFiles();

    esbuild.context({ ...buildConfig, ...{ sourcemap: true } }).then(ctx => {
        ctx.watch();
        console.log("JS watching...");
    });
}
// Build mode
else {
    await esbuild.build({ ...buildConfig, ... { minify: true } });
    console.log("Build complete");
}