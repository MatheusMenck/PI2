<?php

namespace App\Http\Controllers;

use App\Models\Relato;
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

            // Relatos da Criança (Etapa 2 - Opcionais)
            'relatos' => ['nullable', 'array'],
            'relatos.*.titulo' => ['nullable', 'string', 'max:150'],
            'relatos.*.relato' => ['nullable', 'string'],
            'relatos.*.descricao' => ['nullable', 'string'],
            'relatos.*.data' => ['nullable', 'date'],
            'relatos.*.data_registro' => ['nullable', 'date'],
        ], [
            'nome.required' => 'O nome da criança é obrigatório.',
            'cpf.unique' => 'Este CPF já está cadastrado no sistema.',
            'periodo.in' => 'O período escolar deve ser manha, tarde ou noite.',
        ]);

        return DB::transaction(function () use ($dadosValidados, $request) {
            // 1. Criar o registro do Aluno
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

            // 2. Criar os Relatos (se fornecidos)
            if (!empty($dadosValidados['relatos'])) {
                $usuarioLogado = $request->user();
                $idFuncionario = $usuarioLogado?->id_usuario ?? $usuarioLogado?->id;

                foreach ($dadosValidados['relatos'] as $itemRelato) {
                    $descricao = $itemRelato['descricao'] ?? $itemRelato['relato'] ?? null;
                    $titulo = $itemRelato['titulo'] ?? 'Relato de Matrícula';
                    $dataRegistro = $itemRelato['data_registro'] ?? $itemRelato['data'] ?? now();

                    // Só insere se houver conteúdo no relato ou título preenchido
                    if (!empty($descricao) || !empty($itemRelato['titulo'])) {
                        Relato::create([
                            'fk_aluno_id' => $aluno->id,
                            'fk_usuario_id' => $idFuncionario,
                            'titulo' => !empty($itemRelato['titulo']) ? $itemRelato['titulo'] : 'Relato de Matrícula',
                            'descricao' => $descricao ?? '',
                            'data_registro' => $dataRegistro,
                        ]);
                    }
                }
            }

            return response()->json([
                'message' => 'Aluno cadastrado com sucesso!',
                'aluno' => $aluno->load('relatos'),
            ], 201);
        });
    }
}
