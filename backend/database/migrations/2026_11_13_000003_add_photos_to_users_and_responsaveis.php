<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['users', 'responsaveis'] as $tabela) {
            Schema::table($tabela, function (Blueprint $table) {
                $table->string('foto', 255)->nullable();
            });
        }
    }

    public function down(): void
    {
        foreach (['users', 'responsaveis'] as $tabela) {
            Schema::table($tabela, function (Blueprint $table) {
                $table->dropColumn('foto');
            });
        }
    }
};
