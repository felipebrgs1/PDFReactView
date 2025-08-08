import path from 'node:path';
import { createRequire } from 'node:module';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, normalizePath } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { tanstackRouter } from '@tanstack/router-plugin/vite';

const require = createRequire(import.meta.url);
const cMapsDir = normalizePath(
    path.join(
        path.dirname(require.resolve('pdfjs-dist/package.json')),
        'cmaps',
    ),
);
const standardFontsDir = normalizePath(
    path.join(
        path.dirname(require.resolve('pdfjs-dist/package.json')),
        'standard_fonts',
    ),
);
const wasmDir = normalizePath(
    path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'wasm'),
);

export default defineConfig({
    plugins: [
        tanstackRouter({ target: 'react', autoCodeSplitting: true }),
        react(),
        tailwindcss(),

        viteStaticCopy({
            targets: [
                { src: cMapsDir, dest: '' },
                { src: standardFontsDir, dest: '' },
                { src: wasmDir, dest: '' },
                { src: 'src/assets/*', dest: 'src/assets' },
            ],
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
