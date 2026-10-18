import { useState } from 'react'
import './Login.css'

function Login({ onNavigate }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMsg =
          data.message ||
          (data.errors && Object.values(data.errors)[0]?.[0]) ||
          'Credenciais inválidas.'
        throw new Error(errorMsg)
      }

      localStorage.setItem('auth_token', data.token)
      if (data.user) {
        localStorage.setItem('auth_user', JSON.stringify(data.user))
      }

      if (onNavigate) {
        onNavigate('alunos')
      } else {
        window.location.href = '/alunos'
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleGoToCodeValidation() {
    if (onNavigate) {
      onNavigate('primeiroacessotoken')
    } else {
      window.location.hash = 'primeiroacessotoken'
    }
  }

  function handleGoToPasswordRecovery() {
    if (onNavigate) {
      onNavigate('recuperacaosenha')
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <div className="user-icon" aria-hidden="true">
          <span className="user-icon__head" />
          <span className="user-icon__body" />
        </div>
        <h1 id="login-title">LOGIN</h1>
        <p className="login-subtitle">Acesse sua conta para continuar</p>

        {error && (
          <div className="login-error-message" role="alert">
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Usuário ou E-mail</label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <button
          type="button"
          className="btn-password-recovery"
          onClick={handleGoToPasswordRecovery}
        >
          Esqueci minha senha
        </button>
        <button
          type="button"
          className="btn-code-validation"
          onClick={handleGoToCodeValidation}
        >
          Primeiro acesso
        </button>
      </section>
    </main>
  )
}

export default Login
