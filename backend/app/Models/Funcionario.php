<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Funcionario extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'nome',
        'email',
        'cargo',
        'admissao',
        'telefone',
        'ativo',
        'token_acesso',
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
