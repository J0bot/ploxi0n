<?php

namespace App\Console\Commands;

use App\Services\Apns;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/** php artisan push:test {compte} : une notification à tes iPhone (id ou e-mail du compte), pour vérifier la clé et la route */
class PushTest extends Command
{
    protected $signature = 'push:test {compte : id ou e-mail} {--texte=les notifications du labo marchent ✓} {--sujet=coord}';
    protected $description = 'Envoie une notification push de test aux iPhone d\'un compte';

    public function handle(): int
    {
        $c = $this->argument('compte');
        $id = ctype_digit($c) ? (int) $c : (int) DB::table('users')->where('email', $c)->value('id');
        $n = DB::table('appareils_push')->where('user_id', $id)->count();
        if (!$n) { $this->error('aucun iPhone déclaré pour ce compte : dans l\'app, ⚙ › Notifications › « Même app fermée » (connecté)'); return 1; }
        foreach (DB::table('appareils_push')->where('user_id', $id)->get() as $l) {
            [$s, $raison] = Apns::envoyer($l->jeton, Apns::corps('ploxi0n', $this->option('texte'), $this->option('sujet'), ['ouvrir' => 'coord']));
            $this->line(($s === 200 ? '✓ ' : '✕ ') . $s . ' ' . $raison . ' · …' . substr($l->jeton, -6));
        }
        return 0;
    }
}
