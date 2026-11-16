<?php

namespace Tests\Feature;

use App\Models\{Domicilio, Funcionario, Responsavel, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ResponsavelStoreTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        Sanctum::actingAs(new Funcionario(['cargo' => 'funcionario', 'ativo' => true]));
    }

    private function dados(): array
    {
        $domicilio = Domicilio::create(['endereco_residencial' => 'Rua A', 'bairro' => 'Centro']);
        $aluno = User::create(['name' => 'Aluno', 'fk_domicilio_id' => $domicilio->id_domicilio]);
        return ['nome' => 'Maria', 'cpf' => '529.982.247-25', 'alunos' => [['id' => $aluno->id, 'parentesco' => 'Mãe', 'e_responsavel_legal' => '1', 'autorizado_retirar' => '0']]];
    }

    private function imagem(): UploadedFile
    {
        return UploadedFile::fake()->createWithContent('foto.png', base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5n8AAAAASUVORK5CYII='));
    }

    public function test_creates_parent_with_photo_and_first_students_household(): void
    {
        $dados = $this->dados();
        $dados['foto'] = $this->imagem();
        $this->post('/api/responsaveis', $dados, ['Accept' => 'application/json'])->assertCreated();
        $pessoa = Responsavel::firstOrFail();
        $this->assertSame(User::firstOrFail()->fk_domicilio_id, $pessoa->fk_domicilio_id);
        $this->assertSame('52998224725', $pessoa->cpf);
        $this->assertSame('0.00', $pessoa->salario);
        Storage::disk('public')->assertExists($pessoa->foto);
        $this->assertDatabaseHas('aluno_responsavel', ['fk_responsavel_id' => $pessoa->id_responsavel, 'parentesco' => 'Mãe', 'e_responsavel_legal' => true, 'autorizado_retirar' => false]);
    }

    public function test_reuses_existing_parent_and_preserves_existing_links(): void
    {
        $dados = $this->dados();
        $this->postJson('/api/responsaveis', $dados)->assertCreated();
        $novo = $this->dados();
        $novo['nome'] = 'Nome alterado';
        $novo['foto'] = $this->imagem();
        $novo['alunos'][] = array_merge($dados['alunos'][0], ['parentesco' => 'Pai', 'autorizado_retirar' => '1']);
        $this->postJson('/api/responsaveis', $novo)->assertCreated();
        $this->assertDatabaseCount('responsaveis', 1);
        $this->assertDatabaseCount('aluno_responsavel', 2);
        $this->assertSame('Maria', Responsavel::firstOrFail()->nome);
        $this->assertDatabaseHas('aluno_responsavel', ['fk_aluno_id' => $dados['alunos'][0]['id'], 'parentesco' => 'Mãe', 'autorizado_retirar' => false]);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }

    public function test_rejects_invalid_fields_and_duplicate_or_missing_students(): void
    {
        $dados = $this->dados();
        $this->postJson('/api/responsaveis', array_merge($dados, ['nome' => '', 'cpf' => '11111111111', 'alunos' => []]))->assertUnprocessable()->assertJsonValidationErrors(['nome', 'cpf', 'alunos']);
        $dados['alunos'][] = $dados['alunos'][0];
        $this->postJson('/api/responsaveis', $dados)->assertUnprocessable()->assertJsonValidationErrors('alunos.0.id');
        $dados['alunos'] = [['id' => 99999]];
        $this->postJson('/api/responsaveis', $dados)->assertUnprocessable()->assertJsonValidationErrors(['alunos.0.id', 'alunos.0.parentesco', 'alunos.0.e_responsavel_legal', 'alunos.0.autorizado_retirar']);
        $this->assertDatabaseCount('responsaveis', 0);
    }

    public function test_rejects_bad_photo_and_student_without_household(): void
    {
        $dados = $this->dados();
        $dados['foto'] = UploadedFile::fake()->create('foto.pdf', 10, 'application/pdf');
        $this->postJson('/api/responsaveis', $dados)->assertUnprocessable()->assertJsonValidationErrors('foto');
        unset($dados['foto']);
        User::firstOrFail()->update(['fk_domicilio_id' => null]);
        $this->postJson('/api/responsaveis', $dados)->assertUnprocessable()->assertJsonValidationErrors('alunos');
        $this->assertDatabaseCount('responsaveis', 0);
    }

    public function test_rolls_back_and_cleans_photo_when_link_creation_fails(): void
    {
        $dados = $this->dados();
        $dados['foto'] = $this->imagem();
        $this->app->make('db')->connection()->getSchemaBuilder()->drop('aluno_responsavel');
        $this->postJson('/api/responsaveis', $dados)->assertStatus(500);
        $this->assertDatabaseCount('responsaveis', 0);
        $this->assertSame([], Storage::disk('public')->allFiles());
    }
}
