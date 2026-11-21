// ▭ (22.11, RS-7 coord #2234 « truc à régler pour ploxi0n », trois captures de la 0.99.66) :
//   1. la bande en trapèze flottait au-dessus du bas (l'accueil, les réglages), un fond noir vide dessous avec les deux koins : le format du koin
//      ouvert (data-ouvert="compact") restait posé après la fermeture et gardait la bande montée. Elle est collée au bas, entre les deux koins,
//      et chaque vue s'arrête au-dessus d'elle (l'indicateur d'accueil compté une seule fois) ;
//   2. la bulle de △ se posait sur l'en-tête de la vue, avec un message obscur : elle se pose au-dessus de la bande et dit où on en est.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { creerKoins } from '../src/app/koins.js';
import { page } from './aide.mjs';

const CSS = readFileSync(new URL('../src/app/app.css', import.meta.url), 'utf8');
const MAIN = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');

/** les règles du CSS (sélecteur, déclarations), celles des @media comprises ; les @keyframes ne comptent pas */
function regles(css) {
  const s = css.replace(/\/\*[\s\S]*?\*\//g, ''), out = [];
  let i = 0;
  const bloc = (fin) => {
    while (i < s.length) {
      const o = s.indexOf('{', i), f = s.indexOf('}', i);
      if (f >= 0 && (o < 0 || f < o)) { i = f + 1; if (fin) return; continue; }
      if (o < 0) { i = s.length; return; }
      const tete = s.slice(i, o).trim(); i = o + 1;
      if (/^@(media|supports|container)/.test(tete)) { bloc(true); continue; }
      if (/^@/.test(tete)) { let n = 1; while (i < s.length && n) { if (s[i] === '{') n++; else if (s[i] === '}') n--; i++; } continue; }   // @keyframes…
      const g = s.indexOf('}', i); out.push({ sel: tete, decl: s.slice(i, g) }); i = g + 1;
    }
  };
  bloc(false);
  return out;
}
const R = regles(CSS);
const decl = (sel) => R.filter(r => r.sel.split(',').map(x => x.trim()).includes(sel)).map(r => r.decl).join(';');

test('▭ #2234-1 la bande collée au bas entre les deux koins : le format du koin ouvert part à la fermeture, chaque vue lui laisse sa place', async () => {
  // le JS : ouvert dans un ploxion (compact), puis refermé → plus de data-ouvert, plus de bande montée
  const p = await page({ avion: true, ploxions: [] });
  try {
    const W = p.w, D = W.document; let calme = false;
    const k = creerKoins({ W, actif: () => true, calme: () => calme, actions: { ouvert: () => 'compact' } });
    k.poser();
    const r = D.querySelector('.px-koins-r'), g = D.querySelector('[data-koin="gauche"]');
    assert.equal(r.getAttribute('data-ouvert'), null, 'jamais ouvert : pas de format');
    g.click(); await new Promise(f => setTimeout(f, 40));
    assert.equal(r.getAttribute('data-ouvert'), 'compact'); assert.ok(r.classList.contains('px-koins-ouverts'));
    g.click();
    assert.ok(!r.classList.contains('px-koins-ouverts'), 'la classe de l\'ouverture part tout de suite (la bande redescend)');
    assert.equal(r.getAttribute('data-ouvert'), 'compact', 'le format reste le temps de l\'animation de fermeture (les cases ne sautent pas)');
    await new Promise(f => setTimeout(f, 480));
    assert.equal(r.getAttribute('data-ouvert'), null, 'refermé : le format est parti (c\'est lui qui gardait la bande montée)');
    // rouvert puis refermé avant la fin de l'animation : le format de la nouvelle ouverture reste
    g.click(); await new Promise(f => setTimeout(f, 30)); g.click(); g.click(); await new Promise(f => setTimeout(f, 480));
    assert.equal(r.getAttribute('data-ouvert'), 'compact', 'rouvert : on n\'efface pas le format d\'un koin ouvert');
    // en mode Calme (pas d'animation) : tout de suite
    calme = true; g.click(); assert.equal(r.getAttribute('data-ouvert'), null);
  } finally { p.fin(); }
  // le CSS : la bande ne monte qu'ouverte ; au repos, collée au bas (bottom:0) entre les koins
  assert.match(decl('.px-koin-barre'), /position:fixed;left:0;right:0;bottom:0;height:var\(--kb\)/, 'au repos : collée au bas');
  const montent = R.filter(x => /\.px-koin-barre/.test(x.sel) && /(^|;)\s*bottom:/.test(x.decl) && x.sel !== '.px-koin-barre');
  assert.ok(montent.length >= 2, 'les formats compact, bande et mini la font monter, koins ouverts');
  for (const x of montent) assert.match(x.sel, /\.px-koins-ouverts/, 'une règle qui fait monter la bande sans « koins ouverts » : ' + x.sel);
  // chaque vue s'arrête au-dessus de la bande : l'accueil comme un ploxion (sa liste, ses cartes « en arrière-plan »), la map (SEPTION, nexus)
  for (const v of ['html.px-koins #ploxi0n.px-mode-accueil', 'html.px-koins #ploxi0n.px-mode-ploxion']) assert.match(decl(v), /padding-bottom:var\(--kbande\)/, v);
  assert.match(decl('html.px-koins .px-accueil'), /padding-bottom:calc\(10px \+ var\(--px-md,0px\)\)/, 'plus l\'indicateur d\'accueil une seconde fois');
  assert.doesNotMatch(decl('html.px-koins .px-map-temps'), /safe-area/, 'le curseur du temps de la map : sans l\'indicateur une seconde fois');
  // les réglages en télécommande : le champ « chercher un réglage » juste au-dessus de la bande (l'indicateur d'accueil y est déjà compté)
  for (const v of ['html.px-koins.px-telecommande .rg-tete', 'html.px-koins.px-telecommande .mk-top']) {
    assert.match(decl(v), /padding-bottom:8px/, v); assert.doesNotMatch(decl(v), /safe-area/, v + ' : la safe-area une seule fois');
  }
  // ce qui flotte à l'accueil (les mini docks « +4 », à l'écoute) : juste au-dessus de la bande
  for (const v of ['html.px-koins .px-md', 'html.px-koins .px-maintenant']) assert.match(decl(v), /bottom:calc\(var\(--kbande\) \+ 10px\)/, v);
  // le clavier ouvert : la bande s'efface, la place qu'elle prenait aussi (accueil compris)
  assert.match(decl('html.px-koins.px-clavier #ploxi0n.px-mode-accueil'), /padding-bottom:0/);
});

test('▭ #2234-2 la bulle de △ se pose au-dessus de la bande, en bas, jamais sur l\'en-tête ; elle dit où on en est', async () => {
  // le CSS : en mode koin, la bulle part du bas (au-dessus de la bande et des mini docks), plus du haut
  const b = decl('html.px-koins .px-bulle');
  assert.match(b, /top:auto/); assert.match(b, /bottom:calc\(var\(--kbande\) \+ 12px\)/);
  assert.match(decl('html.px-koins .px-mode-accueil .px-bulle'), /bottom:calc\(var\(--kbande\) \+ 12px \+ var\(--px-md,0px\)\)/, 'à l\'accueil, au-dessus des mini docks');
  // plus fort que les règles d'avant (la télécommande « les notifs viennent d'en haut », l'accueil) : html.px-koins (0,2,1) contre (0,2,0)
  for (const v of ['.px-telecommande .px-bulle', '.px-mode-accueil .px-bulle']) assert.ok(decl(v), v + ' existe toujours (hors mode koin)');
  assert.match(CSS, /@keyframes px-bulle-bas\{from\{opacity:0;transform:translateY\(12px\)/, 'elle monte de la bande au lieu de tomber du haut');
  // le message : court, clair, sans le « pas encore semé ici » obscur ; ni emoji ni tiret long
  assert.match(MAIN, /routeur\.signaler\('△ : pas encore de koin pour cette vue'\)/);
  assert.doesNotMatch(MAIN, /n\\'est pas encore semé ici/);
  const msg = '△ : pas encore de koin pour cette vue';
  assert.doesNotMatch(msg, /\p{Extended_Pictographic}|—/u);
  // dans la page : la bulle du routeur vit dans #ploxi0n (c'est là que la règle .px-mode-accueil .px-bulle la trouve)
  const p = await page({ avion: true, ploxions: [] });
  try {
    p.routeur.signaler(msg);
    const el = p.w.document.querySelector('#ploxi0n .px-bulle');
    assert.ok(el && el.textContent === msg && !el.hidden, 'la bulle du routeur, dans #ploxi0n');
  } finally { p.fin(); }
});
