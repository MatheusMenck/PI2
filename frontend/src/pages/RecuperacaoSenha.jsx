import { useState } from 'react'
import './RecuperacaoSenha.css'

function RecuperacaoSenha({ onNavigate }) {
  const [etapa, setEtapa] = useState(1) // 1: Solicitar código, 2: Digitar código e nova senha, 3: Sucesso
  const [email, setEmail] = useState('')
  const [codigo, setCodigo] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [infoMsg, setInfoMsg] = useState('')

  function handleVoltarLogin() {
    if (onNavigate) {
      onNavigate('login')
    } else {
      window.location.pathname = '/login'
    }
  }

  async function handleSolicitarCodigo(evento) {
    evento.preventDefault()
    setError('')
    setInfoMsg('')

    if (!email.trim()) {
      setError('Por favor, informe seu e-mail ou nome de usuário.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/password/forgot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg =
          data.message ||
          (data.errors && Object.values(data.errors)[0]?.[0]) ||
          'Não foi possível solicitar a recuperação de senha.'
        throw new Error(errorMsg)
      }

      if (data.email) {
        setEmail(data.email)
      }

      setInfoMsg(data.message || 'Código de verificação enviado para o seu e-mail!')
      setEtapa(2)
    } catch (err) {
      setError(err.message || 'Erro ao conectar ao servidor. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReenviarCodigo() {
    setError('')
    setInfoMsg('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/password/forgot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg =
          data.message ||
          (data.errors && Object.values(data.errors)[0]?.[0]) ||
          'Erro ao reenviar código.'
        throw new Error(errorMsg)
      }

      setInfoMsg('Novo código enviado com sucesso!')
    } catch (err) {
      setError(err.message || 'Erro ao reenviar o código.')
    } finally {
      setLoading(false)
    }
  }

  async function handleRedefinirSenha(evento) {
    evento.preventDefault()
    setError('')
    setInfoMsg('')

    const codigoLimpo = codigo.trim()
    if (!codigoLimpo) {
      setError('Por favor, digite o código de verificação recebido.')
      return
    }

    if (!novaSenha) {
      setError('Por favor, digite a nova senha.')
      return
    }

    if (novaSenha.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.')
      return
    }

    if (novaSenha !== confirmarSenha) {
      setError('As senhas não coincidem. Digite a mesma senha nos dois campos.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          token: codigoLimpo,
          password: novaSenha,
          password_confirmation: confirmarSenha,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg =
          data.message ||
          (data.errors && Object.values(data.errors)[0]?.[0]) ||
          'Erro ao redefinir a senha.'
        throw new Error(errorMsg)
      }

      setEtapa(3)
    } catch (err) {
      setError(err.message || 'Erro ao alterar a senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="recuperacao-pagina">
      <button
        type="button"
        className="voltar-login"
        onClick={handleVoltarLogin}
        aria-label="Voltar para o login"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="25" height="25">
          <path d="M19 12H5m6-6-6 6 6 6" />
        </svg>
      </button>

      <section className="recuperacao-card" aria-labelledby="recuperacao-titulo">
        {/* Etapa 1: Solicitar código pelo e-mail */}
        {etapa === 1 && (
          <>
            <h1 id="recuperacao-titulo">Recuperação de Senha</h1>
            <p>Informe seu e-mail cadastrado para receber o código de recuperação.</p>

            {error && <div className="recuperacao-error" role="alert">{error}</div>}

            <form onSubmit={handleSolicitarCodigo}>
              <label htmlFor="recuperacao-email">E-mail ou Usuário</label>
              <input
                id="recuperacao-email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                autoComplete="email"
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? 'Enviando código...' : 'Enviar Código'}
              </button>

              <button
                type="button"
                className="recuperacao-link-btn"
                onClick={handleVoltarLogin}
              >
                Voltar para o Login
              </button>
            </form>
          </>
        )}

        {/* Etapa 2: Digitar código e cadastrar nova senha */}
        {etapa === 2 && (
          <>
            <h1 id="recuperacao-titulo">Redefinir Senha</h1>
            <p>
              Enviamos um código para <strong>{email}</strong>. Digite-o abaixo e crie sua nova senha.
            </p>

            {infoMsg && <div className="recuperacao-info" role="status">{infoMsg}</div>}
            {error && <div className="recuperacao-error" role="alert">{error}</div>}

            <form onSubmit={handleRedefinirSenha}>
              <label htmlFor="recuperacao-codigo">Código de Verificação (6 dígitos)</label>
              <input
                id="recuperacao-codigo"
                type="text"
                maxLength="6"
                placeholder="000000"
                className="recuperacao-input-codigo"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                required
              />

              <label htmlFor="recuperacao-nova-senha">Nova Senha (mínimo 6 caracteres)</label>
              <input
                id="recuperacao-nova-senha"
                type="password"
                minLength={6}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                autoComplete="new-password"
                placeholder="******"
                required
              />

              <label htmlFor="recuperacao-confirmar-senha">Confirmar Nova Senha</label>
              <input
                id="recuperacao-confirmar-senha"
                type="password"
                minLength={6}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                autoComplete="new-password"
                placeholder="******"
                required
              />

              <button type="submit" disabled={loading}>
                {loading ? 'Alterando senha...' : 'Salvar Nova Senha'}
              </button>

              <div className="recuperacao-acoes-auxiliares">
                <button
                  type="button"
                  className="recuperacao-link-btn"
                  onClick={handleReenviarCodigo}
                  disabled={loading}
                >
                  Reenviar código
                </button>
                <button
                  type="button"
                  className="recuperacao-link-btn"
                  onClick={() => {
                    setError('')
                    setInfoMsg('')
                    setEtapa(1)
                  }}
                >
                  Trocar e-mail
                </button>
              </div>
            </form>
          </>
        )}

        {/* Etapa 3: Sucesso */}
        {etapa === 3 && (
          <div className="recuperacao-sucesso-container">
            <div className="recuperacao-sucesso-icone" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
              </svg>
            </div>
            <h1 id="recuperacao-titulo">Senha Alterada!</h1>
            <p>Sua senha foi redefinida com sucesso. Agora você já pode entrar na sua conta com a nova senha cadastrada.</p>

            <button
              type="button"
              className="recuperacao-btn-entrar"
              onClick={handleVoltarLogin}
            >
              Ir para o Login
            </button>
          </div>
        )}
      </section>
    </main>
  )
}

export default RecuperacaoSenha
