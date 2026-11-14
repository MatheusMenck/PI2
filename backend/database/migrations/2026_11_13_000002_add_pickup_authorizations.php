<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('matriculas', function (Blueprint $table) {
            $table->boolean('autorizado_sair_sozinho')->nullable();
        });

        Schema::create('pessoas_autorizadas', function (Blueprint $table) {
            $table->id('id_pessoa_autorizada');
            $table->foreignId('fk_matricula_id')->constrained('matriculas', 'id_matricula')->cascadeOnDelete();
            $table->string('nome', 255);
            $table->string('parentesco', 50);
            $table->string('telefone', 20);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pessoas_autorizadas');
        Schema::table('matriculas', function (Blueprint $table) {
            $table->dropColumn('autorizado_sair_sozinho');
        });
    }
};
