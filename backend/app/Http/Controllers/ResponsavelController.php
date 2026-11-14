<?php

namespace App\Http\Controllers;

use App\Models\Responsavel;
use App\Rules\CpfValido;
use Illuminate\Http\Request;

class ResponsavelController extends Controller
{
    public function buscarPorCpf(Request $request)
    {
        $dados = $request->validate(['cpf' => ['required', 'string', new CpfValido]]);
        $responsavel = Responsavel::where('cpf', CpfValido::normalizar($dados['cpf']))->first();

        return response()->json(['responsavel' => $responsavel]);
    }
}
