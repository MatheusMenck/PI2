<?php

namespace App\Http\Middleware;

use App\Models\Funcionario;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureFuncionario
{
    public function handle(Request $request, Closure $next, ?string $cargo = null): Response
    {
        $funcionario = $request->user();

        abort_unless($funcionario instanceof Funcionario && $funcionario->ativo, 403, 'Acesso permitido apenas a funcionários ativos.');

        if ($cargo !== null) {
            abort_unless($funcionario->cargo === $cargo, 403, 'Acesso permitido apenas a administradores.');
        }

        return $next($request);
    }
}
