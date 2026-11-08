<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('aluno_doenca', function (Blueprint $table) {
            $table->foreignId('fk_aluno_id')->constrained('users', 'id')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('fk_doenca_id')->constrained('doencas', 'id_doenca')->onUpdate('cascade')->onDelete('restrict');
            $table->text('observacao')->nullable();
            $table->string('medicacao_em_uso', 255)->nullable();
            $table->enum('status', ['atual', 'curada_historico'])->default('atual');
            $table->boolean('requer_cuidados_especiais')->default(false);
            $table->primary(['fk_aluno_id', 'fk_doenca_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aluno_doenca');
    }
};

