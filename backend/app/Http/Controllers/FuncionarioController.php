<?php

namespace App\Http\Controllers;

use App\Models\Funcionario;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FuncionarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $funcionarios = Funcionario::orderBy('id', 'desc')->get();
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
            'cargo' => 'nullable|string|max:255',
            'admissao' => 'required|string|max:50',
            'telefone' => 'nullable|string|max:50',
            'ativo' => 'nullable|boolean',
        ]);

        $funcionario = Funcionario::create([
            'nome' => $validated['nome'],
            'email' => $validated['email'],
            'cargo' => $validated['cargo'] ?? 'Funcionario',
            'admissao' => $validated['admissao'],
            'telefone' => $validated['telefone'] ?? null,
            'ativo' => array_key_exists('ativo', $validated) ? (bool)$validated['ativo'] : true,
        ]);

        return response()->json([
            'message' => 'Funcionário adicionado com sucesso',
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
            'email' => 'sometimes|required|string|email|max:255|unique:funcionarios,email,' . $funcionario->id,
            'cargo' => 'nullable|string|max:255',
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
}
