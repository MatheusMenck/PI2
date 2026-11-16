<?php

namespace App\Http\Controllers;

use App\Models\User;

class DashboardController extends Controller
{
    public function indicadores()
    {
        $totais = ['ativos' => 0, 'pendentes' => 0, 'indeferidos' => 0];

        User::select(['id', 'created_at'])->with('matriculaAtual')->chunkById(500, function ($alunos) use (&$totais) {
            foreach ($alunos as $aluno) {
                match ($aluno->statusMatricula()) {
                    'Ativo' => $totais['ativos']++,
                    'Pendente' => $totais['pendentes']++,
                    default => null,
                };
            }
        });

        return response()->json($totais);
    }
}
