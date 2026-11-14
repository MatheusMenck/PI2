<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('domicilios', function (Blueprint $table) {
            $table->boolean('beneficio_governo')->default(false);
            $table->decimal('valor_beneficio', 10, 2)->default(0);
        });
        Schema::table('responsaveis', function (Blueprint $table) {
            $table->dropColumn(['beneficio_governo', 'valor_beneficio']);
        });
    }

    public function down(): void
    {
        Schema::table('responsaveis', function (Blueprint $table) {
            $table->boolean('beneficio_governo')->default(false);
            $table->decimal('valor_beneficio', 10, 2)->default(0);
        });
        Schema::table('domicilios', function (Blueprint $table) {
            $table->dropColumn(['beneficio_governo', 'valor_beneficio']);
        });
    }
};
