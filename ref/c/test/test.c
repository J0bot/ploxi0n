/* Le test du C de référence contre les vecteurs v1 : cc -std=c99 -Wall -Wextra -I.. ../maille.c test.c -o test && ./test */
#include "maille.h"
#include "vecteurs.h"
#include <stdio.h>
#include <string.h>

static int echecs = 0, faits = 0;
#define OK(c, msg) do { faits++; if (!(c)) { echecs++; printf("ÉCHEC %s:%d %s\n", __FILE__, __LINE__, msg); } } while (0)

static int hex(char c) { return c <= '9' ? c - '0' : c - 'a' + 10; }
static size_t de_hex(const char *h, uint8_t *o) { size_t n = strlen(h) / 2, k; for (k = 0; k < n; k++) o[k] = (uint8_t)(hex(h[2 * k]) << 4 | hex(h[2 * k + 1])); return n; }
static const char *remplacer(const char *s, const char *a, const char *b, char *o) {   /* la première occurrence */
  const char *p = strstr(s, a); size_t la = strlen(a); if (!p) return NULL;
  memcpy(o, s, (size_t)(p - s)); strcpy(o + (p - s), b); strcat(o, p + la); return o;
}

static maille_noeud nd; static maille_recolleur rc;
static char sortie[MAILLE_PAQUET_MAX + 8], attendu[MAILLE_PAQUET_MAX + 8];
static uint8_t octets[MAILLE_PAQUET_MAX], recolle[MAILLE_PAQUET_MAX];
static char octets_txt[MAILLE_PAQUET_MAX + 8];

