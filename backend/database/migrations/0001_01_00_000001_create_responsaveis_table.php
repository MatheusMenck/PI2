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
        Schema::create('responsaveis', function (Blueprint $table) {
            $table->id('id_responsavel');
            $table->foreignId('fk_domicilio_id')->constrained('domicilios', 'id_domicilio')->onUpdate('cascade')->onDelete('restrict');
            $table->string('nome', 255);
            $table->string('cpf', 14)->nullable()->unique();
            $table->string('rg', 20)->nullable();
            $table->string('telefone', 20)->nullable();
            $table->date('data_nascimento')->nullable();
            $table->string('profissao', 100)->nullable();
            $table->string('escolaridade', 100)->nullable();
            $table->string('nis', 20)->nullable();
            $table->decimal('salario', 10, 2)->default(0.00);
            $table->boolean('beneficio_governo')->default(false);
            $table->decimal('valor_beneficio', 10, 2)->default(0.00);
            $table->string('endereco_comercial', 255)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('responsaveis');
    }
};
