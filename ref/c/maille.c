/* Maille v1 : l'implémentation de référence en C (voir maille.h, docs/protocole/MAILLE-v1.md). */
#include "maille.h"
#include <string.h>

/* ---- §3 les morceaux ---- */
unsigned maille_nb_morceaux(size_t len) {
  size_t utile = MAILLE_MORCEAU - MAILLE_ENTETE, n = len == 0 ? 1 : (len + utile - 1) / utile;
  return n > MAILLE_MAX_MORCEAUX ? 0 : (unsigned)n;
}
size_t maille_morceau(const uint8_t *paquet, size_t len, uint32_t id, unsigned rang, uint8_t sortie[MAILLE_MORCEAU]) {
  unsigned n = maille_nb_morceaux(len); size_t utile = MAILLE_MORCEAU - MAILLE_ENTETE, debut, l;
  if (!n || rang >= n) return 0;
  debut = (size_t)rang * utile; l = len - debut < utile ? len - debut : utile;
  sortie[0] = MAILLE_MAGIQUE; sortie[1] = (uint8_t)(id >> 24); sortie[2] = (uint8_t)(id >> 16); sortie[3] = (uint8_t)(id >> 8); sortie[4] = (uint8_t)id;
  sortie[5] = (uint8_t)rang; sortie[6] = (uint8_t)n; sortie[7] = 0;
  memcpy(sortie + MAILLE_ENTETE, paquet + debut, l);
  return MAILLE_ENTETE + l;
}
void maille_recolleur_init(maille_recolleur *rc) { memset(rc, 0, sizeof(*rc)); }
size_t maille_recoller(maille_recolleur *rc, uint32_t voisin, const uint8_t *m, size_t len, uint32_t maintenant_s, uint8_t *sortie, size_t sortie_max) {
  uint32_t id; unsigned i, n, k; maille_recollage *x = NULL, *libre = NULL, *vieux = NULL; size_t total = 0, o = 0, utile = MAILLE_MORCEAU - MAILLE_ENTETE;
  if (len < MAILLE_ENTETE || len > MAILLE_MORCEAU || m[0] != MAILLE_MAGIQUE) return 0;
  id = ((uint32_t)m[1] << 24) | ((uint32_t)m[2] << 16) | ((uint32_t)m[3] << 8) | m[4]; i = m[5]; n = m[6];
  if (!n || n > MAILLE_MAX_MORCEAUX || i >= n) return 0;
  if (n == 1) { size_t l = len - MAILLE_ENTETE; if (l > sortie_max) return 0; memcpy(sortie, m + MAILLE_ENTETE, l); return l; }
  for (k = 0; k < MAILLE_RECOLLAGES; k++) {
    maille_recollage *r = &rc->r[k];
    if (r->actif && maintenant_s - r->t > 30) r->actif = 0;   /* incomplet depuis 30 s : oublié */
    if (r->actif && r->voisin == voisin && r->id == id) x = r;
    if (!r->actif && !libre) libre = r;
    if (r->actif && (!vieux || r->t < vieux->t)) vieux = r;
  }
  if (x && x->n != n) { x->actif = 0; }
  if (!x || !x->actif) {
    x = x ? x : (libre ? libre : vieux);
    memset(x->eu, 0, sizeof(x->eu)); x->voisin = voisin; x->id = id; x->n = (uint8_t)n; x->recus = 0; x->t = maintenant_s; x->actif = 1;
  }
  if (!x->eu[i]) {
    size_t l = len - MAILLE_ENTETE;
    if ((size_t)i * utile + l > MAILLE_PAQUET_MAX) { x->actif = 0; return 0; }
    memcpy(x->data + (size_t)i * utile, m + MAILLE_ENTETE, l); x->len[i] = (uint16_t)l; x->eu[i] = 1; x->recus++;
  }
  if (x->recus < x->n) return 0;
  x->actif = 0;
  for (k = 0; k < x->n; k++) total += x->len[k];
  if (total > sortie_max) return 0;
  for (k = 0; k < x->n; k++) { memcpy(sortie + o, x->data + (size_t)k * utile, x->len[k]); o += x->len[k]; }
  return total;
}

