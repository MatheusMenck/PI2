<?php

namespace Tests\Feature;

use App\Models\{Funcionario, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_counts_students_once_using_latest_enrollment_and_matches_student_list(): void
    {
        $this->travelTo(now()->setDate(2026, 1, 1)->startOfDay());
        Sanctum::actingAs(new Funcionario(['ativo' => true, 'cargo' => 'funcionario']));
        $this->getJson('/api/dashboard/indicadores')->assertOk()->assertExactJson(['ativos' => 0, 'pendentes' => 0, 'indeferidos' => 0]);
        $renovado = User::create(['name' => 'Renovado']);
        $renovado->matriculas()->create(['data_matricula' => '2025-01-01']);
        $renovado->matriculas()->create(['data_matricula' => '2026-01-01']);
        $renovado->matriculas()->create(['data_matricula' => '2026-01-01']);
        $pendente = User::create(['name' => 'Pendente']);
        $pendente->matriculas()->create(['data_matricula' => '2025-12-31']);
        User::create(['name' => 'Sem matrícula recente']);
        $antigo = User::create(['name' => 'Sem matrícula antiga']);
        $antigo->created_at = '2025-12-31';
        $antigo->save();
        $this->getJson('/api/dashboard/indicadores')->assertOk()->assertExactJson(['ativos' => 2, 'pendentes' => 2, 'indeferidos' => 0]);
        $lista = collect($this->getJson('/api/alunos')->assertOk()->json('alunos'));
        $this->assertSame(2, $lista->where('status', 'Ativo')->count());
        $this->assertSame(2, $lista->where('status', 'Pendente')->count());
    }

    public function test_requires_active_employee_and_allows_administrators(): void
    {
        $this->getJson('/api/dashboard/indicadores')->assertUnauthorized();
        Sanctum::actingAs(new User(['name' => 'Aluno']));
        $this->getJson('/api/dashboard/indicadores')->assertForbidden();
        Sanctum::actingAs(new Funcionario(['ativo' => false, 'cargo' => 'admin']));
        $this->getJson('/api/dashboard/indicadores')->assertForbidden();
        Sanctum::actingAs(new Funcionario(['ativo' => true, 'cargo' => 'admin']));
        $this->getJson('/api/dashboard/indicadores')->assertOk();
    }
}
