<?php

namespace App\Http\Controllers;

use App\Models\Relato;
use App\Models\Responsavel;
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

            // Dados da Mãe (Etapa 3)
            'nomeMae' => ['nullable', 'string', 'max:255'],
            'nisMae' => ['nullable', 'string', 'max:20'],
            'nascimentoMae' => ['nullable', 'date'],
            'cpfMae' => ['nullable', 'string', 'max:14'],
            'escolaridadeMae' => ['nullable', 'string', 'max:100'],
            'rgMae' => ['nullable', 'string', 'max:20'],
            'telefoneMae' => ['nullable', 'string', 'max:20'],
            'profissaoMae' => ['nullable', 'string', 'max:100'],
            'salarioMae' => ['nullable', 'numeric'],
            'enderecoComercialMae' => ['nullable', 'string', 'max:255'],

            // Dados do Pai (Etapa 4)
            'nomePai' => ['nullable', 'string', 'max:255'],
            'nisPai' => ['nullable', 'string', 'max:20'],
            'nascimentoPai' => ['nullable', 'date'],
            'cpfPai' => ['nullable', 'string', 'max:14'],
            'escolaridadePai' => ['nullable', 'string', 'max:100'],
            'rgPai' => ['nullable', 'string', 'max:20'],
            'telefonePai' => ['nullable', 'string', 'max:20'],
            'profissaoPai' => ['nullable', 'string', 'max:100'],
            'salarioPai' => ['nullable', 'numeric'],
            'enderecoComercialPai' => ['nullable', 'string', 'max:255'],
        ], [
            'nome.required' => 'O nome da criança é obrigatório.',
            'cpf.unique' => 'Este CPF já está cadastrado no sistema.',
            'periodo.in' => 'O período escolar deve ser manha, tarde ou noite.',
        ]);

        // Pelo menos um responsável deve ser informado
        if (empty($dadosValidados['nomeMae']) && empty($dadosValidados['nomePai'])) {
            return response()->json([
                'message' => 'Pelo menos um dos responsáveis (Mãe ou Pai) deve ter o nome informado.',
                'errors' => [
                    'responsavel' => ['Informe os dados da Mãe ou do Pai para concluir a matrícula.']
                ]
            ], 422);
        }

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

            // 3. Criar e associar a Mãe (se informada)
            if (!empty($dadosValidados['nomeMae'])) {
                $mae = Responsavel::create([
                    'nome' => $dadosValidados['nomeMae'],
                    'nis' => $dadosValidados['nisMae'] ?? null,
                    'data_nascimento' => $dadosValidados['nascimentoMae'] ?? null,
                    'cpf' => $dadosValidados['cpfMae'] ?? null,
                    'escolaridade' => $dadosValidados['escolaridadeMae'] ?? null,
                    'rg' => $dadosValidados['rgMae'] ?? null,
                    'telefone' => $dadosValidados['telefoneMae'] ?? null,
                    'profissao' => $dadosValidados['profissaoMae'] ?? null,
                    'salario' => $dadosValidados['salarioMae'] ?? 0.00,
                    'endereco_comercial' => $dadosValidados['enderecoComercialMae'] ?? null,
                ]);

                $aluno->responsaveis()->attach($mae->id_responsavel, [
                    'parentesco' => 'Mãe',
                    'e_responsavel_legal' => true,
                    'autorizado_retirar' => true,
                ]);
            }

            // 4. Criar e associar o Pai (se informado)
            if (!empty($dadosValidados['nomePai'])) {
                $pai = Responsavel::create([
                    'nome' => $dadosValidados['nomePai'],
                    'nis' => $dadosValidados['nisPai'] ?? null,
                    'data_nascimento' => $dadosValidados['nascimentoPai'] ?? null,
                    'cpf' => $dadosValidados['cpfPai'] ?? null,
                    'escolaridade' => $dadosValidados['escolaridadePai'] ?? null,
                    'rg' => $dadosValidados['rgPai'] ?? null,
                    'telefone' => $dadosValidados['telefonePai'] ?? null,
                    'profissao' => $dadosValidados['profissaoPai'] ?? null,
                    'salario' => $dadosValidados['salarioPai'] ?? 0.00,
                    'endereco_comercial' => $dadosValidados['enderecoComercialPai'] ?? null,
                ]);

                $aluno->responsaveis()->attach($pai->id_responsavel, [
                    'parentesco' => 'Pai',
                    'e_responsavel_legal' => empty($dadosValidados['nomeMae']), // se não houver mãe, pai é o principal
                    'autorizado_retirar' => true,
                ]);
            }

            return response()->json([
                'message' => 'Aluno cadastrado com sucesso!',
                'aluno' => $aluno->load(['relatos', 'responsaveis']),
            ], 201);
        });
    }
}
