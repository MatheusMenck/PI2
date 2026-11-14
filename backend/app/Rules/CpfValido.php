<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class CpfValido implements ValidationRule
{
    public static function normalizar(string $cpf): string
    {
        return preg_replace('/[.\-\s]/', '', $cpf);
    }

    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $cpf = is_string($value) ? self::normalizar($value) : '';
        if (!preg_match('/^[0-9]{11}$/', $cpf) || preg_match('/^([0-9])\1{10}$/', $cpf)) {
            $fail('Informe um CPF válido.');
            return;
        }

        for ($posicao = 9; $posicao <= 10; $posicao++) {
            $soma = 0;
            for ($indice = 0; $indice < $posicao; $indice++) {
                $soma += (int) $cpf[$indice] * ($posicao + 1 - $indice);
            }
            $digito = (10 * $soma) % 11;
            if (($digito === 10 ? 0 : $digito) !== (int) $cpf[$posicao]) {
                $fail('Informe um CPF válido.');
                return;
            }
        }
    }
}
