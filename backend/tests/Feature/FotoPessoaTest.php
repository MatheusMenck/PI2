<?php

namespace Tests\Feature;

use App\Models\Domicilio;
use App\Models\Funcionario;
use App\Models\Responsavel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FotoPessoaTest extends TestCase
{
    use RefreshDatabase;

    public function test_funcionario_pode_abrir_fotos_ja_salvas_no_disco_sem_link_publico(): void
    {
        $disco = Storage::fake('public');
        $png = base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5n8AAAAASUVORK5CYII=');
        $disco->put('alunos/aluno.png', $png);
        $disco->put('alunos/responsavel.png', $png);

        $aluno = User::factory()->create(['foto' => 'alunos/aluno.png']);
        $domicilio = Domicilio::create(['endereco_residencial' => 'Rua A', 'bairro' => 'Centro', 'cidade' => 'Tatuí', 'estado' => 'SP']);
        $responsavel = Responsavel::create([
            'fk_domicilio_id' => $domicilio->getKey(),
            'nome' => 'Pessoa responsável',
            'cpf' => '52998224725',
            'foto' => 'alunos/responsavel.png',
        ]);
        Sanctum::actingAs(new Funcionario(['ativo' => true]));

        foreach ([
            "/api/fotos/alunos/{$aluno->getKey()}" => 'alunos/aluno.png',
            "/api/fotos/responsaveis/{$responsavel->getKey()}" => 'alunos/responsavel.png',
        ] as $url => $arquivo) {
            $resposta = $this->getJson($url)->assertOk()->assertHeader('Content-Type', 'image/png');
            $this->assertSame($disco->path($arquivo), $resposta->baseResponse->getFile()->getPathname());
            $this->assertStringContainsString('no-store', $resposta->headers->get('Cache-Control'));
        }
    }

    public function test_rota_exige_funcionario_ativo_e_nao_aceita_caminhos_de_arquivos(): void
    {
        $aluno = User::factory()->create(['foto' => 'alunos/ausente.png']);
        $url = "/api/fotos/alunos/{$aluno->getKey()}";

        $this->getJson($url)->assertUnauthorized();
        Sanctum::actingAs($aluno);
        $this->getJson($url)->assertForbidden();
        Sanctum::actingAs(new Funcionario(['ativo' => false]));
        $this->getJson($url)->assertForbidden();
        Sanctum::actingAs(new Funcionario(['ativo' => true]));
        $this->getJson($url)->assertNotFound();
        $this->getJson('/api/fotos/alunos/assinatura.png')->assertNotFound();
    }
}
