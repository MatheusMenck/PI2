<?php

namespace App\Http\Controllers;

use App\Mail\AtivacaoFuncionarioMail;
use App\Models\Funcionario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpFoundation\Response;

class FuncionarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $funcionarios = Funcionario::orderBy('id_usuario', 'desc')->get();
        return response()->json($funcionarios, Response::HTTP_OK);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nome' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:funcionarios,email',
            'cargo' => 'nullable|in:admin,funcionario',
            'admissao' => 'required|string|max:50',
            'telefone' => 'nullable|string|max:50',
            'ativo' => 'nullable|boolean',
        ]);

        $token = (string) random_int(1000, 9999);

        $funcionario = Funcionario::create([
            'nome' => $validated['nome'],
            'email' => $validated['email'],
            'cargo' => $validated['cargo'] ?? 'funcionario',
            'admissao' => $validated['admissao'],
            'telefone' => $validated['telefone'] ?? null,
            'ativo' => false,
            'token_acesso' => $token,
        ]);

        try {
            Mail::to($funcionario->email)->send(new AtivacaoFuncionarioMail($funcionario, $token));
        } catch (\Throwable $e) {
            \Log::error('Erro ao enviar e-mail de ativação: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Funcionário adicionado com sucesso. E-mail com token de ativação enviado!',
            'funcionario' => $funcionario,
        ], Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $funcionario = Funcionario::findOrFail($id);
        return response()->json($funcionario, Response::HTTP_OK);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $funcionario = Funcionario::findOrFail($id);

        $validated = $request->validate([
            'nome' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:funcionarios,email,' . $funcionario->getKey() . ',id_usuario',
            'cargo' => 'sometimes|required|in:admin,funcionario',
            'admissao' => 'sometimes|required|string|max:50',
            'telefone' => 'nullable|string|max:50',
            'ativo' => 'nullable|boolean',
        ]);

        $funcionario->update($validated);

        return response()->json([
            'message' => 'Funcionário atualizado com sucesso',
            'funcionario' => $funcionario,
        ], Response::HTTP_OK);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $funcionario = Funcionario::findOrFail($id);
        $funcionario->delete();

        return response()->json([
            'message' => 'Funcionário removido com sucesso',
        ], Response::HTTP_OK);
    }

    public function ativar(Request $request)
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        $funcionario = Funcionario::where('token_acesso', $validated['token'])->first();

        if (!$funcionario) {
            return response()->json([
                'message' => 'Token inválido ou expirado.',
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $funcionario->update([
            'ativo' => true,
            'token_acesso' => null,
        ]);

        return response()->json([
            'message' => 'Conta ativada com sucesso!',
            'funcionario' => $funcionario,
        ], Response::HTTP_OK);
    }

    public function definirSenha(Request $request)
    {
        $validated = $request->validate([
            'funcionario_id' => 'required|exists:funcionarios,id_usuario',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $funcionario = Funcionario::findOrFail($validated['funcionario_id']);

        $funcionario->update([
            'password' => Hash::make($validated['password']),
            'ativo' => true,
        ]);

        $token = $funcionario->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Senha cadastrada com sucesso!',
            'token' => $token,
            'funcionario' => $funcionario,
        ], Response::HTTP_OK);
    }
}
