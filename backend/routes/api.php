<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FuncionarioController;
use App\Http\Controllers\AlunoController;
use App\Http\Controllers\ResponsavelController;
use App\Http\Middleware\EnsureFuncionario;

Route::post('/login', [AuthController::class, 'login']);

Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
Route::post('/password/verify-code', [AuthController::class, 'verifyResetCode']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

Route::post('/funcionarios/ativar', [FuncionarioController::class, 'ativar']);
Route::post('/funcionarios/definir-senha', [FuncionarioController::class, 'definirSenha']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    Route::get('/user', function (\Illuminate\Http\Request $request) {
        return $request->user();
    });
    Route::get('/alunos', [AlunoController::class, 'index'])->middleware(EnsureFuncionario::class);
    Route::get('/alunos/{id}', [AlunoController::class, 'show'])->whereNumber('id')->middleware(EnsureFuncionario::class);
    Route::post('/alunos', [AlunoController::class, 'store'])->middleware(EnsureFuncionario::class);
    Route::post('/responsaveis', [ResponsavelController::class, 'store'])->middleware(EnsureFuncionario::class);
    Route::get('/responsaveis', [ResponsavelController::class, 'index'])->middleware(EnsureFuncionario::class);
    Route::get('/responsaveis/{id}', [ResponsavelController::class, 'show'])->whereNumber('id')->middleware(EnsureFuncionario::class);
    Route::get('/responsaveis/por-cpf', [ResponsavelController::class, 'buscarPorCpf'])->middleware(EnsureFuncionario::class);
    Route::apiResource('funcionarios', FuncionarioController::class)
        ->middleware(EnsureFuncionario::class . ':admin');
});
