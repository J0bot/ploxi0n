<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Les notifications push de ploxi0n (APNs, la clé sur le labo : docs/PUSH.md du dépôt ploxi0n).
 * Une clé .p8 signe un JWT ES256 (gardé 50 min : Apple refuse un JWT neuf à chaque envoi), une requête HTTP/2 par appareil.
 *
 *   Apns::auCompte($userId, 'coord', '📡 coord · #push', 'le message', ['ouvrir' => 'coord', 'params' => ['topic' => 'push']]);
 *   Apns::aTous('coord', …, sauf: $auteurId);   // tous les comptes abonnés à ce sujet
 */
class Apns
{
    public const SUJETS = ['coord', 'messages', 'bother', 'ploxions'];

    /** à un compte : chacun de ses appareils abonnés à ce sujet ; rend le nombre d'envois acceptés par Apple */
    public static function auCompte(int $userId, string $sujet, string $titre, string $texte, array $data = []): int
    {
        return self::versLignes(DB::table('appareils_push')->where('user_id', $userId)->get(), $sujet, $titre, $texte, $data);
    }

    /** à tous les comptes abonnés à ce sujet (sauf l'auteur) */
    public static function aTous(string $sujet, string $titre, string $texte, array $data = [], ?int $sauf = null): int
    {
        $q = DB::table('appareils_push');
        if ($sauf !== null) $q->where('user_id', '!=', $sauf);
        return self::versLignes($q->get(), $sujet, $titre, $texte, $data);
    }

    private static function versLignes($lignes, string $sujet, string $titre, string $texte, array $data): int
    {
        $ok = 0;
        foreach ($lignes as $l) {
            $sujets = json_decode($l->sujets ?: '[]', true) ?: [];
            if (!in_array($sujet, $sujets, true)) continue;
            [$status] = self::envoyer($l->jeton, self::corps($titre, $texte, $sujet, $data));
            if ($status === 200) $ok++;
        }
        return $ok;
    }

    public static function corps(string $titre, string $texte, string $sujet, array $data = []): array
    {
        return array_merge(['aps' => ['alert' => ['title' => mb_substr($titre, 0, 120), 'body' => mb_substr($texte, 0, 1000)], 'sound' => 'default', 'thread-id' => $sujet]], $data);
    }

    /** un envoi : [status HTTP, raison d'Apple] ; un jeton mort (410, BadDeviceToken) est effacé */
    public static function envoyer(string $jeton, array $corps): array
    {
        $c = config('services.apns');
        $hote = !empty($c['prod']) ? 'https://api.push.apple.com' : 'https://api.sandbox.push.apple.com';
        $ch = curl_init($hote . '/3/device/' . $jeton);
        curl_setopt_array($ch, [
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_2_0,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($corps, JSON_UNESCAPED_UNICODE),
            CURLOPT_HTTPHEADER => [
                'authorization: bearer ' . self::jwt(),
                'apns-topic: ' . ($c['topic'] ?? 'ch.j0bot.ploxi0n'),
                'apns-push-type: alert',
                'apns-priority: 10',
                'content-type: application/json',
            ],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 10,
        ]);
        $reponse = curl_exec($ch);
        $status = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
        $erreur = curl_error($ch);
        curl_close($ch);
        $raison = $reponse ? (json_decode($reponse, true)['reason'] ?? '') : $erreur;
        if ($status === 410 || ($status === 400 && in_array($raison, ['BadDeviceToken', 'DeviceTokenNotForTopic'], true))) {
            DB::table('appareils_push')->where('jeton', $jeton)->delete();
        } elseif ($status !== 200) {
            Log::warning('APNs ' . $status . ' ' . $raison);
            if ($status === 403) Cache::forget('apns:jwt');   // la clé ou le JWT : le prochain envoi en refait un
        }
        return [$status, $raison];
    }

    private static function jwt(): string
    {
        return Cache::remember('apns:jwt', 50 * 60, function () {
            $c = config('services.apns');
            return self::jwtAvec(self::cle(), (string) $c['key_id'], (string) $c['team_id'], time());
        });
    }

    /** la clé .p8 : le texte (APNS_KEY_P8), ou en base64 (APNS_KEY_P8_B64), ou un fichier (APNS_KEY_PATH) */
    private static function cle(): string
    {
        $c = config('services.apns');
        if (!empty($c['key_p8'])) return str_replace('\n', "\n", $c['key_p8']);
        if (!empty($c['key_p8_b64'])) return base64_decode($c['key_p8_b64']);
        return file_get_contents($c['key_path']);
    }

    /** le JWT d'APNs, pur (testable) : ES256 { alg, kid } · { iss, iat } ; openssl rend du DER, Apple veut R||S */
    public static function jwtAvec(string $pem, string $kid, string $team, int $iat): string
    {
        $b64 = fn ($s) => rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
        $entree = $b64(json_encode(['alg' => 'ES256', 'kid' => $kid])) . '.' . $b64(json_encode(['iss' => $team, 'iat' => $iat]));
        $cle = openssl_pkey_get_private($pem);
        if (!$cle || !openssl_sign($entree, $der, $cle, OPENSSL_ALGO_SHA256)) throw new \RuntimeException('APNs : la clé .p8 ne se lit pas');
        return $entree . '.' . $b64(self::derVersBrut($der));
    }

    /** SEQUENCE { INTEGER r, INTEGER s } → r||s, 32 + 32 octets */
    public static function derVersBrut(string $der): string
    {
        $pos = 2;
        if (ord($der[1]) & 0x80) $pos += ord($der[1]) & 0x7f;
        $brut = '';
        for ($i = 0; $i < 2; $i++) {
            if (ord($der[$pos]) !== 0x02) throw new \RuntimeException('APNs : signature illisible');
            $n = ord($der[$pos + 1]);
            $brut .= str_pad(ltrim(substr($der, $pos + 2, $n), "\x00"), 32, "\x00", STR_PAD_LEFT);
            $pos += 2 + $n;
        }
        return $brut;
    }
}
