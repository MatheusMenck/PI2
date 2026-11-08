<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Domicilio extends Model
{
    use HasFactory;

    protected $table = 'domicilios';
    protected $primaryKey = 'id_domicilio';

    protected $fillable = [
        'endereco_residencial',
        'bairro',
        'numero',
        'ponto_referencia',
        'moradia',
        'despesa_agua',
        'despesa_luz',
        'despesa_alimentacao',
        'despesa_gas',
        'renda_total',
        'renda_percapta',
    ];

    protected function casts(): array
    {
        return [
            'numero' => 'integer',
            'despesa_agua' => 'decimal:2',
            'despesa_luz' => 'decimal:2',
            'despesa_alimentacao' => 'decimal:2',
            'despesa_gas' => 'decimal:2',
            'renda_total' => 'decimal:2',
            'renda_percapta' => 'decimal:2',
        ];
    }

    public function alunos()
    {
        return $this->hasMany(User::class, 'fk_domicilio_id', 'id_domicilio');
    }

    public function responsaveis()
    {
        return $this->hasMany(Responsavel::class, 'fk_domicilio_id', 'id_domicilio');
    }
}

