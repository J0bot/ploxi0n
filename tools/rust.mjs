// 🦀 tout le Rust de ploxi0n (0.99.17) : les tests (cargo test), le cœur en WASM (copié dans public/coeur, versionné : la CI et Vite n'ont pas
// besoin de cargo), la bibliothèque d'iOS (aarch64-apple-ios, compilée ici sans Mac ; l'édition des liens se fait dans Xcode), la preuve JS = Rust.
//   node tools/rust.mjs        (rustup target add wasm32-unknown-unknown aarch64-apple-ios une fois)
import { execFileSync } from 'node:child_process';
import { copyFileSync, statSync } from 'node:fs';
const rust = (args) => execFileSync('cargo', args, { cwd: 'rust', stdio: 'inherit' });
rust(['test', '-q']);
rust(['build', '-q', '--release', '-p', 'ploxi-coeur', '--target', 'wasm32-unknown-unknown']);
copyFileSync('rust/target/wasm32-unknown-unknown/release/ploxi_coeur.wasm', 'public/coeur/ploxi_coeur.wasm');
try { rust(['rustc', '-q', '--release', '-p', 'ploxi-coeur', '--target', 'aarch64-apple-ios', '--crate-type', 'staticlib']); console.log('iOS : ' + (statSync('rust/target/aarch64-apple-ios/release/libploxi_coeur.a').size / 1048576).toFixed(1) + ' Mo'); }
catch (e) { console.log('iOS : la cible aarch64-apple-ios manque (rustup target add aarch64-apple-ios)'); }
rust(['build', '-q', '--release', '-p', 'ploxi-digest']);
execFileSync('node', ['tools/rust-golden.mjs'], { stdio: 'inherit' });
console.log('WASM : ' + (statSync('public/coeur/ploxi_coeur.wasm').size / 1024).toFixed(0) + ' Ko');
