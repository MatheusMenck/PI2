<?php

namespace Tests\Feature;

use App\Models\Funcionario;
use App\Models\Matricula;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AlunoMatriculaTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        Sanctum::actingAs(new Funcionario(['ativo' => true, 'cargo' => 'funcionario']));
        $this->travelTo(now()->setDate(2026, 11, 13)->startOfDay());
    }

    private function imagem(string $nome = 'assinatura.png'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($nome, base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5n8AAAAASUVORK5CYII='));
    }

    private function dados(array $alteracoes = []): array
    {
        return array_replace([
            'assinatura' => $this->imagem(),
            'nome' => 'Criança', 'nomeMae' => 'Maria', 'nomePai' => 'José',
            'cpfMae' => '529.982.247-25', 'cpfPai' => '111.444.777-35',
            'cep' => '12345-678', 'rua' => 'Rua A', 'numero' => 1,
            'bairro' => 'Centro', 'cidade' => 'São Paulo', 'estado' => 'SP',
            'declaracaoVeracidade' => true,
            'autorizaAtendimentoOdontologico' => 'Sim', 'autorizadoSairSozinho' => 'Não',
            'acompanhantes' => [['nome' => 'Ana', 'parentesco' => 'Tia', 'telefone' => '11999999999']],
        ], $alteracoes);
    }

    public function test_reads_saved_student_and_all_profile_sections(): void
    {
        $funcionario = Funcionario::create(['nome' => 'Equipe', 'email' => 'equipe@example.com', 'ativo' => true, 'cargo' => 'funcionario']);
        Sanctum::actingAs($funcionario);
        $this->getJson('/api/alunos')->assertOk()->assertExactJson(['alunos' => []]);
        $resposta = $this->postJson('/api/alunos', $this->dados([
            'telefone' => '11988887777', 'dataNascimento' => '2015-02-03',
            'fotoAluno' => $this->imagem('aluno.png'),
            'familia' => [['nome' => 'Ana', 'parentesco' => 'Tia', 'nascimento' => '1990-01-02']],
            'alergia' => 'Sim', 'alergiaQual' => 'Leite', 'habitos' => 'Sono regular',
            'doencasEspecificas' => ['Diabetes'],
            'relatos' => [['titulo' => 'Adaptação', 'descricao' => 'Participou das atividades', 'data_registro' => '2026-11-12']],
        ]))->assertCreated();
        $id = $resposta->json('aluno.id');
        $this->getJson('/api/alunos')->assertOk()->assertJsonCount(1, 'alunos')
            ->assertJsonPath('alunos.0.telefone', '11988887777')
            ->assertJsonPath('alunos.0.nascimento', '2015-02-03');
        $this->getJson("/api/alunos/{$id}")->assertOk()
            ->assertJsonPath('aluno.nome', 'Criança')
            ->assertJsonPath('aluno.rua', 'Rua A')
            ->assertJsonPath('aluno.cidade', 'São Paulo / SP')
            ->assertJsonPath('aluno.cadastro', '2026-11-13')
            ->assertJsonPath('aluno.status', 'Ativo')
            ->assertJsonPath('aluno.responsaveis.0.nome', 'Maria')
            ->assertJsonPath('aluno.familia.0.nome', 'Ana')
            ->assertJsonPath('aluno.autorizado_sair_sozinho', false)
            ->assertJsonPath('aluno.pessoas_autorizadas.0.nome', 'Ana')
            ->assertJsonPath('aluno.saude.descricao_alergia', 'Leite')
            ->assertJsonPath('aluno.saude.habitos', 'Sono regular')
            ->assertJsonPath('aluno.doencas.0.nome', 'Diabetes')
            ->assertJsonPath('aluno.relatos.0.titulo', 'Adaptação')
            ->assertJsonMissingPath('aluno.password');
    }

    public function test_enrollment_expires_on_january_first_and_latest_enrollment_renews_status(): void
    {
        $resposta = $this->postJson('/api/alunos', $this->dados())->assertCreated();
        $id = $resposta->json('aluno.id');
        foreach ([['2026-12-31 23:59:59', 'Ativo'], ['2027-01-01 00:00:00', 'Pendente'], ['2028-01-15 12:00:00', 'Pendente']] as [$data, $status]) {
            $this->travelTo(\Illuminate\Support\Carbon::parse($data));
            $this->getJson('/api/alunos')->assertOk()->assertJsonPath('alunos.0.status', $status);
            $this->getJson("/api/alunos/{$id}")->assertOk()->assertJsonPath('aluno.status', $status);
        }
        Matricula::create(['fk_aluno_id' => $id, 'data_matricula' => '2028-01-15']);
        $this->getJson('/api/alunos')->assertOk()->assertJsonPath('alunos.0.status', 'Ativo');
        $this->getJson("/api/alunos/{$id}")->assertOk()->assertJsonPath('aluno.status', 'Ativo');
        $this->travelTo(\Illuminate\Support\Carbon::parse('2029-01-01'));
        $this->getJson("/api/alunos/{$id}")->assertOk()->assertJsonPath('aluno.status', 'Pendente');
    }

    public function test_missing_student_is_404_and_optional_relations_are_empty(): void
    {
        $this->getJson('/api/alunos/999999')->assertNotFound();
        $aluno = \App\Models\User::create(['name' => 'Sem cadastro completo']);
        $this->getJson("/api/alunos/{$aluno->id}")->assertOk()
            ->assertJsonPath('aluno.saude', null)
            ->assertJsonPath('aluno.familia', [])
            ->assertJsonPath('aluno.relatos', [])
            ->assertJsonPath('aluno.autorizado_sair_sozinho', null);
    }

    public function test_saves_authorizations_and_prioritizes_mother(): void
    {
        $this->postJson('/api/alunos', $this->dados())->assertCreated()
            ->assertJsonPath('aluno.matriculas.0.pessoas_autorizadas.0.nome', 'Ana');
        $this->assertDatabaseHas('matriculas', [
            'responsavel_que_aprovou' => 'Maria',
            'autorizado_sair_sozinho' => false,
        ]);
        $this->assertDatabaseHas('saude_alunos', [
            'declaracao_veracidade' => true,
            'autoriza_atendimento_odontologico' => true,
        ]);
        Storage::disk('public')->assertExists(Matricula::firstOrFail()->assinatura_responsavel);
        $this->assertSame('2026-11-13', Matricula::firstOrFail()->data_matricula->toDateString());
        $saude = \App\Models\SaudeAluno::firstOrFail();
        $this->assertSame('2026-11-13', $saude->data_declaracao->toDateString());
        $this->assertSame('2026-11-13', $saude->data_autorizacao_odontologica->toDateString());
        $this->assertDatabaseHas('domicilios', ['cep' => '12345-678', 'cidade' => 'São Paulo', 'estado' => 'SP']);
    }

    public function test_allows_dental_refusal_and_uses_father_when_mother_absent(): void
    {
        $this->postJson('/api/alunos', $this->dados([
            'nomeMae' => '', 'cpfMae' => '', 'autorizaAtendimentoOdontologico' => 'Não',
            'autorizadoSairSozinho' => 'Sim', 'acompanhantes' => [],
        ]))->assertCreated();
        $this->assertDatabaseHas('matriculas', ['responsavel_que_aprovou' => 'José', 'autorizado_sair_sozinho' => true]);
        $this->assertDatabaseHas('saude_alunos', ['autoriza_atendimento_odontologico' => false, 'data_autorizacao_odontologica' => null]);
        $this->assertDatabaseCount('pessoas_autorizadas', 0);
    }

    public function test_requires_declaration_and_explicit_authorization_choices(): void
    {
        $this->postJson('/api/alunos', $this->dados([
            'declaracaoVeracidade' => false, 'autorizaAtendimentoOdontologico' => '', 'autorizadoSairSozinho' => '',
        ]))->assertUnprocessable()->assertJsonValidationErrors([
            'declaracaoVeracidade', 'autorizaAtendimentoOdontologico', 'autorizadoSairSozinho',
        ]);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_requires_at_least_one_complete_pickup_person(): void
    {
        $this->postJson('/api/alunos', $this->dados(['acompanhantes' => []]))
            ->assertUnprocessable()->assertJsonValidationErrors('acompanhantes');
        $this->postJson('/api/alunos', $this->dados(['acompanhantes' => [['nome' => 'Ana']]]))
            ->assertUnprocessable()->assertJsonValidationErrors(['acompanhantes.0.parentesco', 'acompanhantes.0.telefone']);
        $this->assertDatabaseCount('users', 0);
    }

    public function test_ignores_pickup_people_when_child_may_leave_alone(): void
    {
        $this->postJson('/api/alunos', $this->dados(['autorizadoSairSozinho' => 'Sim']))->assertCreated();
        $this->assertDatabaseCount('pessoas_autorizadas', 0);
    }

    public function test_signature_is_required_and_rejects_invalid_or_oversized_files(): void
    {
        foreach ([null, UploadedFile::fake()->create('documento.pdf', 10, 'application/pdf'), $this->imagem()->size(5121)] as $arquivo) {
            $this->postJson('/api/alunos', $this->dados(['assinatura' => $arquivo]))
                ->assertUnprocessable()->assertJsonValidationErrors('assinatura');
        }
        $this->assertDatabaseCount('users', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_optional_photos_are_saved_for_student_and_each_parent(): void
    {
        $this->postJson('/api/alunos', $this->dados([
            'fotoAluno' => $this->imagem('aluno.png'),
            'fotoMae' => $this->imagem('mae.png'),
            'fotoPai' => $this->imagem('pai.png'),
        ]))->assertCreated();
        Storage::disk('public')->assertExists(\App\Models\User::firstOrFail()->foto);
        foreach (\App\Models\Responsavel::all() as $responsavel) {
            Storage::disk('public')->assertExists($responsavel->foto);
        }
        $this->assertCount(4, Storage::disk('public')->allFiles());
    }

    public function test_multipart_request_preserves_nested_fields_and_uploads(): void
    {
        $this->post('/api/alunos', $this->dados([
            'declaracaoVeracidade' => '1',
            'relatos' => [],
            'doencasEspecificas' => ['Diabetes'],
        ]), ['Accept' => 'application/json'])->assertCreated();
        $this->assertDatabaseHas('pessoas_autorizadas', ['nome' => 'Ana']);
        $this->assertDatabaseHas('doencas', ['nome' => 'Diabetes']);
        Storage::disk('public')->assertExists(Matricula::firstOrFail()->assinatura_responsavel);
    }

    public function test_invalid_optional_photo_is_rejected(): void
    {
        $this->postJson('/api/alunos', $this->dados([
            'fotoAluno' => UploadedFile::fake()->create('foto.gif', 10, 'image/gif'),
        ]))->assertUnprocessable()->assertJsonValidationErrors('fotoAluno');
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_family_members_are_optional(): void
    {
        $this->postJson('/api/alunos', $this->dados(['familia' => []]))->assertCreated();
        $this->assertDatabaseCount('membros_familia', 0);
    }

    public function test_multipart_family_members_belong_to_household_and_keep_manual_income(): void
    {
        $this->post('/api/alunos', $this->dados([
            'familia' => [
                ['nome' => 'Ana', 'parentesco' => 'Avó', 'nascimento' => '1960-05-20', 'renda' => '1500.50'],
                ['nome' => 'Pedro', 'parentesco' => 'Irmão', 'nascimento' => '', 'renda' => ''],
            ],
            'rendaTotal' => '2000', 'rendaPerCapita' => '400',
        ]), ['Accept' => 'application/json'])->assertCreated()
            ->assertJsonPath('aluno.domicilio.membros_familia.0.nome', 'Ana');
        $domicilio = \App\Models\Domicilio::firstOrFail();
        $this->assertDatabaseHas('membros_familia', [
            'fk_domicilio_id' => $domicilio->id_domicilio, 'nome' => 'Ana', 'parentesco' => 'Avó', 'renda' => 1500.50,
        ]);
        $this->assertDatabaseHas('membros_familia', ['nome' => 'Pedro', 'data_nascimento' => null, 'renda' => 0]);
        $this->assertCount(2, $domicilio->membrosFamilia);
        $this->assertSame('1960-05-20', $domicilio->membrosFamilia->first()->data_nascimento->toDateString());
        $this->assertSame('2000.00', $domicilio->renda_total);
        $this->assertSame('400.00', $domicilio->renda_percapta);
    }

    public function test_family_rows_require_name_and_relationship_and_validate_optional_fields(): void
    {
        $this->postJson('/api/alunos', $this->dados(['familia' => [
            ['nome' => '', 'parentesco' => '', 'nascimento' => 'invalida', 'renda' => '-1'],
        ]]))->assertUnprocessable()->assertJsonValidationErrors([
            'familia.0.nome', 'familia.0.parentesco', 'familia.0.nascimento', 'familia.0.renda',
        ]);
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('membros_familia', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_parent_cpf_is_required_valid_and_different_for_each_parent(): void
    {
        foreach (['', '111.111.111-11', '52998224724', 'abc52998224725'] as $cpf) {
            $this->postJson('/api/alunos', $this->dados(['cpfMae' => $cpf]))
                ->assertUnprocessable()->assertJsonValidationErrors('cpfMae');
        }
        $this->postJson('/api/alunos', $this->dados(['cpfPai' => '52998224725']))
            ->assertUnprocessable()->assertJsonValidationErrors('cpfPai');
        $this->assertDatabaseCount('responsaveis', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_siblings_reuse_parents_without_overwriting_saved_details_or_photos(): void
    {
        $this->postJson('/api/alunos', $this->dados(['fotoMae' => $this->imagem('mae.png')]))->assertCreated();
        $mae = \App\Models\Responsavel::where('cpf', '52998224725')->firstOrFail();
        $domicilioOriginal = $mae->fk_domicilio_id;
        $fotoOriginal = $mae->foto;
        $this->postJson('/api/alunos', $this->dados([
            'nome' => 'Irmã', 'nomeMae' => 'Nome diferente', 'cpfMae' => '52998224725',
            'cpfPai' => '11144477735', 'fotoMae' => $this->imagem('outra.png'),
        ]))->assertCreated()->assertJsonPath('aluno.matriculas.0.responsavel_que_aprovou', 'Maria');
        $this->assertDatabaseCount('responsaveis', 2);
        $this->assertDatabaseCount('aluno_responsavel', 4);
        $this->assertSame('Maria', $mae->fresh()->nome);
        $this->assertSame($domicilioOriginal, $mae->fresh()->fk_domicilio_id);
        $this->assertSame($fotoOriginal, $mae->fresh()->foto);
        Storage::disk('public')->assertExists($fotoOriginal);
        $this->assertCount(3, Storage::disk('public')->allFiles());
    }

    public function test_employee_can_lookup_saved_parent_by_formatted_cpf(): void
    {
        $this->postJson('/api/alunos', $this->dados())->assertCreated();
        $this->getJson('/api/responsaveis/por-cpf?cpf=529.982.247-25')->assertOk()
            ->assertJsonPath('responsavel.nome', 'Maria')->assertJsonPath('responsavel.cpf', '52998224725');
        $this->getJson('/api/responsaveis/por-cpf?cpf=123')->assertUnprocessable()->assertJsonValidationErrors('cpf');
        $this->getJson('/api/responsaveis/por-cpf?cpf=12345678909')->assertOk()->assertJsonPath('responsavel', null);
    }

    public function test_benefit_requires_name_and_value_when_yes_and_is_saved_on_household(): void
    {
        $this->postJson('/api/alunos', $this->dados(['beneficio' => 'Sim']))
            ->assertUnprocessable()->assertJsonValidationErrors(['nomeBeneficio', 'valorBeneficio']);
        $this->postJson('/api/alunos', $this->dados(['beneficio' => 'Sim', 'nomeBeneficio' => 'Bolsa Família', 'valorBeneficio' => -1]))
            ->assertUnprocessable()->assertJsonValidationErrors('valorBeneficio');
        $this->postJson('/api/alunos', $this->dados(['beneficio' => 'Sim', 'nomeBeneficio' => 'Bolsa Família', 'valorBeneficio' => '600.00']))
            ->assertCreated();
        $this->assertDatabaseHas('domicilios', ['beneficio_governo' => true, 'nome_beneficio' => 'Bolsa Família', 'valor_beneficio' => 600]);
        $this->assertArrayNotHasKey('beneficio_governo', \App\Models\Responsavel::firstOrFail()->getAttributes());
        $this->assertArrayNotHasKey('valor_beneficio', \App\Models\Responsavel::firstOrFail()->getAttributes());
    }

    public function test_benefit_no_ignores_stale_details_and_stores_zero(): void
    {
        $this->postJson('/api/alunos', $this->dados([
            'beneficio' => 'Não', 'nomeBeneficio' => 'Valor antigo', 'valorBeneficio' => 'inválido',
        ]))->assertCreated();
        $this->assertDatabaseHas('domicilios', ['beneficio_governo' => false, 'nome_beneficio' => null, 'valor_beneficio' => 0]);
    }

    public function test_failure_saving_enrollment_rolls_back_entire_registration(): void
    {
        Matricula::creating(function () {
            throw new \RuntimeException('Falha simulada na matrícula');
        });
        $this->withoutExceptionHandling();
        try {
            $this->postJson('/api/alunos', $this->dados([
                'fotoAluno' => $this->imagem('aluno.png'),
                'familia' => [['nome' => 'Ana', 'parentesco' => 'Tia']],
            ]));
            $this->fail('Era esperada uma falha na matrícula.');
        } catch (\RuntimeException $exception) {
            $this->assertSame('Falha simulada na matrícula', $exception->getMessage());
        } finally {
            Matricula::flushEventListeners();
        }
        $this->assertSame([], Storage::disk('public')->allFiles());
        foreach (['users', 'domicilios', 'responsaveis', 'saude_alunos', 'matriculas', 'pessoas_autorizadas', 'aluno_responsavel', 'membros_familia'] as $tabela) {
            $this->assertDatabaseCount($tabela, 0);
        }
    }
}
