/* Un nœud Maille v1 sur ESP32 (docs/protocole/MAILLE-v1.md) : un relais muet qui étend la maille de proche en proche.
 *
 * ⚠️ PAS COMPILÉ dans le dépôt (pas de chaîne ESP32 ici) : c'est un squelette relu, à compiler dans l'IDE Arduino ou PlatformIO.
 * Dépendances : la carte « esp32 » (Espressif) et la bibliothèque NimBLE-Arduino (h2zero, 2.x). Copier ../../maille.c et ../../maille.h
 * à côté de ce fichier. Pour une carte avec peu de RAM : #define MAILLE_PAQUET_MAX 4096 et MAILLE_VUS 256 avant d'inclure maille.h
 * (les paquets plus gros seront jetés, pas relayés).
 *
 * Ce qu'il fait (§2, §3, §5) :
 *  - périphérique GATT : il annonce le service Maille, les téléphones s'y connectent et lui écrivent ;
 *  - central GATT : il cherche les autres nœuds (téléphones, Pi, ESP32) et s'y abonne ;
 *  - chaque paquet recollé passe par maille_noeud_recevoir() ; s'il faut relayer, le texte réécrit (h - 1) part vers tous les AUTRES voisins.
 * Ce qu'il ne fait pas : il ne déchiffre rien, n'émet pas d'ann (un relais muet est permis, §1), ne garde pas de stock (pas de sync).
 * MODE_CLIENT : il ne relaie plus ; à la place, il donne les paquets lus à recu() (un capteur, un écran, un bouton qui écoutent la maille). */
#include <NimBLEDevice.h>
extern "C" {
#include "maille.h"
}

#define MODE_CLIENT 0
#define MAX_VOISINS 6
static const char *SERVICE = "8F3A1C2E-5B7D-4E9A-9C1F-0D2B4A6E8C10";
static const char *CARAC   = "8F3A1C2E-5B7D-4E9A-9C1F-0D2B4A6E8C11";

static maille_noeud noeud;
static maille_recolleur recolleur;
static uint8_t paquet[MAILLE_PAQUET_MAX];
static char relais[MAILLE_PAQUET_MAX + 8];
static NimBLECharacteristic *carac = nullptr;          // la mienne (côté périphérique : notify vers ceux qui se sont abonnés)
static NimBLEClient *sortants[MAX_VOISINS] = {};        // ceux à qui je me suis connecté (côté central)
static NimBLERemoteCharacteristic *leurs[MAX_VOISINS] = {};
static QueueHandle_t file;                              // les morceaux reçus, traités dans loop() (jamais dans un rappel BLE)
struct Morceau { uint32_t voisin; uint16_t len; uint8_t o[MAILLE_MORCEAU]; };

static void recu(const char *texte, size_t len) { Serial.printf("lu : %.*s\n", (int)(len > 120 ? 120 : len), texte); }

static void pousser(uint32_t voisin, const uint8_t *o, size_t len) {
  if (len > MAILLE_MORCEAU) return;
  Morceau m; m.voisin = voisin; m.len = (uint16_t)len; memcpy(m.o, o, len);
  xQueueSend(file, &m, 0);   // file pleine : le morceau est perdu, le paquet sera rattrapé par un autre chemin
}

// envoyer un paquet, découpé, à tous les voisins sauf « de » (voisin 0..MAX_VOISINS-1 = sortants, 100+ = connexions entrantes)
static void envoyer(const char *texte, size_t len, uint32_t de) {
  static uint32_t compteur = 1; uint32_t id = esp_random() ^ compteur++; uint8_t m[MAILLE_MORCEAU];
  unsigned n = maille_nb_morceaux(len);
  for (unsigned r = 0; r < n; r++) {
    size_t l = maille_morceau((const uint8_t *)texte, len, id, r, m);
    for (int v = 0; v < MAX_VOISINS; v++)
      if ((uint32_t)v != de && leurs[v] && sortants[v] && sortants[v]->isConnected()) leurs[v]->writeValue(m, l, false);
    if (carac && carac->getSubscribedCount() > 0) { carac->setValue(m, l); carac->notify(); }   // NimBLE 2.x : vers tous les abonnés
  }
  // (simplification : la notify part aussi vers « de » s'il est un entrant ; il jettera le doublon, §5)
}

