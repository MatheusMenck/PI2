<?php

namespace App\Http\Controllers;

use App\Models\Doenca;
use App\Models\Domicilio;
use App\Models\Relato;
use App\Models\Responsavel;
use App\Models\SaudeAluno;
use App\Models\User;
use App\Rules\CpfValido;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AlunoController extends Controller
{
    public function index()
    {
        return response()->json(['alunos' => User::with('matriculaAtual')->orderBy('name')->get([
            'id', 'name', 'data_nascimento', 'cpf', 'telefone', 'foto', 'created_at',
        ])->map(fn ($aluno) => [
            'id' => $aluno->id,
            'nome' => $aluno->name,
            'cadastro' => $aluno->created_at?->format('Y-m-d'),
            'nascimento' => $aluno->data_nascimento?->format('Y-m-d'),
            'cpf' => $aluno->cpf,
            'telefone' => $aluno->telefone,
            'foto' => $aluno->foto ? '/storage/' . ltrim($aluno->foto, '/') : null,
            'status' => $aluno->statusMatricula(),
        ])]);
    }

    public function storeRelato(Request $request, string $id)
    {
        $aluno = User::findOrFail($id);
        $dados = $request->validate([
            'titulo' => 'required|string|max:150',
            'descricao' => 'required|string',
        ]);

        $relato = $aluno->relatos()->create([
            ...$dados,
            'fk_usuario_id' => $request->user()->getKey(),
            'data_registro' => now(),
        ]);

        return response()->json(['relato' => $relato], 201);
    }

    public function show(string $id)
    {
        $aluno = User::with([
            'domicilio.membrosFamilia', 'responsaveis', 'saude', 'doencas', 'matriculaAtual',
            'matriculas' => fn ($query) => $query->orderByDesc('data_matricula')->orderByDesc('id_matricula'),
            'matriculas.pessoasAutorizadas',
            'relatos' => fn ($query) => $query->orderByDesc('data_registro')->orderByDesc('id_relato'),
        ])->findOrFail($id);

        return response()->json(['aluno' => [
            'id' => $aluno->id,
            'nome' => $aluno->name,
            'foto' => $aluno->foto ? '/storage/' . ltrim($aluno->foto, '/') : null,
            'status' => $aluno->statusMatricula(),
            'cadastro' => $aluno->created_at?->format('Y-m-d'),
            'cpf' => $aluno->cpf, 'rg' => $aluno->rg,
            'telefone' => $aluno->telefone,
            'nascimento' => $aluno->data_nascimento?->format('Y-m-d'),
            'religiao' => $aluno->religiao,
            'rua' => $aluno->domicilio?->endereco_residencial,
            'numero' => $aluno->domicilio?->numero,
            'bairro' => $aluno->domicilio?->bairro,
            'referencia' => $aluno->domicilio?->ponto_referencia,
            'cidade' => $aluno->domicilio ? implode(' / ', array_filter([$aluno->domicilio->cidade, $aluno->domicilio->estado])) : null,
            'escola' => $aluno->escola, 'serie' => $aluno->escola_ano, 'periodo' => $aluno->escola_periodo,
            'responsaveis' => $aluno->responsaveis->map(fn ($pessoa) => [
                'id' => $pessoa->id_responsavel, 'nome' => $pessoa->nome,
                'telefone' => $pessoa->telefone, 'parentesco' => $pessoa->pivot->parentesco,
            ]),
            'familia' => $aluno->domicilio?->membrosFamilia ?? [],
            'autorizado_sair_sozinho' => $aluno->matriculas->first()?->autorizado_sair_sozinho,
            'pessoas_autorizadas' => $aluno->matriculas->first()?->pessoasAutorizadas ?? [],
            'saude' => $aluno->saude,
            'doencas' => $aluno->doencas,
            'relatos' => $aluno->relatos,
        ]]);
    }

    public function store(Request $request)
    {
        foreach (['cpfMae', 'cpfPai'] as $campo) {
            if (is_string($request->input($campo))) {
                $request->merge([$campo => CpfValido::normalizar($request->input($campo)) ?: null]);
            }
        }

        $dadosValidados = $request->validate([
            'fotoAluno' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'fotoMae' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'fotoPai' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'assinatura' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            // Etapa 1
            'nome' => ['required', 'string', 'max:255'],
            'religiao' => ['nullable', 'string', 'max:50'],
            'dataNascimento' => ['nullable', 'date'],
            'cpf' => ['nullable', 'string', 'max:14', 'unique:users,cpf'],
            'rg' => ['nullable', 'string', 'max:20'],
            'telefone' => ['nullable', 'string', 'max:20'],
            'escola' => ['nullable', 'string', 'max:150'],
            'serie' => ['nullable', 'string', 'max:50'],
            'periodo' => ['nullable', 'string', Rule::in(['manha', 'tarde', 'noite'])],

            // Etapa 2
            'relatos' => ['nullable', 'array'],
            'relatos.*.titulo' => ['nullable', 'string', 'max:150'],
            'relatos.*.relato' => ['nullable', 'string'],
            'relatos.*.descricao' => ['nullable', 'string'],
            'relatos.*.data' => ['nullable', 'date'],
            'relatos.*.data_registro' => ['nullable', 'date'],

            // Etapa 3
            'nomeMae' => ['required_with:cpfMae', 'nullable', 'string', 'max:255'],
            'nisMae' => ['nullable', 'string', 'max:20'],
            'nascimentoMae' => ['nullable', 'date'],
            'cpfMae' => ['required_with:nomeMae', 'nullable', 'string', new CpfValido],
            'escolaridadeMae' => ['nullable', 'string', 'max:100'],
            'rgMae' => ['nullable', 'string', 'max:20'],
            'telefoneMae' => ['nullable', 'string', 'max:20'],
            'profissaoMae' => ['nullable', 'string', 'max:100'],
            'salarioMae' => ['nullable', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],
            'enderecoComercialMae' => ['nullable', 'string', 'max:255'],

            // Etapa 4
            'nomePai' => ['required_with:cpfPai', 'nullable', 'string', 'max:255'],
            'nisPai' => ['nullable', 'string', 'max:20'],
            'nascimentoPai' => ['nullable', 'date'],
            'cpfPai' => ['required_with:nomePai', 'nullable', 'string', new CpfValido, 'different:cpfMae'],
            'escolaridadePai' => ['nullable', 'string', 'max:100'],
            'rgPai' => ['nullable', 'string', 'max:20'],
            'telefonePai' => ['nullable', 'string', 'max:20'],
            'profissaoPai' => ['nullable', 'string', 'max:100'],
            'salarioPai' => ['nullable', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],
            'enderecoComercialPai' => ['nullable', 'string', 'max:255'],

            // Etapa 5
            'familia' => ['nullable', 'array'],
            'familia.*' => ['array:nome,nascimento,parentesco,renda'],
            'familia.*.nome' => ['required', 'string', 'max:255'],
            'familia.*.parentesco' => ['required', 'string', 'max:50'],
            'familia.*.nascimento' => ['nullable', 'date'],
            'familia.*.renda' => ['nullable', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],
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
            'beneficio' => ['nullable', Rule::in(['Sim', 'Não'])],
            'nomeBeneficio' => ['exclude_unless:beneficio,Sim', 'required', 'string', 'max:100'],
            'valorBeneficio' => ['exclude_unless:beneficio,Sim', 'required', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],

            // Etapa 6
            'problemaSaude' => ['nullable', 'string'],
            'problemaSaudeQual' => ['nullable', 'string'],
            'tratamento' => ['nullable', 'string'],
            'tratamentoQual' => ['nullable', 'string'],
            'alergia' => ['nullable', 'string'],
            'alergiaQual' => ['nullable', 'string'],
            'doencasAnteriores' => ['nullable', 'string'],

            // Etapa 9
            'declaracaoVeracidade' => ['required', 'accepted'],
            'autorizaAtendimentoOdontologico' => ['required', Rule::in(['Sim', 'Não'])],
            'autorizadoSairSozinho' => ['required', Rule::in(['Sim', 'Não'])],
            'acompanhantes' => ['exclude_unless:autorizadoSairSozinho,Não', 'required', 'array', 'min:1'],
            'acompanhantes.*' => ['array:nome,parentesco,telefone'],
            'acompanhantes.*.nome' => ['required', 'string', 'max:255'],
            'acompanhantes.*.parentesco' => ['required', 'string', 'max:50'],
            'acompanhantes.*.telefone' => ['required', 'string', 'max:20'],

            // Etapas 7 e 8
            'queixaPrincipal' => ['nullable', 'string'],
            'medico' => ['nullable', 'string', 'max:255'],
            'telefoneMedico' => ['nullable', 'string', 'max:20'],
            'doenca' => ['nullable', 'string'],
            'doencaQual' => ['nullable', 'string'],
            'operado' => ['nullable', 'string'],
            'operadoQual' => ['nullable', 'string'],
            'anestesia' => ['nullable', 'string'],
            'cicatrizacao' => ['nullable', 'string'],
            'hemorragia' => ['nullable', 'string'],
            'doencasEspecificas' => ['nullable', 'array'],
            'doencasEspecificas.*' => ['nullable', 'string'],
            'habitos' => ['nullable', 'string'],
            'antecedentes' => ['nullable', 'string'],
            'outrosProblemas' => ['nullable', 'string'],
        ], [
            'declaracaoVeracidade.accepted' => 'Confirme a declaração de veracidade para concluir a matrícula.',
            'declaracaoVeracidade.required' => 'Confirme a declaração de veracidade para concluir a matrícula.',
            'autorizaAtendimentoOdontologico.required' => 'Informe se autoriza o atendimento odontológico.',
            'autorizadoSairSozinho.required' => 'Informe se a criança pode sair sozinha.',
            'acompanhantes.required' => 'Informe ao menos uma pessoa autorizada a buscar a criança.',
            'acompanhantes.*.nome.required' => 'Informe o nome da pessoa autorizada.',
            'acompanhantes.*.parentesco.required' => 'Informe o parentesco da pessoa autorizada.',
            'acompanhantes.*.telefone.required' => 'Informe o telefone da pessoa autorizada.',
            'assinatura.required' => 'Envie a imagem da assinatura do responsável para concluir a matrícula.',
            '*.image' => 'O arquivo deve ser uma imagem.',
            '*.mimes' => 'Envie uma imagem JPEG, PNG ou WebP.',
            'fotoAluno.max' => 'A foto do aluno deve ter no máximo 5 MB.',
            'fotoMae.max' => 'A foto da mãe deve ter no máximo 5 MB.',
            'fotoPai.max' => 'A foto do pai deve ter no máximo 5 MB.',
            'assinatura.max' => 'A assinatura deve ter no máximo 5 MB.',
            'familia.*.nome.required' => 'Informe o nome de cada familiar preenchido.',
            'familia.*.parentesco.required' => 'Informe o parentesco de cada familiar preenchido.',
            'familia.*.nascimento.date' => 'Informe uma data de nascimento válida para o familiar.',
            'familia.*.renda.numeric' => 'A renda do familiar deve ser um número.',
            'familia.*.renda.min' => 'A renda do familiar não pode ser negativa.',
            'familia.*.renda.max' => 'A renda do familiar deve ser de até 99.999.999,99.',
            'familia.*.renda.decimal' => 'A renda do familiar deve ter no máximo duas casas decimais.',
            'nome.required' => 'O nome da criança é obrigatório.',
            'cpfMae.required_with' => 'O CPF da mãe é obrigatório quando seus dados são informados.',
            'cpfPai.required_with' => 'O CPF do pai é obrigatório quando seus dados são informados.',
            'nomeMae.required_with' => 'Informe o nome da mãe.',
            'nomePai.required_with' => 'Informe o nome do pai.',
            'cpfPai.different' => 'Mãe e pai não podem ter o mesmo CPF.',
            'salarioMae.min' => 'O salário da mãe não pode ser negativo.',
            'salarioPai.min' => 'O salário do pai não pode ser negativo.',
            'salarioMae.decimal' => 'O salário da mãe deve ter no máximo duas casas decimais.',
            'salarioPai.decimal' => 'O salário do pai deve ter no máximo duas casas decimais.',
            'nomeBeneficio.required' => 'Informe o nome do benefício.',
            'valorBeneficio.required' => 'Informe o valor do benefício.',
            'valorBeneficio.numeric' => 'O valor do benefício deve ser um número.',
            'valorBeneficio.min' => 'O valor do benefício não pode ser negativo.',
            'valorBeneficio.max' => 'O valor do benefício deve ser de até 99.999.999,99.',
            'valorBeneficio.decimal' => 'O valor do benefício deve ter no máximo duas casas decimais.',
            'cpf.unique' => 'Este CPF já está cadastrado no sistema.',
            'periodo.in' => 'O período escolar deve ser manha, tarde ou noite.',
            'cep.required' => 'O CEP é obrigatório.',
            'rua.required' => 'A rua é obrigatória.',
            'bairro.required' => 'O bairro é obrigatório.',
            'numero.required' => 'O número é obrigatório.',
            'cidade.required' => 'A cidade é obrigatória.',
            'estado.required' => 'O estado é obrigatório.',
        ]);
        if (empty($dadosValidados['nomeMae']) && empty($dadosValidados['nomePai'])) {
            return response()->json([
                'message' => 'Pelo menos um dos responsáveis (Mãe ou Pai) deve ter o nome informado.',
                'errors' => [
                    'responsavel' => ['Informe os dados da Mãe ou do Pai para concluir a matrícula.']
                ]
            ], 422);
        }

        $arquivosSalvos = [];

        try {
            $caminhos = [];
            foreach (['fotoAluno', 'fotoMae', 'fotoPai', 'assinatura'] as $campo) {
                if ($request->hasFile($campo)) {
                    $caminho = $request->file($campo)->store('alunos', 'public');
                    if ($caminho === false) {
                        throw new \RuntimeException('Não foi possível salvar o arquivo enviado.');
                    }
                    $arquivosSalvos[] = $caminho;
                    $caminhos[$campo] = $caminho;
                }
            }

            foreach (['fotoMae' => 'nomeMae', 'fotoPai' => 'nomePai'] as $foto => $nome) {
                if (empty($dadosValidados[$nome]) && isset($caminhos[$foto])) {
                    Storage::disk('public')->delete($caminhos[$foto]);
                }
            }

            return DB::transaction(function () use ($dadosValidados, $request, $caminhos) {
                $dataCadastro = now()->toDateString();
                $autorizaOdontologia = $dadosValidados['autorizaAtendimentoOdontologico'] === 'Sim';

                $moradia = match (mb_strtolower($dadosValidados['tipoMoradia'] ?? 'propria')) {
                    'cedida' => 'cedida',
                    'alugada' => 'alugada',
                    default => 'propria',
                };


                $possuiBeneficio = ($dadosValidados['beneficio'] ?? 'Não') === 'Sim';
                $centavos = static function ($valor): int {
                    [$inteiro, $decimal] = array_pad(explode('.', (string) ($valor ?? 0), 2), 2, '');
                    return (int) $inteiro * 100 + (int) str_pad($decimal, 2, '0');
                };
                $pessoas = 1 + count($dadosValidados['familia'] ?? []);
                $totalCentavos = 0;
                foreach ($dadosValidados['familia'] ?? [] as $pessoa) {
                    $totalCentavos += $centavos($pessoa['renda'] ?? 0);
                }
                foreach (['Mae', 'Pai'] as $parentesco) {
                    if (!empty($dadosValidados['nome' . $parentesco])) {
                        $pessoas++;
                        $existente = Responsavel::where('cpf', $dadosValidados['cpf' . $parentesco])->first();
                        $totalCentavos += $centavos($existente ? $existente->salario : ($dadosValidados['salario' . $parentesco] ?? 0));
                    }
                }
                if ($possuiBeneficio) $totalCentavos += $centavos($dadosValidados['valorBeneficio']);
                if ($totalCentavos > 9999999999) {
                    throw ValidationException::withMessages(['rendaTotal' => 'A renda familiar total deve ser de até 99.999.999,99.']);
                }
                $rendaTotal = number_format($totalCentavos / 100, 2, '.', '');
                $rendaPerCapita = number_format(round($totalCentavos / $pessoas) / 100, 2, '.', '');

                $mae = null;
                $pai = null;

                // Etapa 2 do formulario de aluno
                $domicilio = Domicilio::create([
                    'cep' => $dadosValidados['cep'],
                    'cidade' => $dadosValidados['cidade'],
                    'estado' => $dadosValidados['estado'],
                    'beneficio_governo' => $possuiBeneficio,
                    'nome_beneficio' => $possuiBeneficio ? $dadosValidados['nomeBeneficio'] : null,
                    'valor_beneficio' => $possuiBeneficio ? $dadosValidados['valorBeneficio'] : 0,
                    'endereco_residencial' => $dadosValidados['rua'],
                    'bairro' => $dadosValidados['bairro'],
                    'numero' => (int) $dadosValidados['numero'],
                    'ponto_referencia' => $dadosValidados['referencia'] ?? null,
                    'moradia' => $moradia,
                    'despesa_agua' => $dadosValidados['agua'] ?? 0.00,
                    'despesa_luz' => $dadosValidados['luz'] ?? 0.00,
                    'despesa_alimentacao' => $dadosValidados['alimentacao'] ?? 0.00,
                    'despesa_gas' => $dadosValidados['gas'] ?? 0.00,
                    'renda_total' => $rendaTotal,
                    'renda_percapta' => $rendaPerCapita,
                ]);

                foreach ($dadosValidados['familia'] ?? [] as $pessoa) {
                    $domicilio->membrosFamilia()->create([
                        'nome' => $pessoa['nome'],
                        'parentesco' => $pessoa['parentesco'],
                        'data_nascimento' => $pessoa['nascimento'] ?? null,
                        'renda' => $pessoa['renda'] ?? 0,
                    ]);
                }

                // Etapa 3 do formulario de aluno
                $aluno = User::create([
                    'foto' => $caminhos['fotoAluno'] ?? null,
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

                // Etapa 4 do formulario de aluno
                if (!empty($dadosValidados['relatos'])) {
                    $idFuncionario = $request->user()->id_usuario;

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

                // Etapa 5 do formulario de aluno
                if (!empty($dadosValidados['nomeMae'])) {
                    $mae = Responsavel::firstOrCreate(['cpf' => $dadosValidados['cpfMae']], [
                        'foto' => $caminhos['fotoMae'] ?? null,
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
                        'endereco_comercial' => $dadosValidados['enderecoComercialMae'] ?? null,
                    ]);

                    if (!$mae->wasRecentlyCreated && isset($caminhos['fotoMae'])) {
                        Storage::disk('public')->delete($caminhos['fotoMae']);
                    }

                    $aluno->responsaveis()->attach($mae->id_responsavel, [
                        'parentesco' => 'Mãe',
                        'e_responsavel_legal' => true,
                        'autorizado_retirar' => true,
                    ]);
                }

                // Etapa 6 do formulario de aluno
                if (!empty($dadosValidados['nomePai'])) {
                    $pai = Responsavel::firstOrCreate(['cpf' => $dadosValidados['cpfPai']], [
                        'foto' => $caminhos['fotoPai'] ?? null,
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
                        'endereco_comercial' => $dadosValidados['enderecoComercialPai'] ?? null,
                    ]);

                    if (!$pai->wasRecentlyCreated && isset($caminhos['fotoPai'])) {
                        Storage::disk('public')->delete($caminhos['fotoPai']);
                    }

                    $aluno->responsaveis()->attach($pai->id_responsavel, [
                        'parentesco' => 'Pai',
                        'e_responsavel_legal' => empty($dadosValidados['nomeMae']),
                        'autorizado_retirar' => true,
                    ]);
                }

                // Etapa 7 do formulario de aluno
                $possuiAlergia = ($dadosValidados['alergia'] ?? 'Não') === 'Sim';
                $emTratamento = ($dadosValidados['tratamento'] ?? 'Não') === 'Sim';
                $possuiProblemaSaude = ($dadosValidados['problemaSaude'] ?? 'Não') === 'Sim';
                $foiOperado = ($dadosValidados['operado'] ?? 'Não') === 'Sim';
                $problemaAnestesia = ($dadosValidados['anestesia'] ?? 'Não') === 'Sim';
                $problemaCicatrizacao = ($dadosValidados['cicatrizacao'] ?? 'Não') === 'Sim';
                $problemaHemorragia = ($dadosValidados['hemorragia'] ?? 'Não') === 'Sim';

                $detalhesObservacoes = array_filter([
                    !empty($dadosValidados['doencasAnteriores']) ? 'Doenças anteriores: ' . $dadosValidados['doencasAnteriores'] : null,
                    ($possuiProblemaSaude && !empty($dadosValidados['problemaSaudeQual'])) ? 'Problema de saúde: ' . $dadosValidados['problemaSaudeQual'] : null,
                    ($emTratamento && !empty($dadosValidados['tratamentoQual'])) ? 'Tratamento: ' . $dadosValidados['tratamentoQual'] : null,
                    !empty($dadosValidados['outrosProblemas']) ? 'Outros problemas: ' . $dadosValidados['outrosProblemas'] : null,
                ]);

                SaudeAluno::create([
                    'declaracao_veracidade' => true,
                    'data_declaracao' => $dataCadastro,
                    'autoriza_atendimento_odontologico' => $autorizaOdontologia,
                    'data_autorizacao_odontologica' => $autorizaOdontologia ? $dataCadastro : null,
                    'fk_aluno_id' => $aluno->id,
                    // Etapa 6 do formulario
                    'possui_alergia' => $possuiAlergia,
                    'descricao_alergia' => $possuiAlergia ? ($dadosValidados['alergiaQual'] ?? null) : null,
                    'em_tratamento_medico' => $emTratamento,
                    'observacoes_saude' => !empty($detalhesObservacoes) ? implode(' | ', $detalhesObservacoes) : null,
                    // Etapa 7 do formulario
                    'queixa_principal' => $dadosValidados['queixaPrincipal'] ?? null,
                    'medico_responsavel_nome' => $dadosValidados['medico'] ?? null,
                    'medico_responsavel_telefone' => $dadosValidados['telefoneMedico'] ?? null,
                    'ja_foi_operado' => $foiOperado,
                    'descricao_cirurgias' => $foiOperado ? ($dadosValidados['operadoQual'] ?? null) : null,
                    'problema_anestesia' => $problemaAnestesia,
                    'problema_cicatrizacao' => $problemaCicatrizacao,
                    'problema_hemorragia' => $problemaHemorragia,
                    // Etapa 8 do formulario
                    'habitos' => $dadosValidados['habitos'] ?? null,
                    'antecedentes_familiares' => $dadosValidados['antecedentes'] ?? null,
                ]);

                $doencasParaVincular = [];

                if (($dadosValidados['doenca'] ?? 'Não') === 'Sim' && !empty($dadosValidados['doencaQual'])) {
                    $doencasParaVincular[] = [
                        'nome' => $dadosValidados['doencaQual'],
                        'status' => 'atual',
                    ];
                }

                if (!empty($dadosValidados['doencasEspecificas'])) {
                    foreach ($dadosValidados['doencasEspecificas'] as $nomeDoenca) {
                        if (!empty($nomeDoenca)) {
                            $doencasParaVincular[] = [
                                'nome' => $nomeDoenca,
                                'status' => 'atual',
                            ];
                        }
                    }
                }

                foreach ($doencasParaVincular as $dadosDoenca) {
                    $doenca = Doenca::firstOrCreate(
                        ['nome' => $dadosDoenca['nome']],
                        ['detalhes' => null]
                    );

                    if (!$aluno->doencas()->where('fk_doenca_id', $doenca->id_doenca)->exists()) {
                        $aluno->doencas()->attach($doenca->id_doenca, [
                            'status' => $dadosDoenca['status'],
                            'requer_cuidados_especiais' => false,
                        ]);
                    }
                }

                $matricula = $aluno->matriculas()->create([
                    'data_matricula' => $dataCadastro,
                    'responsavel_que_aprovou' => $mae?->nome ?? $pai->nome,
                    'autorizado_sair_sozinho' => $dadosValidados['autorizadoSairSozinho'] === 'Sim',
                    'assinatura_responsavel' => $caminhos['assinatura'],
                ]);

                if (!$matricula->autorizado_sair_sozinho) {
                    $matricula->pessoasAutorizadas()->createMany($dadosValidados['acompanhantes']);
                }

                return response()->json([
                    'message' => 'Aluno cadastrado com sucesso!',
                    'aluno' => $aluno->load(['relatos', 'responsaveis', 'domicilio.membrosFamilia', 'saude', 'doencas', 'matriculas.pessoasAutorizadas']),
                ], 201);
            });
        } catch (\Throwable $exception) {
            Storage::disk('public')->delete($arquivosSalvos);
            throw $exception;
        }
    }
}
