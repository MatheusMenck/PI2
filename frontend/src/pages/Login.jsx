import './Login.css'

function Login() {
  function handleSubmit(event) {
    event.preventDefault()
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
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Usuário</label>
          <input id="username" name="username" type="text" autoComplete="username" />
          <label htmlFor="password">Senha</label>
          <input id="password" name="password" type="password" autoComplete="current-password" />
          <button type="submit">Entrar</button>
        </form>
      </section>
    </main>
  )
}

export default Login
