<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\FuncionarioController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::apiResource('funcionarios', FuncionarioController::class);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);
    Route::get('/user', function (\Illuminate\Http\Request $request) {
        return $request->user();
    });
});
