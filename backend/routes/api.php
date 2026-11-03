<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FuncionarioController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/funcionarios/ativar', [FuncionarioController::class, 'ativar']);
Route::post('/funcionarios/definir-senha', [FuncionarioController::class, 'definirSenha']);
Route::apiResource('funcionarios', FuncionarioController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    Route::get('/user', function (\Illuminate\Http\Request $request) {
        return $request->user();
    });
});
