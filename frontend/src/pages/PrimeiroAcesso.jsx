import { useState } from 'react'
import './PrimeiroAcesso.css'

function PrimeiroAcesso({ onNavigate }) {
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')

  function confirmar(evento) {
    evento.preventDefault()

    if (!senha || senha !== confirmarSenha) {
      return
    }

    // Ponto de integração para a criação de senha futura.
  }

  return (
    <main className="primeiro-acesso-pagina">
      <button
        type="button"
        className="voltar-validacao"
        onClick={() => onNavigate('primeiroacessotoken')}
        aria-label="Voltar para a validação"
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
          />

          <label htmlFor="confirmar-senha">Confirmar Senha</label>
          <input
            id="confirmar-senha"
            type="password"
            value={confirmarSenha}
            onChange={(evento) => setConfirmarSenha(evento.target.value)}
            autoComplete="new-password"
          />

          <button type="submit">Confirmar</button>
        </form>
      </section>
    </main>
  )
}

export default PrimeiroAcesso
