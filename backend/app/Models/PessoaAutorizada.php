<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PessoaAutorizada extends Model
{
    protected $table = 'pessoas_autorizadas';
    protected $primaryKey = 'id_pessoa_autorizada';
    protected $fillable = ['fk_matricula_id', 'nome', 'parentesco', 'telefone'];

    public function matricula()
    {
        return $this->belongsTo(Matricula::class, 'fk_matricula_id', 'id_matricula');
    }
}
