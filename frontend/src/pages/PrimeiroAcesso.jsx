import { useState, useEffect } from 'react'
import { normalizeAuthUser } from '../authUser'
import './PrimeiroAcesso.css'

function PrimeiroAcesso({ onNavigate }) {
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

  async function confirmar(evento) {
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
        localStorage.setItem('auth_user', JSON.stringify(normalizeAuthUser(data.funcionario)))
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
    <main className="primeiro-acesso-pagina">
      <button
        type="button"
        className="voltar-validacao"
        onClick={() => onNavigate ? onNavigate('login') : (window.location.pathname = '/login')}
        aria-label="Voltar para o login"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="25" height="25">
          <path d="M19 12H5m6-6-6 6 6 6" />
        </svg>
      </button>

      <section className="primeiro-acesso-card" aria-labelledby="primeiro-acesso-titulo">
        <h1 id="primeiro-acesso-titulo">Primeiro Acesso</h1>
        <p>Crie a sua senha</p>

        <form onSubmit={confirmar}>
          <label htmlFor="senha">Senha</label>
          <input
            id="senha"
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

          {error && <p className="primeiro-acesso-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Confirmar'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default PrimeiroAcesso