int main(void) {
  unsigned k; size_t l; maille_paquet p; maille_decision d;

  /* §4 : tous les paquets des vecteurs sont bons, leurs champs lus */
  for (k = 0; k < V_NB; k++) {
    int bon = maille_lire(V_PAQUETS[k], strlen(V_PAQUETS[k]), &p);
    OK(bon, V_NOMS[k]);
    OK(p.m == 1 && p.h == 255 && p.t == (double)V_HORLOGE, "m, h, t");
    OK(maille_tranche_egale(p.o, strstr(V_NOMS[k], "x2") && strstr(V_NOMS[k], "ack") ? V_X2 : (strcmp(V_NOMS[k], "ack_x2") == 0 ? V_X2 : V_X1)), "o");
  }
  maille_lire(V_PAQUETS[3], strlen(V_PAQUETS[3]), &p);
  OK(maille_tranche_egale(p.k, "mp") && maille_tranche_egale(p.a, V_X2), "mp : k et a");
  maille_lire(V_PAQUETS[2], strlen(V_PAQUETS[2]), &p);
  OK(maille_tranche_egale(p.s, "#soiree"), "salon fermé : s");

  /* §4 : avec des espaces, dans un autre ordre : accepté ; relayé avec h - 1 à sa place */
  {
    const char *esp = "{ \"k\" : \"pub\", \"h\" : 12 ,\n \"m\": 1, \"t\": 1790000000000, \"i\": \"00000000000000ad\", \"o\": \"00000000000000bb\" }";
    const char *veut = "{ \"k\" : \"pub\", \"h\" : 11 ,\n \"m\": 1, \"t\": 1790000000000, \"i\": \"00000000000000ad\", \"o\": \"00000000000000bb\" }";
    OK(maille_lire(esp, strlen(esp), &p) && p.h == 12, "espaces acceptés");
    maille_noeud_init(&nd, "0000000000000001");
    d = maille_noeud_recevoir(&nd, esp, strlen(esp), V_HORLOGE, sortie, sizeof(sortie), &l); sortie[l] = 0;
    OK(d == MAILLE_LIRE_ET_RELAYER && strcmp(sortie, veut) == 0, "espaces : relayé intact");
  }

  /* §4.1 : les mauvais paquets sont jetés */
  {
    const char *mauvais[] = {
      "", "[]", "{", "{\"m\":2,\"i\":\"0011223344556677\",\"o\":\"0011223344556677\",\"h\":3,\"t\":1,\"k\":\"pub\"}",
      "{\"m\":1,\"i\":\"0011\",\"o\":\"0011223344556677\",\"h\":3,\"t\":1,\"k\":\"pub\"}",
      "{\"m\":1,\"i\":\"0011223344556677\",\"o\":\"0011223344556677\",\"h\":256,\"t\":1,\"k\":\"pub\"}",
      "{\"m\":1,\"i\":\"0011223344556677\",\"o\":\"0011223344556677\",\"h\":3,\"t\":1,\"k\":\"Virus!\"}",
      "{\"m\":1,\"i\":\"0011223344556677\",\"o\":\"0011223344556677\",\"h\":3,\"t\":1,\"k\":\"x\"}",
      "{\"m\":1,\"i\":\"0011223344556677\",\"o\":\"0011223344556677\",\"h\":3,\"t\":1,\"k\":7}",
      "{\"m\":1,\"i\":\"0011223344556677\",\"o\":\"0011223344556677\",\"h\":3,\"t\":1,\"k\":\"pub\",\"s\":\"pas-de-diese\"}",
      "{\"m\":1,\"i\":\"0011223344556677\",\"o\":\"0011223344556677\",\"h\":3,\"t\":1,\"k\":\"pub\",\"c\":40}",
      "{\"m\":1,\"i\":\"0011223344556677\",\"o\":\"0011223344556677\",\"h\":3,\"k\":\"pub\"}" };
    for (k = 0; k < sizeof(mauvais) / sizeof(*mauvais); k++) OK(!maille_lire(mauvais[k], strlen(mauvais[k]), &p), mauvais[k]);
  }

  /* §3 : les morceaux BLE, octet pour octet */
  {
    const char *pq = V_PAQUETS[V_MORCEAUX_PAQUET]; size_t lp = strlen(pq);
    uint8_t m[MAILLE_MORCEAU]; OK(maille_nb_morceaux(lp) == V_NB_MORCEAUX, "nombre de morceaux");
    for (k = 0; k < V_NB_MORCEAUX; k++) {
      size_t lm = maille_morceau((const uint8_t *)pq, lp, V_MORCEAUX_ID, k, m), le = de_hex(V_MORCEAUX_HEX[k], octets);
      OK(lm == le && memcmp(m, octets, le) == 0, "morceau identique au vecteur");
    }
    /* un gros paquet : découpé, mélangé, recollé */
    {
      static uint8_t gros[3000]; unsigned n, ordre[40]; uint8_t mm[40][MAILLE_MORCEAU]; size_t lm[40];
      for (k = 0; k < sizeof(gros); k++) gros[k] = (uint8_t)(k * 7 + 3);
      n = maille_nb_morceaux(sizeof(gros)); OK(n == 18, "3000 octets = 18 morceaux");
      for (k = 0; k < n; k++) { lm[k] = maille_morceau(gros, sizeof(gros), 42, k, mm[k]); ordre[k] = (k * 7) % n; }
      maille_recolleur_init(&rc); l = 0;
      for (k = 0; k < n; k++) { size_t r = maille_recoller(&rc, 1, mm[ordre[k]], lm[ordre[k]], 100, recolle, sizeof(recolle)); if (r) l = r; OK(k == n - 1 || r == 0, "pas avant le dernier"); }
      OK(l == sizeof(gros) && memcmp(recolle, gros, l) == 0, "recollé dans le désordre");
      /* deux voisins en même temps, avec le même id : pas mélangés */
      maille_recolleur_init(&rc);
      for (k = 0; k + 1 < n; k++) { maille_recoller(&rc, 1, mm[k], lm[k], 100, recolle, sizeof(recolle)); maille_recoller(&rc, 2, mm[k], lm[k], 100, recolle, sizeof(recolle)); }
      OK(maille_recoller(&rc, 2, mm[n - 1], lm[n - 1], 100, recolle, sizeof(recolle)) == sizeof(gros), "voisin 2 complet");
      OK(maille_recoller(&rc, 1, mm[n - 1], lm[n - 1], 100, recolle, sizeof(recolle)) == sizeof(gros), "voisin 1 complet");
      /* incomplet depuis plus de 30 s : oublié */
      maille_recolleur_init(&rc);
      maille_recoller(&rc, 1, mm[0], lm[0], 100, recolle, sizeof(recolle));
      for (k = 1; k < n; k++) l = maille_recoller(&rc, 1, mm[k], lm[k], 200, recolle, sizeof(recolle));
      OK(l == 0, "le vieux morceau 0 est oublié");
      OK(maille_recoller(&rc, 1, (const uint8_t *)"\xB0\0\0\0\0\0\1\0x", 9, 0, recolle, sizeof(recolle)) == 0, "mauvais octet magique");
    }
  }

  /* §5 : le relais (un nœud xerion-3, empreinte 00..01) */
  maille_noeud_init(&nd, "0000000000000001");
  for (k = 0; k < V_NB; k++) {
    const char *pq = V_PAQUETS[k]; size_t lp = strlen(pq);
    d = maille_noeud_recevoir(&nd, pq, lp, V_HORLOGE + 1000, sortie, sizeof(sortie), &l);
    OK(d == MAILLE_RELAYER || d == MAILLE_LIRE_ET_RELAYER, V_NOMS[k]);
    sortie[l] = 0; remplacer(pq, "\"h\":255", "\"h\":254", attendu);
    if (strstr(attendu, "\"c\":8")) { strcpy(octets_txt, attendu); remplacer(octets_txt, "\"c\":8", "\"c\":1", attendu); }   /* un coursier : c : 1 au relais */
    OK(strcmp(sortie, attendu) == 0, "relayé : h - 1, le reste à l'octet près"); if (strcmp(sortie, attendu)) printf("%s\n%s\n%s\n", V_NOMS[k], sortie, attendu);
    OK(maille_noeud_recevoir(&nd, pq, lp, V_HORLOGE + 1000, sortie, sizeof(sortie), &l) == MAILLE_JETER, "le doublon est jeté");
  }
  /* xerion-2 reçoit le mp qui lui est adressé : pour lui, pas relayé */
  maille_noeud_init(&nd, V_X2);
  d = maille_noeud_recevoir(&nd, V_PAQUETS[3], strlen(V_PAQUETS[3]), V_HORLOGE, sortie, sizeof(sortie), &l);
  OK(d == MAILLE_POUR_MOI && l == 0, "mp pour moi : pas relayé");
  /* xerion-1 entend son propre écho */
  maille_noeud_init(&nd, V_X1);
  OK(maille_noeud_recevoir(&nd, V_PAQUETS[1], strlen(V_PAQUETS[1]), V_HORLOGE, sortie, sizeof(sortie), &l) == MAILLE_JETER, "mon écho");
  /* trop vieux, trop en avance ; sans heure : accepté */
  maille_noeud_init(&nd, "0000000000000001");
  OK(maille_noeud_recevoir(&nd, V_PAQUETS[1], strlen(V_PAQUETS[1]), V_HORLOGE + MAILLE_AGE_MAX_MS + 1, sortie, sizeof(sortie), &l) == MAILLE_JETER, "trop vieux");
  maille_noeud_init(&nd, "0000000000000001");
  OK(maille_noeud_recevoir(&nd, V_PAQUETS[1], strlen(V_PAQUETS[1]), V_HORLOGE - MAILLE_AVANCE_MAX_MS - 1, sortie, sizeof(sortie), &l) == MAILLE_JETER, "trop en avance");
  maille_noeud_init(&nd, "0000000000000001");
  OK(maille_noeud_recevoir(&nd, V_PAQUETS[1], strlen(V_PAQUETS[1]), 0, sortie, sizeof(sortie), &l) == MAILLE_LIRE_ET_RELAYER, "sans heure");
  /* un genre inconnu, un champ inconnu, un coursier : relayés, le champ conservé, c réécrit à 1, h à 0 pas relayé */
  {
    const char *cap = "{\"m\":1,\"i\":\"00000000000000aa\",\"o\":\"00000000000000bb\",\"c\":8,\"h\":3,\"t\":1790000000000,\"k\":\"capteur\",\"z\":{\"futur\":[1,\"}\"]},\"d\":{\"temp\":21.5}}";
    const char *veut = "{\"m\":1,\"i\":\"00000000000000aa\",\"o\":\"00000000000000bb\",\"c\":1,\"h\":2,\"t\":1790000000000,\"k\":\"capteur\",\"z\":{\"futur\":[1,\"}\"]},\"d\":{\"temp\":21.5}}";
    const char *fin = "{\"m\":1,\"i\":\"00000000000000ab\",\"o\":\"00000000000000bb\",\"h\":0,\"t\":1790000000000,\"k\":\"pub\",\"d\":{\"x\":\"bonjour\"}}";
    const char *sync = "{\"m\":1,\"i\":\"00000000000000ac\",\"o\":\"00000000000000bb\",\"h\":0,\"t\":1790000000000,\"k\":\"sync\",\"d\":{\"q\":[]}}";
    maille_noeud_init(&nd, "0000000000000001");
    d = maille_noeud_recevoir(&nd, cap, strlen(cap), V_HORLOGE, sortie, sizeof(sortie), &l); sortie[l] = 0;
    OK(d == MAILLE_RELAYER && strcmp(sortie, veut) == 0, "genre inconnu relayé intact");
    OK(maille_noeud_recevoir(&nd, fin, strlen(fin), V_HORLOGE, sortie, sizeof(sortie), &l) == MAILLE_POUR_MOI, "h = 0 : pas relayé");
    OK(maille_noeud_recevoir(&nd, sync, strlen(sync), V_HORLOGE, sortie, sizeof(sortie), &l) == MAILLE_POUR_MOI, "sync : jamais relayé");
  }
  /* l'anti-déluge : 40 par origine en 10 s */
  {
    char b[200]; unsigned acceptes = 0;
    maille_noeud_init(&nd, "0000000000000001");
    for (k = 0; k < 60; k++) {
      snprintf(b, sizeof(b), "{\"m\":1,\"i\":\"%016x\",\"o\":\"00000000000000cc\",\"h\":5,\"t\":1790000000000,\"k\":\"pub\"}", k + 1);
      if (maille_noeud_recevoir(&nd, b, strlen(b), V_HORLOGE, sortie, sizeof(sortie), &l) != MAILLE_JETER) acceptes++;
    }
    OK(acceptes == 40, "40 par 10 s");
  }

  printf("%d/%d vérifications au vert\n", faits - echecs, faits);
  return echecs ? 1 : 0;
}
