<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Token de Ativação de Conta</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f5f7;
            color: #333333;
            margin: 0;
            padding: 24px;
        }
        .container {
            max-width: 560px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            border: 1px solid #e5e7eb;
        }
        .header {
            background-color: #1e293b;
            color: #ffffff;
            padding: 24px 32px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
        .content {
            padding: 32px;
            line-height: 1.6;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #111827;
        }
        .token-box {
            margin: 28px 0;
            padding: 20px;
            background-color: #f0fdf4;
            border: 2px dashed #059669;
            border-radius: 8px;
            text-align: center;
        }
        .token-label {
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #047857;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .token-value {
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #065f46;
            font-family: 'Courier New', Courier, monospace;
        }
        .info-card {
            background-color: #f8fafc;
            border-left: 4px solid #60aaff;
            padding: 12px 16px;
            margin: 20px 0;
            font-size: 14px;
            color: #475569;
        }
        .btn-ativar {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 24px;
            font-size: 15px;
            font-weight: 600;
            border-radius: 6px;
            margin: 16px 0;
            text-align: center;
        }
        .btn-ativar:hover {
            background-color: #1d4ed8;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px 32px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #f3f4f6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Recanto Betel</h1>
        </div>
        <div class="content">
            <p class="greeting">Olá, {{ $funcionario->nome }}!</p>
            <p>Seu cadastro como funcionário foi realizado no sistema <strong>Recanto Betel</strong>.</p>
            <p>Para ativar sua conta e concluir seu primeiro acesso, utilize o token de verificação abaixo:</p>
            
            <div class="token-box">
                <div class="token-label">Seu Código de Ativação</div>
                <div class="token-value">{{ $token }}</div>
            </div>

            <div style="text-align: center; margin: 24px 0;">
                <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/primeiroacessotoken?origem=email" class="btn-ativar" target="_blank">
                    Ativar Minha Conta
                </a>
            </div>

            <p style="font-size: 13px; color: #64748b; text-align: center;">
                Ou se preferir, acesse diretamente o link: <br>
                <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/primeiroacessotoken?origem=email" style="color: #2563eb; word-break: break-all;">
                    {{ env('FRONTEND_URL', 'http://localhost:5173') }}/primeiroacessotoken?origem=email
                </a>
            </p>

            <div class="info-card">
                <strong>Importante:</strong> Sua conta permanecerá inativa até que você insira este código na tela de Primeiro Acesso.
            </div>

            <p>Se você não solicitou este cadastro ou tiver dúvidas, entre em contato com a administração do Recanto Betel.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Recanto Betel. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
