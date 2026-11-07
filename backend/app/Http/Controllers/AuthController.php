<?php

namespace App\Http\Controllers;

use App\Mail\RecuperacaoSenhaMail;
use App\Models\Funcionario;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    /**
     * Register a new user and issue a Sanctum token.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken($request->input('device_name', 'default'))->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'token' => $token,
            'user' => $user,
        ], Response::HTTP_CREATED);
    }

    /**
     * Login an existing user or employee and issue a Sanctum token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $identifier = $request->input('email') ?? $request->input('username');
        if (! $identifier) {
            throw ValidationException::withMessages([
                'email' => ['O campo e-mail ou usuário é obrigatório.'],
            ]);
        }

        // Support login by email or name/username in users table
        $user = User::where('email', $identifier)
            ->orWhere('name', $identifier)
            ->first();

        // If not found in users, check funcionarios table
        if (! $user) {
            $user = Funcionario::where('email', $identifier)
                ->orWhere('nome', $identifier)
                ->first();
        }

        if (! $user || ! $user->password || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciais fornecidas são inválidas.'],
            ]);
        }

        // If employee, check if active
        if (isset($user->ativo) && ! $user->ativo) {
            throw ValidationException::withMessages([
                'email' => ['Esta conta ainda não foi ativada. Use o código recebido por e-mail para seu primeiro acesso.'],
            ]);
        }

        // Ensure user object has name property for frontend consistency
        if (! isset($user->name) && isset($user->nome)) {
            $user->name = $user->nome;
        }

        $token = $user->createToken($request->input('device_name', 'default'))->plainTextToken;

        return response()->json([
            'message' => 'Login realizado com sucesso',
            'token' => $token,
            'user' => $user,
        ], Response::HTTP_OK);
    }

    /**
     * Request password reset code.
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|string',
        ]);

        $identifier = $request->input('email');

        // Check if user exists in users or funcionarios
        $user = User::where('email', $identifier)
            ->orWhere('name', $identifier)
            ->first();

        if (! $user) {
            $user = Funcionario::where('email', $identifier)
                ->orWhere('nome', $identifier)
                ->first();
        }

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['Nenhuma conta cadastrada com este e-mail ou usuário.'],
            ]);
        }

        $token = (string) random_int(100000, 999999);
        $userEmail = $user->email;

        // Upsert into password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $userEmail],
            [
                'token' => $token,
                'created_at' => Carbon::now(),
            ]
        );

        // Send recovery email
        try {
            Mail::to($userEmail)->send(new RecuperacaoSenhaMail($user, $token));
        } catch (\Throwable $e) {
            Log::error('Erro ao enviar e-mail de recuperação: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Código de verificação enviado para seu e-mail.',
            'email' => $userEmail,
            'code' => config('app.debug') ? $token : null,
        ], Response::HTTP_OK);
    }

    /**
     * Verify password reset code.
     */
    public function verifyResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (! $record) {
            throw ValidationException::withMessages([
                'token' => ['Código de verificação inválido ou incorreto.'],
            ]);
        }

        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            throw ValidationException::withMessages([
                'token' => ['O código expirou. Solicite um novo código de recuperação.'],
            ]);
        }

        return response()->json([
            'message' => 'Código verificado com sucesso.',
        ], Response::HTTP_OK);
    }

    /**
     * Reset password with verification code.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->token)
            ->first();

        if (! $record) {
            throw ValidationException::withMessages([
                'token' => ['Código de verificação inválido ou expirado.'],
            ]);
        }

        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            throw ValidationException::withMessages([
                'token' => ['O código expirou. Solicite um novo código de recuperação.'],
            ]);
        }

        // Locate user in users or funcionarios
        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->password = $request->password;
            $user->save();
        } else {
            $funcionario = Funcionario::where('email', $request->email)->first();
            if ($funcionario) {
                $funcionario->password = Hash::make($request->password);
                $funcionario->ativo = true;
                $funcionario->save();
            } else {
                throw ValidationException::withMessages([
                    'email' => ['Conta não encontrada para o e-mail informado.'],
                ]);
            }
        }

        // Delete used token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Senha alterada com sucesso! Você já pode entrar com sua nova senha.',
        ], Response::HTTP_OK);
    }

    /**
     * Logout (revoke) the current user's token.
     */
    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out'], Response::HTTP_OK);
    }

    /**
     * Update the authenticated user's password.
     */
    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['A senha atual está incorreta.'],
            ]);
        }

        $user->password = Hash::make($validated['new_password']);
        $user->save();

        return response()->json(['message' => 'Senha atualizada com sucesso.'], Response::HTTP_OK);
    }
}
