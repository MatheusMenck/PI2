import { useState, useEffect } from 'react'
import './RecuperacaoSenha.css'

function RecuperacaoSenha({ onNavigate }) {
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const funcionarioId = sessionStorage.getItem('ativacao_funcionario_id')

  useEffect(() => {
    if (!funcionarioId) {
      if (onNavigate) {
        onNavigate('login')
      } else {
        window.location.pathname = '/login'
      }
    }
  }, [funcionarioId, onNavigate])

  async function alterar(evento) {
    evento.preventDefault()
    setError('')

    if (!senha) {
      setError('Por favor, digite a nova senha.')
      return
    }

    if (senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (senha !== confirmarSenha) {
      setError('As senhas não conferem.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/funcionarios/definir-senha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          funcionario_id: funcionarioId,
          password: senha,
          password_confirmation: confirmarSenha,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg =
          data.message ||
          (data.errors && Object.values(data.errors)[0]?.[0]) ||
          'Erro ao definir senha.'
        throw new Error(errorMsg)
      }

      sessionStorage.removeItem('ativacao_funcionario_id')

      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }
      if (data.funcionario) {
        localStorage.setItem('auth_user', JSON.stringify(data.funcionario))
      }

      if (onNavigate) {
        onNavigate('inicio')
      } else {
        window.location.pathname = '/inicio'
      }
    } catch (err) {
      setError(err.message || 'Erro ao definir a senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="recuperacao-pagina">
      <button
        type="button"
        className="voltar-login"
        onClick={() => onNavigate ? onNavigate('login') : (window.location.pathname = '/login')}
        aria-label="Voltar para o login"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="25" height="25">
          <path d="M19 12H5m6-6-6 6 6 6" />
        </svg>
      </button>

      <section className="recuperacao-card" aria-labelledby="recuperacao-titulo">
        <h1 id="recuperacao-titulo">Criação de Senha</h1>
        <p>Crie sua senha de acesso</p>

        <form onSubmit={alterar}>
          <label htmlFor="senha-nova">Senha nova</label>
          <input
            id="senha-nova"
            type="password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            autoComplete="new-password"
            required
          />

          <label htmlFor="confirmar-senha">Confirmar Senha</label>
          <input
            id="confirmar-senha"
            type="password"
            value={confirmarSenha}
            onChange={(evento) => setConfirmarSenha(evento.target.value)}
            autoComplete="new-password"
            required
          />

          {error && <p className="recuperacao-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Confirmar'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default RecuperacaoSenha
