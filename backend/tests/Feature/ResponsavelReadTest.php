<?php

namespace Tests\Feature;

use App\Models\{Domicilio, Funcionario, Responsavel, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ResponsavelReadTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_reads_real_household_and_dependents(): void
    {
        Sanctum::actingAs(new Funcionario(['ativo' => true, 'cargo' => 'funcionario']));
        $this->getJson('/api/responsaveis')->assertOk()->assertExactJson(['responsaveis' => []]);
        $domicilio = Domicilio::create(['endereco_residencial' => 'Rua A', 'bairro' => 'Centro', 'cidade' => 'Tatuí', 'estado' => 'SP', 'beneficio_governo' => true, 'nome_beneficio' => 'Bolsa Família', 'valor_beneficio' => 600]);
        $responsavel = Responsavel::create(['fk_domicilio_id' => $domicilio->id_domicilio, 'nome' => 'Maria', 'cpf' => '52998224725', 'foto' => 'alunos/mae.png', 'salario' => 1000]);
        $aluno = User::create(['name' => 'Criança', 'foto' => 'alunos/crianca.png']);
        $responsavel->alunos()->attach($aluno->id, ['parentesco' => 'Mãe']);
        $this->getJson('/api/responsaveis')->assertOk()->assertJsonCount(1, 'responsaveis')->assertJsonPath('responsaveis.0.id', $responsavel->id_responsavel);
        $this->getJson('/api/responsaveis/'.$responsavel->id_responsavel)->assertOk()
            ->assertJsonPath('responsavel.nome', 'Maria')
            ->assertJsonPath('responsavel.endereco.cidade', 'Tatuí, SP')
            ->assertJsonPath('responsavel.renda.valor_beneficio', '600.00')
            ->assertJsonPath('responsavel.alunos.0.parentesco', 'Filho(a)')
            ->assertJsonPath('responsavel.alunos.0.foto', '/storage/alunos/crianca.png');
        $this->getJson('/api/responsaveis/999999')->assertNotFound();
        $this->getJson('/api/responsaveis/por-cpf?cpf=52998224725')->assertOk()->assertJsonPath('responsavel.nome', 'Maria');
    }

    public function test_access_requires_employee_and_admin_is_allowed(): void
    {
        foreach (['/api/responsaveis', '/api/responsaveis/1'] as $url) {
            $this->getJson($url)->assertUnauthorized();
        }
        Sanctum::actingAs(new User(['name' => 'Aluno']));
        $this->getJson('/api/responsaveis')->assertForbidden();
        $this->getJson('/api/responsaveis/1')->assertForbidden();
        Sanctum::actingAs(new Funcionario(['ativo' => false, 'cargo' => 'admin']));
        $this->getJson('/api/responsaveis')->assertForbidden();
        Sanctum::actingAs(new Funcionario(['ativo' => true, 'cargo' => 'admin']));
        $this->getJson('/api/responsaveis')->assertOk();
    }
}