/* ---- §4 le paquet : un petit lecteur JSON (le premier niveau seulement ; les objets et tableaux sont sautés) ---- */
static size_t blanc(const char *s, size_t i, size_t n) { while (i < n && (s[i] == ' ' || s[i] == '\t' || s[i] == '\n' || s[i] == '\r')) i++; return i; }
static size_t chaine(const char *s, size_t i, size_t n) {   /* s[i] == '"' ; renvoie l'indice après le guillemet fermant, 0 si mal formé */
  for (i++; i < n; i++) { if (s[i] == '\\') { i++; continue; } if (s[i] == '"') return i + 1; if ((unsigned char)s[i] < 0x20) return 0; }
  return 0;
}
static size_t valeur(const char *s, size_t i, size_t n) {   /* saute une valeur JSON ; renvoie l'indice après, 0 si mal formée */
  int prof = 0;
  if (i >= n) return 0;
  if (s[i] == '"') return chaine(s, i, n);
  if (s[i] == '{' || s[i] == '[') {
    for (; i < n; i++) {
      if (s[i] == '"') { size_t j = chaine(s, i, n); if (!j) return 0; i = j - 1; continue; }
      if (s[i] == '{' || s[i] == '[') prof++;
      else if (s[i] == '}' || s[i] == ']') { if (--prof == 0) return i + 1; }
    }
    return 0;
  }
  while (i < n && s[i] != ',' && s[i] != '}' && s[i] != ' ' && s[i] != '\n' && s[i] != '\r' && s[i] != '\t') i++;
  return i;
}
static int entier(const char *s, size_t n, long *v) {
  size_t i = 0; long x = 0; if (!n) return 0;
  for (; i < n; i++) { if (s[i] < '0' || s[i] > '9') return 0; x = x * 10 + (s[i] - '0'); if (x > 100000000L) return 0; }
  *v = x; return 1;
}
static int nombre(const char *s, size_t n, double *v) {
  size_t i = 0; double x = 0; int neg = 0;
  if (n && s[0] == '-') { neg = 1; i = 1; }
  if (i >= n) return 0;
  for (; i < n; i++) { if (s[i] == '.' || s[i] == 'e' || s[i] == 'E') break; if (s[i] < '0' || s[i] > '9') return 0; x = x * 10 + (s[i] - '0'); }
  *v = neg ? -x : x; return 1;
}
static int hex16(maille_tranche t) {
  size_t i; if (t.n != 16) return 0;
  for (i = 0; i < 16; i++) { char c = t.p[i]; if (!((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f'))) return 0; }
  return 1;
}
int maille_tranche_egale(maille_tranche t, const char *s) { size_t l = strlen(s); return t.n == l && memcmp(t.p, s, l) == 0; }
static int genre_ok(maille_tranche t) { size_t i; if (t.n < 2 || t.n > 10) return 0; for (i = 0; i < t.n; i++) if (t.p[i] < 'a' || t.p[i] > 'z') return 0; return 1; }
static int salon_ok(maille_tranche t) {   /* « # » puis 32 lettres/chiffres/_/- au plus (ASCII ici ; les lettres non ASCII sont acceptées telles quelles) */
  size_t i; if (t.n < 1 || t.p[0] != '#' || t.n > 1 + 32 * 4) return 0;
  for (i = 1; i < t.n; i++) { unsigned char c = (unsigned char)t.p[i]; if (c < 0x80 && !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_' || c == '-')) return 0; }
  return 1;
}

int maille_lire(const char *s, size_t n, maille_paquet *p) {
  size_t i; int vu_m = 0, vu_i = 0, vu_o = 0, vu_h = 0, vu_t = 0, vu_k = 0;
  memset(p, 0, sizeof(*p));
  if (n == 0 || n > MAILLE_PAQUET_MAX) return 0;
  i = blanc(s, 0, n); if (i >= n || s[i] != '{') return 0; i = blanc(s, i + 1, n);
  while (i < n && s[i] != '}') {
    size_t kd, kf, vd, vf; maille_tranche cle, v;
    if (s[i] != '"') return 0;
    kd = i + 1; kf = chaine(s, i, n); if (!kf) return 0; cle.p = s + kd; cle.n = kf - 1 - kd;
    i = blanc(s, kf, n); if (i >= n || s[i] != ':') return 0; i = blanc(s, i + 1, n);
    vd = i; vf = valeur(s, i, n); if (!vf) return 0;
    v.p = s + vd; v.n = vf - vd;
    if (s[vd] == '"') { v.p = s + vd + 1; v.n = vf - vd - 2; }
    if (maille_tranche_egale(cle, "m")) { long x; if (!entier(v.p, v.n, &x)) return 0; p->m = (int)x; vu_m = 1; }
    else if (maille_tranche_egale(cle, "h")) { long x; if (!entier(v.p, v.n, &x)) return 0; p->h = (int)x; p->pos_h = vd; p->len_h = vf - vd; vu_h = 1; }
    else if (maille_tranche_egale(cle, "c")) { long x; if (!entier(v.p, v.n, &x)) return 0; p->c = (int)x; p->pos_c = vd; p->len_c = vf - vd; if (p->c < 1 || p->c > 16) return 0; }
    else if (maille_tranche_egale(cle, "t")) { if (!nombre(v.p, v.n, &p->t)) return 0; vu_t = 1; }
    else if (maille_tranche_egale(cle, "i")) { if (s[vd] != '"') return 0; p->i = v; vu_i = 1; }
    else if (maille_tranche_egale(cle, "o")) { if (s[vd] != '"') return 0; p->o = v; vu_o = 1; }
    else if (maille_tranche_egale(cle, "k")) { if (s[vd] != '"') return 0; p->k = v; vu_k = 1; }
    else if (maille_tranche_egale(cle, "n")) { if (s[vd] == '"') p->n = v; }
    else if (maille_tranche_egale(cle, "s")) { if (s[vd] != '"') { if (!(v.n == 4 && memcmp(v.p, "null", 4) == 0)) return 0; } else p->s = v; }
    else if (maille_tranche_egale(cle, "a")) { if (s[vd] != '"') { if (!(v.n == 4 && memcmp(v.p, "null", 4) == 0)) return 0; } else p->a = v; }
    else if (maille_tranche_egale(cle, "d")) { p->d.p = s + vd; p->d.n = vf - vd; }
    /* un champ inconnu : ignoré (et conservé au relais, puisqu'on relaie le texte) */
    i = blanc(s, vf, n);
    if (i < n && s[i] == ',') i = blanc(s, i + 1, n);
  }
  if (i >= n) return 0;
  if (!vu_m || p->m != 1 || !vu_i || !hex16(p->i) || !vu_o || !hex16(p->o) || !vu_k || !genre_ok(p->k) || !vu_h || p->h < 0 || p->h > MAILLE_TTL || !vu_t) return 0;
  if (p->s.p && !salon_ok(p->s)) return 0;
  if (p->a.p && !hex16(p->a)) return 0;
  return 1;
}

/* ---- §5 le nœud ---- */
static uint8_t hexval(char c) { return (uint8_t)(c <= '9' ? c - '0' : c - 'a' + 10); }
static void id_octets(maille_tranche t, uint8_t o[8]) { int k; for (k = 0; k < 8; k++) o[k] = (uint8_t)((hexval(t.p[2 * k]) << 4) | hexval(t.p[2 * k + 1])); }
void maille_noeud_init(maille_noeud *nd, const char moi[16]) { memset(nd, 0, sizeof(*nd)); memcpy(nd->moi, moi, 16); }
static int deja_vu(maille_noeud *nd, const uint8_t o[8]) { unsigned k; for (k = 0; k < MAILLE_VUS; k++) if (memcmp(nd->vus[k], o, 8) == 0) return 1; return 0; }
void maille_noeud_vu(maille_noeud *nd, maille_tranche t) { uint8_t o[8]; if (!hex16(t)) return; id_octets(t, o); memcpy(nd->vus[nd->prochain], o, 8); nd->prochain = (nd->prochain + 1) % MAILLE_VUS; }
static int trop_bavard(maille_noeud *nd, maille_tranche o, uint32_t maintenant_s) {
  unsigned k, libre = 0, vieux = 0;
  for (k = 0; k < 32; k++) {
    maille_debit *d = &nd->debits[k];
    if (memcmp(d->o, o.p, 16) == 0) { if (maintenant_s - d->debut_s > 10) { d->debut_s = maintenant_s; d->n = 0; } d->n++; return d->n > 40; }
    if (d->o[0] == 0) libre = k + 1;
    if (d->debut_s < nd->debits[vieux].debut_s) vieux = k;
  }
  k = libre ? libre - 1 : vieux;
  memcpy(nd->debits[k].o, o.p, 16); nd->debits[k].debut_s = maintenant_s; nd->debits[k].n = 1;
  return 0;
}
static size_t ecrire_entier(char *o, int v) { char b[8]; int n = 0; size_t k; if (v == 0) { o[0] = '0'; return 1; } while (v > 0) { b[n++] = (char)('0' + v % 10); v /= 10; } for (k = 0; k < (size_t)n; k++) o[k] = b[n - 1 - k]; return (size_t)n; }

maille_decision maille_noeud_recevoir(maille_noeud *nd, const char *texte, size_t len, uint64_t maintenant_ms, char *sortie, size_t sortie_max, size_t *len_sortie) {
  maille_paquet p; uint8_t id[8]; int pour_moi_seul, relayer; size_t a, b, o = 0;
  *len_sortie = 0;
  if (!maille_lire(texte, len, &p)) return MAILLE_JETER;
  if (maille_tranche_egale(p.k, "sync")) return MAILLE_POUR_MOI;   /* d'un voisin seulement, jamais relayé */
  id_octets(p.i, id);
  if (deja_vu(nd, id)) return MAILLE_JETER;
  memcpy(nd->vus[nd->prochain], id, 8); nd->prochain = (nd->prochain + 1) % MAILLE_VUS;
  if (maintenant_ms && (p.t > (double)(maintenant_ms + MAILLE_AVANCE_MAX_MS) || (double)maintenant_ms - p.t > (double)MAILLE_AGE_MAX_MS)) return MAILLE_JETER;
  if (memcmp(p.o.p, nd->moi, 16) == 0) return MAILLE_JETER;   /* mon propre écho */
  if (trop_bavard(nd, p.o, (uint32_t)(maintenant_ms / 1000))) return MAILLE_JETER;
  pour_moi_seul = p.a.p && memcmp(p.a.p, nd->moi, 16) == 0;
  relayer = !pour_moi_seul && p.h > 0;
  if (!relayer) return MAILLE_POUR_MOI;
  /* le texte tel quel, h - 1 et c : 1 (on réécrit les deux valeurs en place, dans l'ordre où elles apparaissent) */
  {
    size_t pos1 = p.pos_h, l1 = p.len_h, pos2 = p.pos_c, l2 = p.len_c; int v1 = p.h - 1, v2 = 1, a_c = p.c > 0;
    if (a_c && pos2 < pos1) { size_t tp = pos1, tl = l1; int tv = v1; pos1 = pos2; l1 = l2; v1 = v2; pos2 = tp; l2 = tl; v2 = tv; }
    if (len + 4 > sortie_max) return MAILLE_POUR_MOI;
    a = 0; b = pos1; memcpy(sortie + o, texte + a, b - a); o += b - a; o += ecrire_entier(sortie + o, v1); a = pos1 + l1;
    if (a_c) { b = pos2; memcpy(sortie + o, texte + a, b - a); o += b - a; o += ecrire_entier(sortie + o, v2); a = pos2 + l2; }
    memcpy(sortie + o, texte + a, len - a); o += len - a;
  }
  *len_sortie = o;
  return (maille_tranche_egale(p.k, "pub") || maille_tranche_egale(p.k, "ann")) ? MAILLE_LIRE_ET_RELAYER : MAILLE_RELAYER;
}
