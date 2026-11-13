<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Funcionario extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'funcionarios';
    protected $primaryKey = 'id_usuario';

    // Faz o JSON da API incluir "id", então o front (key={f.id}) continua funcionando
    protected $appends = ['id'];

    public function getIdAttribute()
    {
        return $this->attributes['id_usuario'] ?? null;
    }


    protected $fillable = [
        'nome',
        'usuario',
        'senha',
        'email',
        'cargo',
        'status',
        'data_admissao',
        'admissao',
        'telefone',
        'ativo',
        'token_acesso',
        'token',
        'password',
    ];

    protected $casts = [
        'ativo' => 'boolean',
        'password' => 'hashed',
    ];

    protected $hidden = [
        'token_acesso',
        'password',
    ];
}
