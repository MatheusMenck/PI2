<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('funcionarios')) {
            return;
        }

        if (! Schema::hasColumn('funcionarios', 'id_usuario') && Schema::hasColumn('funcionarios', 'id')) {
            Schema::table('funcionarios', function (Blueprint $table) {
                $table->renameColumn('id', 'id_usuario');
            });
        }

        Schema::table('funcionarios', function (Blueprint $table) {
            if (! Schema::hasColumn('funcionarios', 'senha')) {
                $table->string('senha', 255)->nullable();
            }
            if (! Schema::hasColumn('funcionarios', 'status')) {
                $table->enum('status', ['ativo', 'inativo'])->default('ativo');
            }
            if (! Schema::hasColumn('funcionarios', 'data_admissao')) {
                $table->date('data_admissao')->nullable();
            }
            if (! Schema::hasColumn('funcionarios', 'token')) {
                $table->string('token', 255)->nullable();
            }
        });
    }

    public function down(): void
    {
        if (Schema::hasTable('funcionarios')
            && Schema::hasColumn('funcionarios', 'id_usuario')
            && ! Schema::hasColumn('funcionarios', 'id')) {
            Schema::table('funcionarios', function (Blueprint $table) {
                $table->renameColumn('id_usuario', 'id');
            });
        }

        // Mantém as colunas adicionadas no reparo para não descartar dados.
    }
};
