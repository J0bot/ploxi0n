import { defineConfig } from 'vite';
// public/ (ploxions extraits, vendor/jOSb.js) est copié tel quel dans dist/ : les bundles des ploxions ne passent pas par Vite
export default defineConfig({ build: { outDir: 'dist', target: 'safari15' }, server: { host: true } });
