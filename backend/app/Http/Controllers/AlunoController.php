<?php

namespace App\Http\Controllers;

use App\Models\Domicilio;
use App\Models\Relato;
use App\Models\Responsavel;
use App\Models\SaudeAluno;
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

            // Endereço e Residência (Etapa 5)
            'cep' => ['required', 'string', 'max:20'],
            'rua' => ['required', 'string', 'max:255'],
            'bairro' => ['required', 'string', 'max:100'],
            'numero' => ['required', 'numeric'],
            'referencia' => ['nullable', 'string', 'max:255'],
            'cidade' => ['required', 'string', 'max:100'],
            'estado' => ['required', 'string', 'max:50'],
            'tipoMoradia' => ['nullable', 'string'],
            'agua' => ['nullable', 'numeric'],
            'luz' => ['nullable', 'numeric'],
            'gas' => ['nullable', 'numeric'],
            'alimentacao' => ['nullable', 'numeric'],
            'rendaTotal' => ['nullable', 'numeric'],
            'rendaPerCapita' => ['nullable', 'numeric'],
            'beneficio' => ['nullable', 'string'],
            'nomeBeneficio' => ['nullable', 'string', 'max:100'],
            'valorBeneficio' => ['nullable', 'numeric'],

            // Ficha de Saúde (Etapa 6)
            'problemaSaude' => ['nullable', 'string'],
            'problemaSaudeQual' => ['nullable', 'string'],
            'tratamento' => ['nullable', 'string'],
            'tratamentoQual' => ['nullable', 'string'],
            'alergia' => ['nullable', 'string'],
            'alergiaQual' => ['nullable', 'string'],
            'doencasAnteriores' => ['nullable', 'string'],
        ], [
            'nome.required' => 'O nome da criança é obrigatório.',
            'cpf.unique' => 'Este CPF já está cadastrado no sistema.',
            'periodo.in' => 'O período escolar deve ser manha, tarde ou noite.',
            'cep.required' => 'O CEP é obrigatório.',
            'rua.required' => 'A rua é obrigatória.',
            'bairro.required' => 'O bairro é obrigatório.',
            'numero.required' => 'O número é obrigatório.',
            'cidade.required' => 'A cidade é obrigatória.',
            'estado.required' => 'O estado é obrigatório.',
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
            // 1. Normalizar moradia
            $moradia = match (mb_strtolower($dadosValidados['tipoMoradia'] ?? 'propria')) {
                'cedida' => 'cedida',
                'alugada' => 'alugada',
                default => 'propria',
            };

            // 2. Criar o Domicílio
            $domicilio = Domicilio::create([
                'endereco_residencial' => $dadosValidados['rua'],
                'bairro' => $dadosValidados['bairro'],
                'numero' => (int) $dadosValidados['numero'],
                'ponto_referencia' => $dadosValidados['referencia'] ?? null,
                'moradia' => $moradia,
                'despesa_agua' => $dadosValidados['agua'] ?? 0.00,
                'despesa_luz' => $dadosValidados['luz'] ?? 0.00,
                'despesa_alimentacao' => $dadosValidados['alimentacao'] ?? 0.00,
                'despesa_gas' => $dadosValidados['gas'] ?? 0.00,
                'renda_total' => $dadosValidados['rendaTotal'] ?? 0.00,
                'renda_percapta' => $dadosValidados['rendaPerCapita'] ?? 0.00,
            ]);

            // 3. Criar o registro do Aluno vinculado ao Domicílio
            $aluno = User::create([
                'fk_domicilio_id' => $domicilio->id_domicilio,
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

            // 4. Criar os Relatos (se fornecidos)
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

            $possuiBeneficio = ($dadosValidados['beneficio'] ?? 'Não') === 'Sim';
            $valorBeneficio = $possuiBeneficio ? ($dadosValidados['valorBeneficio'] ?? 0.00) : 0.00;

            // 5. Criar e associar a Mãe (se informada)
            if (!empty($dadosValidados['nomeMae'])) {
                $mae = Responsavel::create([
                    'fk_domicilio_id' => $domicilio->id_domicilio,
                    'nome' => $dadosValidados['nomeMae'],
                    'nis' => $dadosValidados['nisMae'] ?? null,
                    'data_nascimento' => $dadosValidados['nascimentoMae'] ?? null,
                    'cpf' => $dadosValidados['cpfMae'] ?? null,
                    'escolaridade' => $dadosValidados['escolaridadeMae'] ?? null,
                    'rg' => $dadosValidados['rgMae'] ?? null,
                    'telefone' => $dadosValidados['telefoneMae'] ?? null,
                    'profissao' => $dadosValidados['profissaoMae'] ?? null,
                    'salario' => $dadosValidados['salarioMae'] ?? 0.00,
                    'beneficio_governo' => $possuiBeneficio,
                    'valor_beneficio' => $valorBeneficio,
                    'endereco_comercial' => $dadosValidados['enderecoComercialMae'] ?? null,
                ]);

                $aluno->responsaveis()->attach($mae->id_responsavel, [
                    'parentesco' => 'Mãe',
                    'e_responsavel_legal' => true,
                    'autorizado_retirar' => true,
                ]);
            }

            // 6. Criar e associar o Pai (se informado)
            if (!empty($dadosValidados['nomePai'])) {
                $pai = Responsavel::create([
                    'fk_domicilio_id' => $domicilio->id_domicilio,
                    'nome' => $dadosValidados['nomePai'],
                    'nis' => $dadosValidados['nisPai'] ?? null,
                    'data_nascimento' => $dadosValidados['nascimentoPai'] ?? null,
                    'cpf' => $dadosValidados['cpfPai'] ?? null,
                    'escolaridade' => $dadosValidados['escolaridadePai'] ?? null,
                    'rg' => $dadosValidados['rgPai'] ?? null,
                    'telefone' => $dadosValidados['telefonePai'] ?? null,
                    'profissao' => $dadosValidados['profissaoPai'] ?? null,
                    'salario' => $dadosValidados['salarioPai'] ?? 0.00,
                    'beneficio_governo' => empty($dadosValidados['nomeMae']) ? $possuiBeneficio : false,
                    'valor_beneficio' => empty($dadosValidados['nomeMae']) ? $valorBeneficio : 0.00,
                    'endereco_comercial' => $dadosValidados['enderecoComercialPai'] ?? null,
                ]);

                $aluno->responsaveis()->attach($pai->id_responsavel, [
                    'parentesco' => 'Pai',
                    'e_responsavel_legal' => empty($dadosValidados['nomeMae']),
                    'autorizado_retirar' => true,
                ]);
            }

            // 7. Criar a Ficha de Saúde (Etapa 6)
            $possuiAlergia = ($dadosValidados['alergia'] ?? 'Não') === 'Sim';
            $emTratamento = ($dadosValidados['tratamento'] ?? 'Não') === 'Sim';
            $possuiProblemaSaude = ($dadosValidados['problemaSaude'] ?? 'Não') === 'Sim';

            $detalhesObservacoes = array_filter([
                !empty($dadosValidados['doencasAnteriores']) ? 'Doenças anteriores: ' . $dadosValidados['doencasAnteriores'] : null,
                ($possuiProblemaSaude && !empty($dadosValidados['problemaSaudeQual'])) ? 'Problema de saúde: ' . $dadosValidados['problemaSaudeQual'] : null,
                ($emTratamento && !empty($dadosValidados['tratamentoQual'])) ? 'Tratamento: ' . $dadosValidados['tratamentoQual'] : null,
            ]);

            SaudeAluno::create([
                'fk_aluno_id' => $aluno->id,
                'possui_alergia' => $possuiAlergia,
                'descricao_alergia' => $possuiAlergia ? ($dadosValidados['alergiaQual'] ?? null) : null,
                'em_tratamento_medico' => $emTratamento,
                'observacoes_saude' => !empty($detalhesObservacoes) ? implode(" | ", $detalhesObservacoes) : null,
            ]);

            return response()->json([
                'message' => 'Aluno cadastrado com sucesso!',
                'aluno' => $aluno->load(['relatos', 'responsaveis', 'domicilio', 'saude']),
            ], 201);
        });
    }
}
