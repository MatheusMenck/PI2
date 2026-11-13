<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SaudeAluno extends Model
{
    use HasFactory;

    protected $table = 'saude_alunos';
    protected $primaryKey = 'id_saude_aluno';

    protected $fillable = [
        'fk_aluno_id',
        'queixa_principal',
        'possui_alergia',
        'descricao_alergia',
        'em_tratamento_medico',
        'gestante',
        'usa_medicacao_continua',
        'descricao_medicacao',
        'ja_foi_operado',
        'descricao_cirurgias',
        'problema_cicatrizacao',
        'problema_anestesia',
        'problema_hemorragia',
        'habitos',
        'antecedentes_familiares',
        'observacoes_saude',
        'medico_responsavel_nome',
        'medico_responsavel_telefone',
        'declaracao_veracidade',
        'data_declaracao',
        'autoriza_atendimento_odontologico',
        'data_autorizacao_odontologica',
    ];

    protected function casts(): array
    {
        return [
            'possui_alergia' => 'boolean',
            'em_tratamento_medico' => 'boolean',
            'gestante' => 'boolean',
            'usa_medicacao_continua' => 'boolean',
            'ja_foi_operado' => 'boolean',
            'problema_cicatrizacao' => 'boolean',
            'problema_anestesia' => 'boolean',
            'problema_hemorragia' => 'boolean',
            'declaracao_veracidade' => 'boolean',
            'autoriza_atendimento_odontologico' => 'boolean',
            'data_declaracao' => 'date',
            'data_autorizacao_odontologica' => 'date',
        ];
    }

    public function aluno()
    {
        return $this->belongsTo(User::class, 'fk_aluno_id', 'id');
    }
}

