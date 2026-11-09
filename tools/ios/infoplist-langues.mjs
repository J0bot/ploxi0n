// ⟡ (0.99.23, docs/LANGUES.md : « les demandes de permission d'iOS, InfoPlist.strings par langue, ajoutées par fastlane ») : les textes des
// autorisations (caméra, position, Bluetooth…) dans la langue de l'iPhone. Le français est la source (Info.plist) ; les autres langues sont
// ici. Écrit ios/App/App/<langue>.lproj/InfoPlist.strings ; fastlane (ajouter_langues) les met dans le projet sur le Mac de la CI.
//   node tools/ios/infoplist-langues.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
export const TEXTES = {
  NSCameraUsageDescription: {
    en: 'ploxi0n uses the camera when a ploxion asks for it (photo, scan); nothing leaves your phone without your consent.',
    de: 'ploxi0n nutzt die Kamera, wenn ein ploxion danach fragt (Foto, Scan); nichts verlässt dein Telefon ohne deine Zustimmung.',
    it: 'ploxi0n usa la fotocamera quando un ploxion te lo chiede (foto, scansione); nulla lascia il tuo telefono senza il tuo consenso.',
    es: 'ploxi0n usa la cámara cuando un ploxion te lo pide (foto, escaneo); nada sale de tu teléfono sin tu permiso.' },
  NSPhotoLibraryUsageDescription: {
    en: 'ploxi0n opens your photos when you choose to give one to a ploxion.', de: 'ploxi0n öffnet deine Fotos, wenn du einem ploxion eines geben willst.',
    it: 'ploxi0n apre le tue foto quando scegli di darne una a un ploxion.', es: 'ploxi0n abre tus fotos cuando eliges darle una a un ploxion.' },
  NSPhotoLibraryAddUsageDescription: {
    en: 'ploxi0n saves to your photos what you choose to export.', de: 'ploxi0n speichert in deinen Fotos, was du exportieren willst.',
    it: 'ploxi0n salva nelle tue foto ciò che scegli di esportare.', es: 'ploxi0n guarda en tus fotos lo que eliges exportar.' },
  NSMicrophoneUsageDescription: {
    en: 'ploxi0n uses the microphone when a ploxion records or listens, only when you ask.', de: 'ploxi0n nutzt das Mikrofon, wenn ein ploxion aufnimmt oder zuhört, nur auf deinen Wunsch.',
    it: 'ploxi0n usa il microfono quando un ploxion registra o ascolta, solo su tua richiesta.', es: 'ploxi0n usa el micrófono cuando un ploxion graba o escucha, solo cuando tú lo pides.' },
  NSLocationWhenInUseUsageDescription: {
    en: 'ploxi0n uses your location when a ploxion needs it (map, places, finding your friends); it stays on your phone unless you share it with them.',
    de: 'ploxi0n nutzt deinen Standort, wenn ein ploxion ihn braucht (Karte, Orte, deine Freunde finden); er bleibt auf deinem Telefon, ausser du teilst ihn mit ihnen.',
    it: 'ploxi0n usa la tua posizione quando un ploxion ne ha bisogno (mappa, luoghi, ritrovare gli amici); resta sul tuo telefono, a meno che tu non la condivida con loro.',
    es: 'ploxi0n usa tu ubicación cuando un ploxion la necesita (mapa, lugares, encontrar a tus amigos); se queda en tu teléfono salvo que la compartas con ellos.' },
  NSMotionUsageDescription: {
    en: 'ploxi0n reads the motion sensors for the ploxions that use them (steps, tilt, compass).', de: 'ploxi0n liest die Bewegungssensoren für die ploxions, die sie nutzen (Schritte, Neigung, Kompass).',
    it: 'ploxi0n legge i sensori di movimento per i ploxion che li usano (passi, inclinazione, bussola).', es: 'ploxi0n lee los sensores de movimiento para los ploxions que los usan (pasos, inclinación, brújula).' },
  NSLocationAlwaysAndWhenInUseUsageDescription: {
    en: 'ploxi0n only uses your location in the background if a ploxion offers it and you accept (for example places you visited); it stays on your phone.',
    de: 'ploxi0n nutzt deinen Standort im Hintergrund nur, wenn ein ploxion es anbietet und du zustimmst (zum Beispiel besuchte Orte); er bleibt auf deinem Telefon.',
    it: 'ploxi0n usa la tua posizione in background solo se un ploxion lo propone e tu accetti (per esempio i luoghi visitati); resta sul tuo telefono.',
    es: 'ploxi0n solo usa tu ubicación en segundo plano si un ploxion lo propone y aceptas (por ejemplo los lugares visitados); se queda en tu teléfono.' },
  NSLocationAlwaysUsageDescription: {
    en: 'ploxi0n only uses your location in the background if a ploxion offers it and you accept; it stays on your phone.', de: 'ploxi0n nutzt deinen Standort im Hintergrund nur, wenn ein ploxion es anbietet und du zustimmst; er bleibt auf deinem Telefon.',
    it: 'ploxi0n usa la tua posizione in background solo se un ploxion lo propone e tu accetti; resta sul tuo telefono.', es: 'ploxi0n solo usa tu ubicación en segundo plano si un ploxion lo propone y aceptas; se queda en tu teléfono.' },
  NSBluetoothAlwaysUsageDescription: {
    en: 'ploxi0n uses Bluetooth to see and control the devices around you (sensors, lights, robots) when a ploxion offers it.', de: 'ploxi0n nutzt Bluetooth, um die Geräte um dich herum zu sehen und zu steuern (Sensoren, Lichter, Roboter), wenn ein ploxion es anbietet.',
    it: 'ploxi0n usa il Bluetooth per vedere e comandare i dispositivi intorno a te (sensori, luci, robot) quando un ploxion lo propone.', es: 'ploxi0n usa el Bluetooth para ver y controlar los dispositivos a tu alrededor (sensores, luces, robots) cuando un ploxion lo propone.' },
  NSHealthShareUsageDescription: {
    en: 'ploxi0n reads the Health data you allow (steps, sleep, heart rate) for your health ploxions. It stays on your phone, unless you choose to send a summary to your own boxion.',
    de: 'ploxi0n liest die Gesundheitsdaten, die du erlaubst (Schritte, Schlaf, Puls), für deine Gesundheits-ploxions. Sie bleiben auf deinem Telefon, ausser du sendest eine Zusammenfassung an deinen eigenen boxion.',
    it: 'ploxi0n legge i dati Salute che autorizzi (passi, sonno, battito) per i tuoi ploxion della salute. Restano sul tuo telefono, a meno che tu non scelga di inviare un riepilogo al tuo boxion.',
    es: 'ploxi0n lee los datos de Salud que autorizas (pasos, sueño, pulso) para tus ploxions de salud. Se quedan en tu teléfono, salvo que elijas enviar un resumen a tu propio boxion.' },
  NSHealthUpdateUsageDescription: {
    en: 'ploxi0n only writes to Health what you ask it to record.', de: 'ploxi0n schreibt nur in Health, was du aufzeichnen lässt.',
    it: 'ploxi0n scrive in Salute solo ciò che gli chiedi di registrare.', es: 'ploxi0n solo escribe en Salud lo que le pides registrar.' },
  NFCReaderUsageDescription: {
    en: 'ploxi0n reads the NFC tags you bring close, for the ploxions that use them.', de: 'ploxi0n liest die NFC-Tags, die du nahe bringst, für die ploxions, die sie nutzen.',
    it: 'ploxi0n legge i tag NFC che avvicini, per i ploxion che li usano.', es: 'ploxi0n lee las etiquetas NFC que acercas, para los ploxions que las usan.' },
  NSLocalNetworkUsageDescription: {
    en: 'ploxi0n finds and controls the devices on your network: Home Assistant, WLED, ESPHome, Tasmota, your Raspberry Pis and your boxions. And, when you start it in Proche, the phones around you to share messages, sound and where your friends are.',
    de: 'ploxi0n findet und steuert die Geräte in deinem Netz: Home Assistant, WLED, ESPHome, Tasmota, deine Raspberry Pis und deine boxions. Und, wenn du es in Proche startest, die Telefone um dich herum, um Nachrichten, Klang und den Ort deiner Freunde zu teilen.',
    it: 'ploxi0n trova e comanda i dispositivi della tua rete: Home Assistant, WLED, ESPHome, Tasmota, i tuoi Raspberry Pi e i tuoi boxion. E, quando lo avvii in Proche, i telefoni intorno a te per condividere messaggi, suoni e dove sono i tuoi amici.',
    es: 'ploxi0n encuentra y controla los dispositivos de tu red: Home Assistant, WLED, ESPHome, Tasmota, tus Raspberry Pi y tus boxions. Y, cuando lo inicias en Proche, los teléfonos a tu alrededor para compartir mensajes, sonido y dónde están tus amigos.' },
  NSHomeKitUsageDescription: {
    en: 'ploxi0n turns on, turns off and shows your home accessories from your ploxions.', de: 'ploxi0n schaltet die Zubehörteile deines Zuhauses aus deinen ploxions ein, aus und zeigt sie.',
    it: 'ploxi0n accende, spegne e mostra gli accessori di casa dai tuoi ploxion.', es: 'ploxi0n enciende, apaga y muestra los accesorios de tu casa desde tus ploxions.' },
  NSAppleMusicUsageDescription: {
    en: 'ploxi0n searches and plays Apple Music in your ploxions.', de: 'ploxi0n sucht und spielt Apple Music in deinen ploxions.',
    it: 'ploxi0n cerca e riproduce Apple Music nei tuoi ploxion.', es: 'ploxi0n busca y reproduce Apple Music en tus ploxions.' },
  NSSpeechRecognitionUsageDescription: {
    en: 'ploxi0n turns your voice notes into text, on your phone when possible.', de: 'ploxi0n schreibt deine Sprachnachrichten als Text, wenn möglich auf deinem Telefon.',
    it: 'ploxi0n trascrive i tuoi vocali in testo, sul tuo telefono quando possibile.', es: 'ploxi0n transcribe tus notas de voz a texto, en tu teléfono cuando es posible.' },
  NSFaceIDUsageDescription: {
    en: 'ploxi0n uses Face ID to open the ploxions and secrets you locked.', de: 'ploxi0n nutzt Face ID, um die ploxions und Geheimnisse zu öffnen, die du gesperrt hast.',
    it: 'ploxi0n usa Face ID per aprire i ploxion e i segreti che hai bloccato.', es: 'ploxi0n usa Face ID para abrir los ploxions y secretos que bloqueaste.' },
};
export const LANGUES = ['en', 'de', 'it', 'es'];
const echapper = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
export const strings = (paires) => '/* généré par tools/ios/infoplist-langues.mjs : ne pas éditer à la main */\n' + Object.entries(paires).map(([k, v]) => '"' + k + '" = "' + echapper(v) + '";').join('\n') + '\n';

if (import.meta.url === 'file://' + process.argv[1]) {
  const plist = readFileSync('ios/App/App/Info.plist', 'utf8'), fr = {};
  for (const m of plist.matchAll(/<key>(\w+UsageDescription)<\/key>\s*<string>([^<]*)<\/string>/g)) fr[m[1]] = m[2].replace(/&apos;/g, '\'').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
  const manque = Object.keys(fr).filter(k => !TEXTES[k]); if (manque.length) { console.error('à traduire : ' + manque.join(', ')); process.exit(1); }
  for (const [l, f] of [['fr', (k) => fr[k]], ...LANGUES.map(x => [x, (k) => TEXTES[k][x]])]) {
    mkdirSync('ios/App/App/' + l + '.lproj', { recursive: true });
    writeFileSync('ios/App/App/' + l + '.lproj/InfoPlist.strings', strings(Object.fromEntries(Object.keys(fr).map(k => [k, f(k)]))));
  }
  console.log(Object.keys(fr).length + ' autorisations × ' + (LANGUES.length + 1) + ' langues → ios/App/App/*.lproj/InfoPlist.strings');
}
