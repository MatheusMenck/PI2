<?php

namespace Tests\Feature;

use App\Http\Controllers\FuncionarioController;
use App\Models\Funcionario;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FuncionarioAccessTest extends TestCase
{
    public function test_public_registration_is_unavailable(): void
    {
        $this->postJson('/api/register', [])->assertNotFound();
    }

    public function test_guests_cannot_register_students_or_manage_employees(): void
    {
        $this->postJson('/api/alunos', [])->assertUnauthorized();
        $this->getJson('/api/funcionarios')->assertUnauthorized();
        $this->getJson('/api/alunos')->assertUnauthorized();
        $this->getJson('/api/alunos/1')->assertUnauthorized();
        $this->getJson('/api/responsaveis/por-cpf?cpf=52998224725')->assertUnauthorized();
    }

    public function test_student_tokens_cannot_register_students_or_manage_employees(): void
    {
        Sanctum::actingAs(new User(['name' => 'Aluno']));

        $this->postJson('/api/alunos', [])->assertForbidden();
        $this->getJson('/api/alunos')->assertForbidden();
        $this->getJson('/api/alunos/1')->assertForbidden();
        $this->getJson('/api/funcionarios')->assertForbidden();
        $this->getJson('/api/responsaveis/por-cpf?cpf=52998224725')->assertForbidden();
    }

    public function test_both_employee_roles_can_reach_student_validation(): void
    {
        foreach (['funcionario', 'admin'] as $cargo) {
            Sanctum::actingAs(new Funcionario(['ativo' => true, 'cargo' => $cargo]));

            $this->postJson('/api/alunos', [])->assertUnprocessable()->assertJsonValidationErrors('nome');
        }
    }

    public function test_regular_employees_cannot_manage_employees(): void
    {
        Sanctum::actingAs(new Funcionario(['ativo' => true, 'cargo' => 'funcionario']));

        $this->getJson('/api/funcionarios')->assertForbidden();
        $this->postJson('/api/funcionarios', [])->assertForbidden();
        $this->getJson('/api/funcionarios/1')->assertForbidden();
        $this->putJson('/api/funcionarios/1', [])->assertForbidden();
        $this->deleteJson('/api/funcionarios/1')->assertForbidden();
    }

    public function test_admin_can_access_employee_management(): void
    {
        Sanctum::actingAs(new Funcionario(['ativo' => true, 'cargo' => 'admin']));
        $this->mock(FuncionarioController::class, function ($mock) {
            $mock->shouldReceive('index')->once()->andReturn(response()->json([]));
        });

        $this->getJson('/api/funcionarios')->assertOk();
    }

    public function test_inactive_employees_cannot_use_existing_tokens(): void
    {
        Sanctum::actingAs(new Funcionario(['ativo' => false, 'cargo' => 'admin']));

        $this->postJson('/api/alunos', [])->assertForbidden();
        $this->getJson('/api/alunos')->assertForbidden();
        $this->getJson('/api/alunos/1')->assertForbidden();
        $this->getJson('/api/funcionarios')->assertForbidden();
    }
}
