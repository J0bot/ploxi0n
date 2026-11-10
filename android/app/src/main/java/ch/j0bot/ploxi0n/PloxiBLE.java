package ch.j0bot.ploxi0n;

import android.Manifest;
import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattServer;
import android.bluetooth.BluetoothGattServerCallback;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.le.AdvertiseCallback;
import android.bluetooth.le.AdvertiseData;
import android.bluetooth.le.AdvertiseSettings;
import android.bluetooth.le.BluetoothLeAdvertiser;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.os.HandlerThread;
import android.os.ParcelUuid;
import android.util.Base64;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/*
 * 〰 PloxiBLE sur Android (0.99.41, RS-7 10.11 : « Proche ne marche pas entre un Android et un iPhone, ni entre deux Android »). Il n'y avait
 * AUCUN Bluetooth natif côté Android : Proche retombait sur le canal de test du navigateur. Ce plugin est le jumeau de PloxiBLE en Swift
 * (ios/App/App/AppDelegate.swift) et de xb proche (Pi, Windows) : le même service, la même caractéristique, le même contrat.
 *   demarrer() → { morceau: 180 }     arreter()     envoyer({ donnees: base64, a?: [ids] }) → { envoyes }
 *   événements : « pair » { id, etat: connecte | perdu | erreur, message? } · « message » { de, donnees: base64 }
 * Chaque téléphone est PÉRIPHÉRIQUE (il annonce le service ; on lui écrit, il notifie) ET CENTRAL (il cherche le service, se connecte,
 * s'abonne). Un voisin = « p:<adresse> » quand on est son central, « c:<adresse> » quand il est le nôtre. Il ne porte que des octets
 * (des morceaux de 180 octets : le découpage et le maillage sont en JS, src/bions/fragments.js et maille.js).
 * Android demande deux choses que l'iPhone fait seul : négocier le MTU (23 octets par défaut : un morceau de 180 n'y passe pas) et
 * faire UNE opération Bluetooth à la fois (d'où la file ci-dessous). Ne pas nuire : rien ne s'annonce avant demarrer().
 */
@SuppressLint("MissingPermission")
@CapacitorPlugin(
    name = "PloxiBLE",
    permissions = {
        @Permission(alias = "ble", strings = { Manifest.permission.BLUETOOTH_SCAN, Manifest.permission.BLUETOOTH_CONNECT, Manifest.permission.BLUETOOTH_ADVERTISE }),
        @Permission(alias = "lieu", strings = { Manifest.permission.ACCESS_FINE_LOCATION })
    }
)
public class PloxiBLE extends Plugin {

    private static final UUID SERVICE = UUID.fromString("8F3A1C2E-5B7D-4E9A-9C1F-0D2B4A6E8C10");
    private static final UUID CARAC = UUID.fromString("8F3A1C2E-5B7D-4E9A-9C1F-0D2B4A6E8C11");
    private static final UUID CCCD = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");
    private static final int MTU = 247;
    private static final int MAX_PAIRS = 8;

    private HandlerThread fil;
    private Handler h;
    private BluetoothManager gestion;
    private BluetoothAdapter carte;
    private BluetoothGattServer serveur;
    private BluetoothGattCharacteristic maCarac;
    private BluetoothLeAdvertiser annonceur;
    private BluetoothLeScanner chercheur;
    private boolean actif = false;

    private final Map<String, BluetoothGatt> peripheriques = new HashMap<>();              // nous sommes leur central
    private final Map<String, BluetoothGattCharacteristic> ecrire = new HashMap<>();
    private final Set<String> enCours = Collections.synchronizedSet(new HashSet<>());      // connexions demandées, pas encore prêtes
    private final Map<String, BluetoothDevice> abonnes = new HashMap<>();                  // nous sommes leur périphérique

    // UNE opération GATT à la fois : écrire chez un périphérique, ou notifier un abonné ; la suivante part au retour de l'appel (ou après 1,5 s)
    private static final class Op {
        final boolean notifier; final String id; final byte[] octets;
        Op(boolean n, String i, byte[] o) { notifier = n; id = i; octets = o; }
    }
    private final ArrayDeque<Op> file = new ArrayDeque<>();
    private boolean occupe = false;
    private final Runnable delai = () -> { occupe = false; suivante(); };

