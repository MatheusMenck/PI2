<?php

namespace App\Http\Controllers;

use App\Models\Responsavel;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
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

    public function store(Request $request)
    {
        if (is_string($request->input('cpf'))) {
            $request->merge(['cpf' => CpfValido::normalizar($request->input('cpf'))]);
        }
        $dados = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'cpf' => ['required', 'string', new CpfValido],
            'nis' => ['nullable', 'string', 'max:20'],
            'data_nascimento' => ['nullable', 'date'],
            'escolaridade' => ['nullable', 'string', 'max:100'],
            'rg' => ['nullable', 'string', 'max:20'],
            'telefone' => ['nullable', 'string', 'max:20'],
            'profissao' => ['nullable', 'string', 'max:100'],
            'endereco_comercial' => ['nullable', 'string', 'max:255'],
            'salario' => ['nullable', 'numeric', 'min:0', 'max:99999999.99', 'decimal:0,2'],
            'foto' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'alunos' => ['required', 'array', 'min:1'],
            'alunos.*' => ['array:id,parentesco,e_responsavel_legal,autorizado_retirar'],
            'alunos.*.id' => ['required', 'integer', 'distinct', 'exists:users,id'],
            'alunos.*.parentesco' => ['required', 'in:Mãe,Pai'],
            'alunos.*.e_responsavel_legal' => ['required', 'boolean'],
            'alunos.*.autorizado_retirar' => ['required', 'boolean'],
        ], [
            'nome.required' => 'Informe o nome do responsável.',
            'cpf.required' => 'Informe o CPF do responsável.',
            'alunos.required' => 'Selecione ao menos um aluno.',
            'alunos.min' => 'Selecione ao menos um aluno.',
            'alunos.*.parentesco.required' => 'Selecione se o responsável é mãe ou pai de cada aluno.',
            'foto.image' => 'A foto deve ser uma imagem.',
            'foto.mimes' => 'Envie uma foto JPEG, PNG ou WebP.',
            'foto.max' => 'A foto deve ter no máximo 5 MB.',
        ]);
        $fotoSalva = null;
        try {
            return DB::transaction(function () use ($dados, $request, &$fotoSalva) {
                $responsavel = Responsavel::where('cpf', $dados['cpf'])->lockForUpdate()->first();
                if (!$responsavel) {
                    $primeiroAluno = User::findOrFail($dados['alunos'][0]['id']);
                    if (!$primeiroAluno->fk_domicilio_id) {
                        throw ValidationException::withMessages(['alunos' => 'O primeiro aluno selecionado não possui domicílio cadastrado.']);
                    }
                    $campos = collect($dados)->except(['alunos', 'foto'])->all();
                    $campos['fk_domicilio_id'] = $primeiroAluno->fk_domicilio_id;
                    $campos['salario'] = $campos['salario'] ?? 0;
                    $responsavel = Responsavel::firstOrCreate(['cpf' => $dados['cpf']], $campos);
                    if ($responsavel->wasRecentlyCreated && $request->hasFile('foto')) {
                        $fotoSalva = $request->file('foto')->store('alunos', 'public');
                        if ($fotoSalva === false) {
                            throw new \RuntimeException('Não foi possível salvar a foto.');
                        }
                        $responsavel->update(['foto' => $fotoSalva]);
                    }
                }
                foreach ($dados['alunos'] as $vinculo) {
                    if (!$responsavel->alunos()->where('users.id', $vinculo['id'])->exists()) {
                        $responsavel->alunos()->attach($vinculo['id'], collect($vinculo)->except('id')->all());
                    }
                }
                return response()->json(['responsavel' => ['id' => $responsavel->id_responsavel]], 201);
            });
        } catch (\Throwable $exception) {
            if ($fotoSalva) Storage::disk('public')->delete($fotoSalva);
            throw $exception;
        }
    }

    public function buscarPorCpf(Request $request)
    {
        $dados = $request->validate(['cpf' => ['required', 'string', new CpfValido]]);
        $responsavel = Responsavel::where('cpf', CpfValido::normalizar($dados['cpf']))->first();

        return response()->json(['responsavel' => $responsavel]);
    }
}
