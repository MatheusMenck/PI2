<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AlunoController extends Controller
{
    /**
     * Cadastra um novo aluno com base nos dados do formulário de matrícula.
     */
    public function store(Request $request)
    {
        $dadosValidados = $request->validate([
            // Dados da Criança (Etapa 1)
            'nome' => ['required', 'string', 'max:255'],
            'religiao' => ['nullable', 'string', 'max:50'],
            'dataNascimento' => ['nullable', 'date'],
            'cpf' => ['nullable', 'string', 'max:14', 'unique:users,cpf'],
            'rg' => ['nullable', 'string', 'max:20'],
            'telefone' => ['nullable', 'string', 'max:20'],
            'escola' => ['nullable', 'string', 'max:150'],
            'serie' => ['nullable', 'string', 'max:50'],
            'periodo' => ['nullable', 'string', Rule::in(['manha', 'tarde', 'noite'])],
        ], [
            'nome.required' => 'O nome da criança é obrigatório.',
            'cpf.unique' => 'Este CPF já está cadastrado no sistema.',
            'periodo.in' => 'O período escolar deve ser manha, tarde ou noite.',
        ]);

        return DB::transaction(function () use ($dadosValidados) {
            $aluno = User::create([
                'name' => $dadosValidados['nome'],
                'religiao' => $dadosValidados['religiao'] ?? null,
                'data_nascimento' => $dadosValidados['dataNascimento'] ?? null,
                'cpf' => $dadosValidados['cpf'] ?? null,
                'rg' => $dadosValidados['rg'] ?? null,
                'telefone' => $dadosValidados['telefone'] ?? null,
                'escola' => $dadosValidados['escola'] ?? null,
                'escola_ano' => $dadosValidados['serie'] ?? null,
                'escola_periodo' => $dadosValidados['periodo'] ?? null,
            ]);

            return response()->json([
                'message' => 'Aluno cadastrado com sucesso!',
                'aluno' => $aluno,
            ], 201);
        });
    }
}

