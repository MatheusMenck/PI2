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
        Schema::create('matriculas', function (Blueprint $table) {
            $table->id('id_matricula');
            $table->foreignId('fk_aluno_id')->constrained('users', 'id')->onUpdate('cascade')->onDelete('cascade');
            $table->date('data_matricula');
            $table->string('responsavel_que_aprovou', 255)->nullable();
            $table->string('assinatura_responsavel', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('matriculas');
    }
};

