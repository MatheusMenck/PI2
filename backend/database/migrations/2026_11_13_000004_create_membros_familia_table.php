<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membros_familia', function (Blueprint $table) {
            $table->id('id_membro_familia');
            $table->foreignId('fk_domicilio_id')->constrained('domicilios', 'id_domicilio')->cascadeOnDelete();
            $table->string('nome', 255);
            $table->date('data_nascimento')->nullable();
            $table->string('parentesco', 50);
            $table->decimal('renda', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membros_familia');
    }
};
