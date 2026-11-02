<?php

namespace App\Http\Controllers;

use App\Mail\MensagemContatoMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContatoController extends Controller
{
    public function enviar(Request $request)
    {
        $dadosValidados = $request->validate([
            'nome' => 'required|string',
            'email' => 'required|email',
            'mensagem' => 'required|string',
        ]);

        Mail::to('teste@projeto.local')->send(new MensagemContatoMail($dadosValidados));

        return response()->json(['message' => 'E-mail enviado com sucesso!'], 200);
    }
}