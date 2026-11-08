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
        Schema::create('aluno_responsavel', function (Blueprint $table) {
            $table->foreignId('fk_aluno_id')->constrained('users', 'id')->onUpdate('cascade')->onDelete('cascade');
            $table->foreignId('fk_responsavel_id')->constrained('responsaveis', 'id_responsfavel')->onUpdate('cascade')->onDelete('cascade');
            $table->string('parentesco', 50);
            $table->boolean('e_responsavel_legal')->default(false);
            $table->boolean('autorizado_retirar')->default(false);
            $table->primary(['fk_aluno_id', 'fk_responsavel_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aluno_responsavel');
    }
};

