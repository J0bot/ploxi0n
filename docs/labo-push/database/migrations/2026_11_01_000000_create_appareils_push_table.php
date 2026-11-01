<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appareils_push', function (Blueprint $t) {
            $t->id();
            $t->unsignedBigInteger('user_id')->index();
            $t->string('jeton', 200)->unique();
            $t->json('sujets')->nullable();
            $t->string('plateforme', 16)->default('ios');
            $t->timestamp('created_at')->useCurrent();
            $t->timestamp('updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appareils_push');
    }
};
