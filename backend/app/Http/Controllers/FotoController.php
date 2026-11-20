<?php

namespace App\Http\Controllers;

use App\Models\Responsavel;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class FotoController extends Controller
{
    public function show(string $tipo, string $id): BinaryFileResponse
    {
        $pessoa = match ($tipo) {
            'alunos' => User::findOrFail($id),
            'responsaveis' => Responsavel::findOrFail($id),
        };

        abort_unless($pessoa->foto, 404);

        $caminho = Storage::disk('public')->path($pessoa->foto);
        abort_unless(is_file($caminho) && is_readable($caminho), 404);

        $tipoImagem = mime_content_type($caminho);
        abort_unless(in_array($tipoImagem, ['image/jpeg', 'image/png', 'image/webp'], true), 404);

        return response()->file($caminho, [
            'Content-Type' => $tipoImagem,
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ])->setPrivate();
    }
}
