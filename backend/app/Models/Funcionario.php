<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Funcionario extends Authenticatable
{
    use HasApiTokens;

    /**
     * Obter a chave primária do modelo para Sanctum / Eloquent / Sessão.
     * Suporta de forma transparente tanto bancos existentes com a coluna 'id'
     * quanto bancos recriados com 'id_usuario'.
     */
    public function getKeyName()
    {
        if (array_key_exists('id_usuario', $this->attributes)) {
            return 'id_usuario';
        }
        return 'id';
    }

    /**
     * Acessador para $funcionario->id_usuario e $funcionario->id funcionarem indistintamente.
     */
    public function getIdUsuarioAttribute()
    {
        return $this->attributes['id_usuario'] ?? $this->attributes['id'] ?? null;
    }

    public function getIdAttribute()
    {
        return $this->attributes['id'] ?? $this->attributes['id_usuario'] ?? null;
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
