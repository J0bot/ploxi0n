<?php

namespace App\Http\Controllers;

use App\Services\Apns;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/** POST /api/app/push : l'iPhone déclare son jeton et ses sujets ; DELETE : il l'oublie. Même garde que /api/app/moi (le jeton de l'app). */
class AppPushController extends Controller
{
    public function store(Request $r)
    {
        $u = $r->user();
        if (!$u) return response()->json(['ok' => false, 'message' => 'pas de compte'], 401);
        $d = $r->validate([
            'jeton' => ['required', 'string', 'regex:/^[0-9a-fA-F]{64,200}$/'],
            'sujets' => ['nullable', 'array'],
            'sujets.*' => ['string', Rule::in(Apns::SUJETS)],
            'plateforme' => ['nullable', 'string', 'max:16'],
        ]);
        DB::table('appareils_push')->updateOrInsert(
            ['jeton' => strtolower($d['jeton'])],
            ['user_id' => $u->id, 'sujets' => json_encode(array_values(array_unique($d['sujets'] ?? Apns::SUJETS))), 'plateforme' => $d['plateforme'] ?? 'ios', 'updated_at' => now()]
        );
        return response()->json(['ok' => true], 201);
    }

    public function destroy(Request $r)
    {
        $u = $r->user();
        if (!$u) return response()->json(['ok' => false], 401);
        DB::table('appareils_push')->where('jeton', strtolower((string) $r->input('jeton')))->where('user_id', $u->id)->delete();
        return response()->json(['ok' => true]);
    }
}