class Ecritures : public NimBLECharacteristicCallbacks {
  void onWrite(NimBLECharacteristic *c, NimBLEConnInfo &info) override {
    NimBLEAttValue v = c->getValue(); pousser(100 + info.getConnHandle(), v.data(), v.size());
  }
};
static void notifie(NimBLERemoteCharacteristic *c, uint8_t *data, size_t len, bool) {
  for (int v = 0; v < MAX_VOISINS; v++) if (leurs[v] == c) { pousser(v, data, len); return; }
}

class Scan : public NimBLEScanCallbacks {
  void onResult(const NimBLEAdvertisedDevice *d) override {
    if (!d->isAdvertisingService(NimBLEUUID(SERVICE))) return;
    for (int v = 0; v < MAX_VOISINS; v++) if (sortants[v] && sortants[v]->getPeerAddress() == d->getAddress()) return;
    for (int v = 0; v < MAX_VOISINS; v++) {
      if (sortants[v] && sortants[v]->isConnected()) continue;
      NimBLEDevice::getScan()->stop();
      if (!sortants[v]) sortants[v] = NimBLEDevice::createClient();
      if (!sortants[v]->connect(d)) { NimBLEDevice::getScan()->start(0, false, true); return; }
      sortants[v]->exchangeMTU();   // MTU ≥ 185 demandé (§2) ; NimBLEDevice::setMTU(517) dans setup()
      NimBLERemoteService *s = sortants[v]->getService(SERVICE);
      leurs[v] = s ? s->getCharacteristic(CARAC) : nullptr;
      if (!leurs[v] || !leurs[v]->subscribe(true, notifie)) { sortants[v]->disconnect(); leurs[v] = nullptr; }
      NimBLEDevice::getScan()->start(0, false, true);
      return;
    }
  }
};

void setup() {
  Serial.begin(115200);
  file = xQueueCreate(64, sizeof(Morceau));
  maille_noeud_init(&noeud, "0000000000000000");   // relais muet : pas d'identité (un nœud qui émet des ann mettrait son empreinte)
  maille_recolleur_init(&recolleur);
  NimBLEDevice::init("maille-esp32");
  NimBLEDevice::setMTU(517);
  NimBLEServer *srv = NimBLEDevice::createServer();
  srv->advertiseOnDisconnect(true);
  NimBLEService *svc = srv->createService(SERVICE);
  carac = svc->createCharacteristic(CARAC, NIMBLE_PROPERTY::NOTIFY | NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::WRITE_NR);
  carac->setCallbacks(new Ecritures());
  svc->start();
  NimBLEAdvertising *adv = NimBLEDevice::getAdvertising();
  adv->addServiceUUID(SERVICE); adv->enableScanResponse(true); adv->start();
  NimBLEScan *scan = NimBLEDevice::getScan();
  scan->setScanCallbacks(new Scan(), false); scan->setActiveScan(true); scan->start(0, false, true);
}

void loop() {
  Morceau m;
  while (xQueueReceive(file, &m, pdMS_TO_TICKS(50)) == pdTRUE) {
    size_t l = maille_recoller(&recolleur, m.voisin, m.o, m.len, millis() / 1000, paquet, sizeof(paquet));
    if (!l) continue;
    size_t lr = 0;
    // pas d'horloge réelle sur un ESP32 nu : 0 = l'âge n'est pas vérifié (avec un RTC ou du NTP, passer l'heure en ms)
    maille_decision d = maille_noeud_recevoir(&noeud, (const char *)paquet, l, 0, relais, sizeof(relais), &lr);
    if (MODE_CLIENT) { if (d != MAILLE_JETER) recu((const char *)paquet, l); continue; }
    if (d == MAILLE_LIRE_ET_RELAYER) recu((const char *)paquet, l);
    if ((d == MAILLE_RELAYER || d == MAILLE_LIRE_ET_RELAYER) && lr) {
      delay(10 + esp_random() % 140);   // la gigue du relais (§5) : évite que tous les voisins réémettent en même temps
      envoyer(relais, lr, m.voisin);
    }
  }
}
