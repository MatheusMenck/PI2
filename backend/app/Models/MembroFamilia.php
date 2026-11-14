<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MembroFamilia extends Model
{
    protected $table = 'membros_familia';
    protected $primaryKey = 'id_membro_familia';
    protected $fillable = ['nome', 'data_nascimento', 'parentesco', 'renda'];
    protected $casts = ['data_nascimento' => 'date', 'renda' => 'decimal:2'];

    public function domicilio()
    {
        return $this->belongsTo(Domicilio::class, 'fk_domicilio_id', 'id_domicilio');
    }
}
