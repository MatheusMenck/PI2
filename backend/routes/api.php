<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FuncionarioController;
use App\Http\Controllers\AlunoController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
Route::post('/password/verify-code', [AuthController::class, 'verifyResetCode']);
Route::post('/password/reset', [AuthController::class, 'resetPassword']);

Route::post('/funcionarios/ativar', [FuncionarioController::class, 'ativar']);
Route::post('/funcionarios/definir-senha', [FuncionarioController::class, 'definirSenha']);
Route::apiResource('funcionarios', FuncionarioController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    Route::get('/user', function (\Illuminate\Http\Request $request) {
        return $request->user();
    });
    Route::post('/alunos', [AlunoController::class, 'store']);
});
