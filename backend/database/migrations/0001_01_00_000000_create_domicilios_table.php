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
        Schema::create('domicilios', function (Blueprint $table) {
            $table->id('id_domicilio');
            $table->string('endereco_residencial', 255);
            $table->string('bairro', 100);
            $table->integer('numero')->nullable();
            $table->string('ponto_referencia', 255)->nullable();
            $table->enum('moradia', ['propria', 'cedida', 'alugada'])->default('propria');
            $table->decimal('despesa_agua', 10, 2)->default(0.00);
            $table->decimal('despesa_luz', 10, 2)->default(0.00);
            $table->decimal('despesa_alimentacao', 10, 2)->default(0.00);
            $table->decimal('despesa_gas', 10, 2)->default(0.00);
            $table->decimal('renda_total', 10, 2)->default(0.00);
            $table->decimal('renda_percapta', 10, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('domicilios');
    }
};
