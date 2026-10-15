import { useState } from 'react'
import './RecuperacaoSenha.css'

function RecuperacaoSenha({ onNavigate }) {
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  function alterar(evento) {
    evento.preventDefault()

    if (!senha || senha !== confirmarSenha) {
      return
    }

    // Ponto de integração para a alteração de senha futura.
  }

  return (
    <main className="recuperacao-pagina">
      <button
        type="button"
        className="voltar-login"
        onClick={() => onNavigate('login')}
        aria-label="Voltar para o login"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="25" height="25">
          <path d="M19 12H5m6-6-6 6 6 6" />
        </svg>
      </button>

      <section className="recuperacao-card" aria-labelledby="recuperacao-titulo">
        <h1 id="recuperacao-titulo">Recuperação de Senha</h1>
        <p>Recupere seu acesso</p>

        <form onSubmit={alterar}>
          <label htmlFor="senha-nova">Senha nova</label>
          <input
            id="senha-nova"
            type="password"
            value={senha}
            onChange={(evento) => setSenha(evento.target.value)}
            autoComplete="new-password"
          />

          <label htmlFor="confirmar-senha">Confirmar Senha</label>
          <input
            id="confirmar-senha"
            type="password"
            value={confirmarSenha}
            onChange={(evento) => setConfirmarSenha(evento.target.value)}
            autoComplete="new-password"
          />

          <button type="submit">Alterar</button>
        </form>
      </section>
    </main>
  )
}

export default RecuperacaoSenha
