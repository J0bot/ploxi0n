/* Maille v1 : l'implémentation de référence en C (docs/protocole/MAILLE-v1.md).
 * C99 portable, sans allocation dynamique : pour un ESP32, un nRF52, un Pi, un PC. Ce qu'elle fait : les morceaux BLE (§3), la lecture et
 * la validation d'un paquet (§4), la décision de relais d'un nœud (§5 : dédoublonnage, âge, anti-déluge, h - 1, c : 1, les champs inconnus
 * conservés). Ce qu'elle ne fait pas : la cryptographie (§7 : utiliser mbedTLS, la pile de l'OS…), le BLE lui-même (la pile de l'appareil).
 * Un nœud qui ne fait QUE relayer n'a besoin de rien d'autre : il ne déchiffre jamais rien. */
#ifndef MAILLE_H
#define MAILLE_H
#include <stddef.h>
#include <stdint.h>

#ifndef MAILLE_PAQUET_MAX
#define MAILLE_PAQUET_MAX 16000   /* un paquet, en octets (un appareil à court de mémoire PEUT baisser : il jettera les plus gros) */
#endif
#ifndef MAILLE_RECOLLAGES
#define MAILLE_RECOLLAGES 4       /* paquets en cours de recollage en même temps */
#endif
#ifndef MAILLE_VUS
#define MAILLE_VUS 1024           /* id retenus pour le dédoublonnage (un anneau) */
#endif
#define MAILLE_MORCEAU 180
#define MAILLE_ENTETE 8
#define MAILLE_MAGIQUE 0xB1
#define MAILLE_MAX_MORCEAUX 100
#define MAILLE_TTL 255
#define MAILLE_AGE_MAX_MS (72ULL * 3600 * 1000)
#define MAILLE_AVANCE_MAX_MS (10ULL * 60 * 1000)

/* ---- §3 les morceaux ---- */
/* découper : écrit le morceau n° rang (0..total-1) dans sortie (180 octets au plus) ; renvoie sa longueur, 0 si rang est hors limites */
size_t maille_morceau(const uint8_t *paquet, size_t len, uint32_t id, unsigned rang, uint8_t sortie[MAILLE_MORCEAU]);
unsigned maille_nb_morceaux(size_t len);   /* 0 si le paquet est trop gros pour 100 morceaux */

typedef struct {
  uint32_t voisin, id, t;
  uint8_t n, recus, actif;
  uint8_t eu[MAILLE_MAX_MORCEAUX];
  uint16_t len[MAILLE_MAX_MORCEAUX];
  uint8_t data[MAILLE_PAQUET_MAX];
} maille_recollage;
typedef struct { maille_recollage r[MAILLE_RECOLLAGES]; } maille_recolleur;
void maille_recolleur_init(maille_recolleur *rc);
/* ajouter un morceau reçu de « voisin » (un numéro que l'appareil donne à chaque connexion) ; maintenant en secondes (pour oublier un paquet
 * incomplet au bout de 30 s). Renvoie la longueur du paquet entier quand le dernier morceau arrive (copié dans sortie), sinon 0 */
size_t maille_recoller(maille_recolleur *rc, uint32_t voisin, const uint8_t *morceau, size_t len, uint32_t maintenant_s, uint8_t *sortie, size_t sortie_max);

/* ---- §4 le paquet ---- */
typedef struct { const char *p; size_t n; } maille_tranche;   /* un morceau du texte (sans les guillemets pour une chaîne) */
typedef struct {
  int m, h, c;               /* c = 0 : absent */
  double t;
  maille_tranche i, o, n, k, s, a, d;
  size_t pos_h, len_h, pos_c, len_c;   /* où sont les valeurs de h et de c dans le texte (pour les réécrire) */
} maille_paquet;
/* lire et valider (§4.1) ; renvoie 1 si le paquet est bon, 0 sinon (alors : le jeter) */
int maille_lire(const char *texte, size_t len, maille_paquet *p);
int maille_tranche_egale(maille_tranche t, const char *s);

/* ---- §5 le nœud ---- */
typedef struct { char o[16]; uint32_t debut_s; uint16_t n; } maille_debit;
typedef struct {
  char moi[16];                        /* mon empreinte (16 hex), ou que des '0' pour un relais muet */
  uint8_t vus[MAILLE_VUS][8]; unsigned prochain;
  maille_debit debits[32];
} maille_noeud;
typedef enum { MAILLE_JETER = 0, MAILLE_POUR_MOI = 1, MAILLE_RELAYER = 2, MAILLE_LIRE_ET_RELAYER = 3 } maille_decision;
void maille_noeud_init(maille_noeud *nd, const char moi_hex16[16]);
/* un paquet reçu : la décision ; si elle relaie, le texte à renvoyer (h - 1, c : 1, tout le reste intact) est écrit dans sortie ;
 * maintenant_ms : l'heure (ms depuis 1970) ; mettre 0 si l'appareil n'a pas d'heure (alors l'âge n'est pas vérifié) */
maille_decision maille_noeud_recevoir(maille_noeud *nd, const char *texte, size_t len, uint64_t maintenant_ms, char *sortie, size_t sortie_max, size_t *len_sortie);
/* noter un id comme vu (ce que j'émets moi-même) */
void maille_noeud_vu(maille_noeud *nd, maille_tranche id_hex);

#endif
