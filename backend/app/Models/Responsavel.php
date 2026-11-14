<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Responsavel extends Model
{
    use HasFactory;

    protected $table = 'responsaveis';
    protected $primaryKey = 'id_responsavel';

    protected $fillable = [
        'foto',
        'fk_domicilio_id',
        'nome',
        'cpf',
        'rg',
        'telefone',
        'data_nascimento',
        'profissao',
        'escolaridade',
        'nis',
        'salario',
        'endereco_comercial',
    ];

    protected function casts(): array
    {
        return [
            'data_nascimento' => 'date',
            'salario' => 'decimal:2',
        ];
    }

    public function domicilio()
    {
        return $this->belongsTo(Domicilio::class, 'fk_domicilio_id', 'id_domicilio');
    }

    public function alunos()
    {
        return $this->belongsToMany(User::class, 'aluno_responsavel', 'fk_responsavel_id', 'fk_aluno_id')
                    ->withPivot('parentesco', 'e_responsavel_legal', 'autorizado_retirar')
                    ->withTimestamps();
    }
}

