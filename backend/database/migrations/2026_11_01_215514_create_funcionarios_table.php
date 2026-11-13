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
        Schema::create('funcionarios', function (Blueprint $table) {
            $table->id('id_usuario');
            $table->string('nome', 255);
            $table->string('senha', 255)->nullable();
            $table->string('email', 255)->unique();
            $table->enum('cargo', ['admin', 'funcionario'])->default('funcionario');
            $table->enum('status', ['ativo', 'inativo'])->default('ativo');
            $table->date('data_admissao')->nullable();
            $table->string('admissao', 50)->nullable();
            $table->string('telefone', 20)->nullable();
            $table->boolean('ativo')->default(true);
            $table->string('token_acesso')->nullable();
            $table->string('token', 255)->nullable();
            $table->string('password')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('funcionarios');
    }
};
