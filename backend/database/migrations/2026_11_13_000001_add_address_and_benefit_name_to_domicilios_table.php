<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('domicilios', function (Blueprint $table) {
            $table->string('cep', 20)->nullable();
            $table->string('cidade', 100)->nullable();
            $table->string('estado', 50)->nullable();
            $table->string('nome_beneficio', 100)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('domicilios', function (Blueprint $table) {
            $table->dropColumn(['cep', 'cidade', 'estado', 'nome_beneficio']);
        });
    }
};
