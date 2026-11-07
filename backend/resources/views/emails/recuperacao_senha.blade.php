<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperação de Senha</title>
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
            <p class="greeting">Olá, {{ $usuario->name ?? $usuario->nome ?? 'Usuário' }}!</p>
            <p>Recebemos uma solicitação para redefinir a senha de acesso à sua conta no sistema <strong>Recanto Betel</strong>.</p>
            <p>Utilize o código de verificação abaixo na tela de Recuperação de Senha:</p>
            
            <div class="token-box">
                <div class="token-label">Código de Verificação</div>
                <div class="token-value">{{ $token }}</div>
            </div>

            <div class="info-card">
                <strong>Atenção:</strong> Este código é válido por <strong>60 minutos</strong>. Se você não solicitou esta redefinição de senha, nenhuma ação é necessária e sua senha atual permanece inalterada.
            </div>

            <p>Em caso de dúvidas ou problemas no acesso, entre em contato com o suporte ou com a administração.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} Recanto Betel. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>

