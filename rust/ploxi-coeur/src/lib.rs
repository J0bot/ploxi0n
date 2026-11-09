//! # ploxi-coeur : le cœur de ploxi0n en Rust (0.99.17, RS-7 : « le plus de truc en Rust possible ; tout natif ou en Rust »)
//!
//! Les bions purs de l'app, une seule fois : `proche` (la basse partagée, le pas à pas, l'horloge), `autour` (OpenStreetMap,
//! sharedmobility.ch, distance, cap, propositions), `dire` (toutes les langues). Le même code sert :
//! - le WASM de la WebView (`wasm32-unknown-unknown`, public/coeur/ploxi_coeur.wasm) ;
//! - le natif d'iOS (`aarch64-apple-ios`, une bibliothèque statique appelée par le Swift) ;
//! - les tests (`cargo test`) et la preuve qu'il rend EXACTEMENT ce que rendent les bions JS (tools/rust-golden.mjs).
//!
//! Une seule porte (`ffi`) : `px_appel(nom, json) → json`, la même en WASM et en C.

pub mod autour;
pub mod dire;
pub mod ffi;
pub mod js;
pub mod proche;
