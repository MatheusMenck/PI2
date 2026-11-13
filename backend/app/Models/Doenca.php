<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Doenca extends Model
{
    use HasFactory;

    protected $table = 'doencas';
    protected $primaryKey = 'id_doenca';

    protected $fillable = [
        'nome',
        'detalhes',
    ];

    public function alunos()
    {
        return $this->belongsToMany(User::class, 'aluno_doenca', 'fk_doenca_id', 'fk_aluno_id')
                    ->withPivot('observacao', 'medicacao_em_uso', 'status', 'requer_cuidados_especiais')
                    ->withTimestamps();
    }
}

