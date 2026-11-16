<?php

namespace App\Http\Controllers;

use App\Models\Responsavel;
use App\Rules\CpfValido;
use Illuminate\Http\Request;

class ResponsavelController extends Controller
{
    private function resumo(Responsavel $responsavel): array
    {
        return [
            'id' => $responsavel->id_responsavel, 'nome' => $responsavel->nome,
            'cpf' => $responsavel->cpf, 'nis' => $responsavel->nis,
            'profissao' => $responsavel->profissao, 'telefone' => $responsavel->telefone,
            'foto' => $responsavel->foto ? '/storage/' . ltrim($responsavel->foto, '/') : null,
        ];
    }

    public function index()
    {
        return response()->json(['responsaveis' => Responsavel::orderBy('nome')->orderBy('id_responsavel')
            ->get()->map(fn ($responsavel) => $this->resumo($responsavel))]);
    }

    public function show(string $id)
    {
        $responsavel = Responsavel::with(['domicilio', 'alunos' => fn ($query) => $query->orderBy('name')])->findOrFail($id);
        $domicilio = $responsavel->domicilio;

        return response()->json(['responsavel' => array_merge($this->resumo($responsavel), [
            'cadastro' => $responsavel->created_at?->format('Y-m-d'),
            'endereco' => [
                'bairro' => $domicilio?->bairro, 'rua' => $domicilio?->endereco_residencial,
                'numero' => $domicilio?->numero, 'referencia' => $domicilio?->ponto_referencia,
                'cidade' => $domicilio ? implode(', ', array_filter([$domicilio->cidade, $domicilio->estado])) : null,
                'comercial' => $responsavel->endereco_comercial,
            ],
            'dados' => [
                'rg' => $responsavel->rg, 'nascimento' => $responsavel->data_nascimento?->format('Y-m-d'),
                'escolaridade' => $responsavel->escolaridade,
            ],
            'renda' => [
                'salario' => $responsavel->salario, 'total' => $domicilio?->renda_total,
                'percapta' => $domicilio?->renda_percapta, 'moradia' => $domicilio?->moradia,
                'beneficio_governo' => $domicilio?->beneficio_governo,
                'nome_beneficio' => $domicilio?->nome_beneficio, 'valor_beneficio' => $domicilio?->valor_beneficio,
            ],
            'despesas' => [
                ['Água', $domicilio?->despesa_agua], ['Luz', $domicilio?->despesa_luz],
                ['Gás', $domicilio?->despesa_gas], ['Alimentação', $domicilio?->despesa_alimentacao],
            ],
            'alunos' => $responsavel->alunos->map(fn ($aluno) => [
                'id' => $aluno->id, 'nome' => $aluno->name,
                'foto' => $aluno->foto ? '/storage/' . ltrim($aluno->foto, '/') : null,
                'parentesco' => in_array($aluno->pivot->parentesco, ['Mãe', 'Pai']) ? 'Filho(a)' : 'Dependente',
            ]),
        ])]);
    }

    public function buscarPorCpf(Request $request)
    {
        $dados = $request->validate(['cpf' => ['required', 'string', new CpfValido]]);
        $responsavel = Responsavel::where('cpf', CpfValido::normalizar($dados['cpf']))->first();

        return response()->json(['responsavel' => $responsavel]);
    }
}
