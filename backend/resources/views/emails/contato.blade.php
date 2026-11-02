<!DOCTYPE html>
<html>
<head><title>Mensagem de Contato</title></head>
<body>
    <h2>Nova Mensagem de Contato</h2>
    <p><strong>Nome:</strong> {{ $dados['nome'] ?? '' }}</p>
    <p><strong>Email:</strong> {{ $dados['email'] ?? '' }}</p>
    <p><strong>Mensagem:</strong></p>
    <p>{{ $dados['mensagem'] ?? '' }}</p>
</body>
</html>
