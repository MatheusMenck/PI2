import { useState } from 'react'
import './Login.css'

function Login({ onNavigate, aoNavegar }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const navegar = onNavigate || aoNavegar

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

      if (navegar) {
        navegar('inicio')
      } else {
        window.location.href = '/inicio'
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleGoToPasswordRecovery(e) {
    if (e) e.preventDefault()
    if (navegar) {
      navegar('recuperacaosenha')
    } else {
      window.location.pathname = '/recuperacaosenha'
    }
  }

  function handleGoToStudents() {
    if (navegar) {
      navegar('alunos')
    } else {
      window.location.href = '/alunos'
    }
  }

  function handleGoToEmployees() {
    if (navegar) {
      navegar('funcionarios')
    } else {
      window.location.href = '/funcionarios'
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

          <button
            type="button"
            className="login-forgot-btn"
            onClick={handleGoToPasswordRecovery}
          >
            Esqueci minha senha
          </button>
        </form>

        <nav className="login-shortcuts" aria-label="Outras telas">
          <button type="button" onClick={handleGoToStudents}>Alunos</button>
          <button type="button" onClick={handleGoToEmployees}>Funcionários</button>
          <button type="button" onClick={handleGoToPasswordRecovery}>
            Esqueci minha senha
          </button>
        </nav>
      </section>
    </main>
  )
}

export default Login