    private boolean droits() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) return getPermissionState("ble") == PermissionState.GRANTED;
        return getPermissionState("lieu") == PermissionState.GRANTED;   // avant Android 12, chercher en Bluetooth demande la position
    }

    @PluginMethod
    public void demarrer(PluginCall call) {
        if (!droits()) {
            requestPermissionForAlias(Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ? "ble" : "lieu", call, "apresDroits");
            return;
        }
        lancer(call);
    }

    @PermissionCallback
    private void apresDroits(PluginCall call) {
        if (!droits()) { call.reject("Bluetooth refusé (Réglages › Applis › ploxi0n › Autorisations › Appareils à proximité)"); return; }
        lancer(call);
    }

    private void lancer(PluginCall call) {
        gestion = (BluetoothManager) getContext().getSystemService(Context.BLUETOOTH_SERVICE);
        carte = gestion == null ? null : gestion.getAdapter();
        if (carte == null) { call.reject("pas de Bluetooth sur ce téléphone"); return; }
        if (!carte.isEnabled()) { call.reject("le Bluetooth est éteint : allume-le, puis relance Proche"); return; }
        if (fil == null) { fil = new HandlerThread("ploxi.ble"); fil.start(); h = new Handler(fil.getLooper()); }
        h.post(() -> {
            try {
                if (!actif) { actif = true; ouvrirServeur(); annoncer(); chercher(); }
                JSObject r = new JSObject(); r.put("morceau", 180); call.resolve(r);
            } catch (Exception e) {
                actif = false; call.reject("le Bluetooth n'a pas démarré : " + e.getMessage());
            }
        });
    }

    @PluginMethod
    public void arreter(PluginCall call) {
        if (h == null) { call.resolve(); return; }
        h.post(() -> { fermer(); call.resolve(); });
    }

    @Override
    protected void handleOnDestroy() {
        if (h != null) h.post(this::fermer);
    }

    private void fermer() {
        actif = false;
        try { if (chercheur != null) chercheur.stopScan(vu); } catch (Exception e) { /* */ }
        try { if (annonceur != null) annonceur.stopAdvertising(annonce); } catch (Exception e) { /* */ }
        for (BluetoothGatt g : new ArrayList<>(peripheriques.values())) { try { g.disconnect(); g.close(); } catch (Exception e) { /* */ } }
        try { if (serveur != null) { serveur.clearServices(); serveur.close(); } } catch (Exception e) { /* */ }
        peripheriques.clear(); ecrire.clear(); enCours.clear(); abonnes.clear(); file.clear(); occupe = false;
        if (h != null) h.removeCallbacks(delai);
        serveur = null; maCarac = null; annonceur = null; chercheur = null;
    }

    @PluginMethod
    public void envoyer(PluginCall call) {
        String b64 = call.getString("donnees");
        byte[] octets;
        try { octets = Base64.decode(b64 == null ? "" : b64, Base64.DEFAULT); } catch (Exception e) { octets = new byte[0]; }
        if (octets.length == 0 || octets.length > 512) { call.reject("morceau illisible ou trop gros"); return; }
        final List<String> a = new ArrayList<>();
        JSArray ja = call.getArray("a");
        if (ja != null) { try { for (Object o : ja.toList()) a.add(String.valueOf(o)); } catch (Exception e) { /* */ } }
        final byte[] v = octets;
        if (h == null || !actif) { JSObject r = new JSObject(); r.put("envoyes", 0); call.resolve(r); return; }
        h.post(() -> {
            int n = 0;
            for (String adr : new ArrayList<>(ecrire.keySet())) {
                if (!a.isEmpty() && !a.contains("p:" + adr)) continue;
                file.add(new Op(false, adr, v)); n++;
            }
            for (String adr : new ArrayList<>(abonnes.keySet())) {
                if (!a.isEmpty() && !a.contains("c:" + adr)) continue;
                file.add(new Op(true, adr, v)); n++;
            }
            suivante();
            JSObject r = new JSObject(); r.put("envoyes", n); call.resolve(r);
        });
    }

    @SuppressWarnings("deprecation")
    private void suivante() {
        while (!occupe && !file.isEmpty()) {
            Op op = file.poll();
            boolean parti = false;
            try {
                if (op.notifier) {
                    BluetoothDevice d = abonnes.get(op.id);
                    if (d != null && serveur != null && maCarac != null) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) parti = serveur.notifyCharacteristicChanged(d, maCarac, false, op.octets) == 0;
                        else { maCarac.setValue(op.octets); parti = serveur.notifyCharacteristicChanged(d, maCarac, false); }
                    }
                } else {
                    BluetoothGatt g = peripheriques.get(op.id);
                    BluetoothGattCharacteristic c = ecrire.get(op.id);
                    if (g != null && c != null) {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) parti = g.writeCharacteristic(c, op.octets, BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE) == 0;
                        else { c.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_NO_RESPONSE); c.setValue(op.octets); parti = g.writeCharacteristic(c); }
                    }
                }
            } catch (Exception e) { parti = false; }
            if (parti) { occupe = true; h.removeCallbacks(delai); h.postDelayed(delai, 1500); }
        }
    }

    private void finie() {
        if (h == null) return;
        h.post(() -> { h.removeCallbacks(delai); occupe = false; suivante(); });
    }

    private void pair(String id, String etat) {
        JSObject o = new JSObject(); o.put("id", id); o.put("etat", etat); notifyListeners("pair", o);
    }

    private void erreur(String message) {
        JSObject o = new JSObject(); o.put("id", ""); o.put("etat", "erreur"); o.put("message", message); notifyListeners("pair", o);
    }

    private void message(String de, byte[] v) {
        if (v == null || v.length == 0) return;
        JSObject o = new JSObject(); o.put("de", de); o.put("donnees", Base64.encodeToString(v, Base64.NO_WRAP)); notifyListeners("message", o);
    }

    // ---- périphérique : le service, l'annonce, les écritures reçues, les abonnés ----
    private void ouvrirServeur() {
        serveur = gestion.openGattServer(getContext(), surServeur);
        if (serveur == null) { erreur("ce téléphone ne sait pas être périphérique Bluetooth : il écoute seulement"); return; }
        maCarac = new BluetoothGattCharacteristic(CARAC,
            BluetoothGattCharacteristic.PROPERTY_NOTIFY | BluetoothGattCharacteristic.PROPERTY_WRITE | BluetoothGattCharacteristic.PROPERTY_WRITE_NO_RESPONSE,
            BluetoothGattCharacteristic.PERMISSION_WRITE);
        maCarac.addDescriptor(new BluetoothGattDescriptor(CCCD, BluetoothGattDescriptor.PERMISSION_READ | BluetoothGattDescriptor.PERMISSION_WRITE));
        BluetoothGattService s = new BluetoothGattService(SERVICE, BluetoothGattService.SERVICE_TYPE_PRIMARY);
        s.addCharacteristic(maCarac);
        serveur.addService(s);
    }

    private void annoncer() {
        annonceur = carte.getBluetoothLeAdvertiser();
        if (annonceur == null) { erreur("ce téléphone ne sait pas s'annoncer en Bluetooth : il écoute seulement"); return; }
        AdvertiseSettings reglages = new AdvertiseSettings.Builder().setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_BALANCED)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_MEDIUM).setConnectable(true).setTimeout(0).build();
        AdvertiseData donnees = new AdvertiseData.Builder().setIncludeDeviceName(false).setIncludeTxPowerLevel(false).addServiceUuid(new ParcelUuid(SERVICE)).build();
        annonceur.startAdvertising(reglages, donnees, annonce);
    }

    private final AdvertiseCallback annonce = new AdvertiseCallback() {
        @Override public void onStartFailure(int code) { erreur("l'annonce Bluetooth n'a pas démarré (code " + code + ")"); }
    };

    private final BluetoothGattServerCallback surServeur = new BluetoothGattServerCallback() {
        @Override public void onConnectionStateChange(BluetoothDevice d, int status, int etat) {
            if (etat == BluetoothProfile.STATE_DISCONNECTED) h.post(() -> { if (abonnes.remove(d.getAddress()) != null) pair("c:" + d.getAddress(), "perdu"); });
        }
        @Override public void onDescriptorWriteRequest(BluetoothDevice d, int requete, BluetoothGattDescriptor desc, boolean prepare, boolean reponse, int offset, byte[] valeur) {
            final boolean abonne = valeur != null && valeur.length > 0 && valeur[0] != 0;
            h.post(() -> {
                if (CCCD.equals(desc.getUuid())) {
                    if (abonne) { if (abonnes.put(d.getAddress(), d) == null) pair("c:" + d.getAddress(), "connecte"); }
                    else if (abonnes.remove(d.getAddress()) != null) pair("c:" + d.getAddress(), "perdu");
                }
                if (reponse && serveur != null) serveur.sendResponse(d, requete, BluetoothGatt.GATT_SUCCESS, 0, null);
            });
        }
        @Override public void onDescriptorReadRequest(BluetoothDevice d, int requete, int offset, BluetoothGattDescriptor desc) {
            h.post(() -> {
                byte[] v = abonnes.containsKey(d.getAddress()) ? BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE : BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE;
                if (serveur != null) serveur.sendResponse(d, requete, BluetoothGatt.GATT_SUCCESS, 0, v);
            });
        }
        @Override public void onCharacteristicWriteRequest(BluetoothDevice d, int requete, BluetoothGattCharacteristic c, boolean prepare, boolean reponse, int offset, byte[] valeur) {
            final byte[] v = valeur == null ? new byte[0] : valeur.clone();
            h.post(() -> {
                if (CARAC.equals(c.getUuid())) message("c:" + d.getAddress(), v);
                if (reponse && serveur != null) serveur.sendResponse(d, requete, BluetoothGatt.GATT_SUCCESS, 0, null);
            });
        }
        @Override public void onNotificationSent(BluetoothDevice d, int status) { finie(); }
    };

    // ---- central : chercher le service, se connecter, négocier le MTU, s'abonner ----
    private void chercher() {
        chercheur = carte.getBluetoothLeScanner();
        if (chercheur == null) { erreur("la recherche Bluetooth n'est pas disponible"); return; }
        List<ScanFilter> filtres = new ArrayList<>();
        filtres.add(new ScanFilter.Builder().setServiceUuid(new ParcelUuid(SERVICE)).build());
        chercheur.startScan(filtres, new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_BALANCED).build(), vu);
    }

    private final ScanCallback vu = new ScanCallback() {
        @Override public void onScanResult(int type, ScanResult r) {
            final BluetoothDevice d = r.getDevice();
            if (d == null || h == null) return;
            h.post(() -> {
                String adr = d.getAddress();
                if (!actif || peripheriques.containsKey(adr) || enCours.contains(adr) || peripheriques.size() + enCours.size() >= MAX_PAIRS) return;
                enCours.add(adr);
                BluetoothGatt g = d.connectGatt(getContext(), false, surPeripherique, BluetoothDevice.TRANSPORT_LE);
                if (g == null) enCours.remove(adr);
            });
        }
        @Override public void onScanFailed(int code) { erreur("la recherche Bluetooth a échoué (code " + code + ")"); }
    };

    private final BluetoothGattCallback surPeripherique = new BluetoothGattCallback() {
        @Override public void onConnectionStateChange(BluetoothGatt g, int status, int etat) {
            final String adr = g.getDevice().getAddress();
            if (etat == BluetoothProfile.STATE_CONNECTED && status == BluetoothGatt.GATT_SUCCESS) {
                h.post(() -> { peripheriques.put(adr, g); if (!g.requestMtu(MTU)) g.discoverServices(); });
            } else if (etat == BluetoothProfile.STATE_DISCONNECTED || status != BluetoothGatt.GATT_SUCCESS) {
                h.post(() -> {
                    enCours.remove(adr); peripheriques.remove(adr);
                    boolean etait = ecrire.remove(adr) != null;
                    try { g.close(); } catch (Exception e) { /* */ }
                    if (etait) pair("p:" + adr, "perdu");
                });
            }
        }
        @Override public void onMtuChanged(BluetoothGatt g, int mtu, int status) { h.post(g::discoverServices); }
        @Override public void onServicesDiscovered(BluetoothGatt g, int status) {
            h.post(() -> {
                String adr = g.getDevice().getAddress();
                BluetoothGattService s = g.getService(SERVICE);
                BluetoothGattCharacteristic c = s == null ? null : s.getCharacteristic(CARAC);
                if (c == null) { enCours.remove(adr); g.disconnect(); return; }
                g.setCharacteristicNotification(c, true);
                BluetoothGattDescriptor desc = c.getDescriptor(CCCD);
                if (desc == null) { pret(g, c); return; }
                boolean ok;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) ok = g.writeDescriptor(desc, BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE) == 0;
                else ok = ecrireDescripteurAncien(g, desc);
                if (!ok) pret(g, c);
            });
        }
        @Override public void onDescriptorWrite(BluetoothGatt g, BluetoothGattDescriptor desc, int status) {
            h.post(() -> {
                BluetoothGattService s = g.getService(SERVICE);
                BluetoothGattCharacteristic c = s == null ? null : s.getCharacteristic(CARAC);
                if (c != null) pret(g, c);
            });
        }
        @Override public void onCharacteristicWrite(BluetoothGatt g, BluetoothGattCharacteristic c, int status) { finie(); }
        // Android 13+ : la valeur arrive en argument ; avant : dans la caractéristique
        @Override public void onCharacteristicChanged(BluetoothGatt g, BluetoothGattCharacteristic c, byte[] valeur) {
            if (CARAC.equals(c.getUuid())) message("p:" + g.getDevice().getAddress(), valeur);
        }
        @SuppressWarnings("deprecation")
        @Override public void onCharacteristicChanged(BluetoothGatt g, BluetoothGattCharacteristic c) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU && CARAC.equals(c.getUuid())) message("p:" + g.getDevice().getAddress(), c.getValue());
        }
    };

    @SuppressWarnings("deprecation")
    private boolean ecrireDescripteurAncien(BluetoothGatt g, BluetoothGattDescriptor desc) {
        desc.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
        return g.writeDescriptor(desc);
    }

    private void pret(BluetoothGatt g, BluetoothGattCharacteristic c) {
        String adr = g.getDevice().getAddress();
        enCours.remove(adr);
        if (ecrire.put(adr, c) == null) pair("p:" + adr, "connecte");
    }
}
