<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Relato extends Model
{
    use HasFactory;

    protected $table = 'relatos';
    protected $primaryKey = 'id_relato';

    protected $fillable = [
        'fk_aluno_id',
        'fk_usuario_id',
        'titulo',
        'descricao',
        'data_registro',
    ];

    protected function casts(): array
    {
        return [
            'data_registro' => 'datetime',
        ];
    }

    public function aluno()
    {
        return $this->belongsTo(User::class, 'fk_aluno_id', 'id');
    }

    public function funcionario()
    {
        return $this->belongsTo(Funcionario::class, 'fk_usuario_id', 'id_usuario');
    }
}

