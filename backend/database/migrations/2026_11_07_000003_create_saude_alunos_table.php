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
        Schema::create('saude_alunos', function (Blueprint $table) {
            $table->id('id_saude_aluno');
            $table->foreignId('fk_aluno_id')->unique()->constrained('users', 'id')->onUpdate('cascade')->onDelete('cascade');
            $table->boolean('possui_alergia')->default(false);
            $table->text('descricao_alergia')->nullable();
            $table->boolean('em_tratamento_medico')->default(false);
            $table->boolean('gestante')->default(false);
            $table->boolean('usa_medicacao_continua')->default(false);
            $table->text('descricao_medicacao')->nullable();
            $table->boolean('ja_foi_operado')->default(false);
            $table->text('descricao_cirurgias')->nullable();
            $table->boolean('problema_cicatrizacao')->default(false);
            $table->boolean('problema_anestesia')->default(false);
            $table->boolean('problema_hemorragia')->default(false);
            $table->text('habitos')->nullable();
            $table->text('antecedentes_familiares')->nullable();
            $table->text('observacoes_saude')->nullable();
            $table->string('medico_responsavel_nome', 255)->nullable();
            $table->string('medico_responsavel_telefone', 20)->nullable();
            $table->boolean('declaracao_veracidade')->default(false);
            $table->date('data_declaracao')->nullable();
            $table->boolean('autoriza_atendimento_odontologico')->default(false);
            $table->date('data_autorizacao_odontologica')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saude_alunos');
    }
};

