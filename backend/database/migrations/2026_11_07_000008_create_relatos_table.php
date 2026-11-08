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
        Schema::create('relatos', function (Blueprint $table) {
            $table->id('id_relato');
            $table->foreignId('fk_aluno_id')->constrained('users', 'id')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('fk_usuario_id')->constrained('funcionarios', 'id_usuario')->onUpdate('cascade')->onDelete('restrict');
            $table->string('titulo', 150);
            $table->text('descricao');
            $table->dateTime('data_registro')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('relatos');
    }
};

