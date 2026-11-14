<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Matricula extends Model
{
    protected $table = 'matriculas';
    protected $primaryKey = 'id_matricula';
    protected $fillable = ['fk_aluno_id', 'data_matricula', 'responsavel_que_aprovou', 'assinatura_responsavel', 'autorizado_sair_sozinho'];
    protected $casts = ['data_matricula' => 'date', 'autorizado_sair_sozinho' => 'boolean'];

    public function aluno()
    {
        return $this->belongsTo(User::class, 'fk_aluno_id', 'id');
    }

    public function pessoasAutorizadas()
    {
        return $this->hasMany(PessoaAutorizada::class, 'fk_matricula_id', 'id_matricula');
    }
}
