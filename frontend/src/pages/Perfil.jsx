import { useState } from 'react'
import './Perfil.css'

function IconeUsuario() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="54" height="54">
      <circle cx="12" cy="8" r="3.7" />
      <path d="M5.5 19c.9-3.3 3.4-5 6.5-5s5.6 1.7 6.5 5" />
    </svg>
  )
}

function IconeLapis() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="27" height="27">
      <path d="m4 16.8-.8 4 4-.8L19.4 7.8 16.2 4.6Z" />
      <path d="m14.8 6 3.2 3.2M4 16.8l3.2 3.2" />
    </svg>
  )
}

function IconeSair() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="21" height="21">
      <path d="M10 5H5v14h5M13 8l4 4-4 4M8 12h9" />
    </svg>
  )
}

function Perfil({ onNavigate }) {
  const [editandoSenha, setEditandoSenha] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem('auth_user')) || null
    } catch {
      return null
    }
  })()

  function voltar() {
    onNavigate('inicio')
  }

  function cancelarEdicao() {
    setEditandoSenha(false)
    setSenhaAtual('')
    setNovaSenha('')
    setConfirmacaoSenha('')
    setErro('')
  }

  async function salvarSenha(event) {
    event.preventDefault()
    setErro('')
    setSucesso('')
    setCarregando(true)

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('http://localhost:8000/api/user/password', {
        method: 'PUT',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: senhaAtual,
          new_password: novaSenha,
          new_password_confirmation: confirmacaoSenha,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          (data.errors && Object.values(data.errors)[0]?.[0]) ||
          'Não foi possível atualizar a senha.',
        )
      }

      cancelarEdicao()
      setSucesso(data.message || 'Senha atualizada com sucesso.')
    } catch (error) {
      setErro(error.message || 'Não foi possível atualizar a senha.')
    } finally {
      setCarregando(false)
    }
  }

  async function sair() {
    const token = localStorage.getItem('auth_token')

    try {
      if (token) {
        const response = await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          console.error('A API não conseguiu revogar o token de acesso.')
        }
      }
    } catch (error) {
      console.error('Erro ao encerrar a sessão na API:', error)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      onNavigate('login')
    }
  }

  return (
    <main className="perfil-pagina">
      <button
        type="button"
        className="perfil-voltar"
        onClick={voltar}
        aria-label="Voltar para o início"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="31" height="31">
          <path d="M20 12H4m7-7-7 7 7 7" />
        </svg>
      </button>

      <section className="perfil-card" aria-labelledby="perfil-titulo">
        <h1 id="perfil-titulo">Perfil</h1>
        <div className="perfil-avatar" aria-hidden="true"><IconeUsuario /></div>
        <p className="perfil-data">{usuario?.name || 'Usuário'}</p>

        <div className="perfil-campos">
          <label htmlFor="perfil-nome">Nome</label>
          <input id="perfil-nome" type="text" value={usuario?.name || ''} readOnly />

          <label htmlFor="perfil-email">Email</label>
          <input id="perfil-email" type="email" value={usuario?.email || ''} readOnly />

          <label htmlFor="perfil-senha">Senha</label>
          {editandoSenha ? (
            <form className="perfil-editar-senha" onSubmit={salvarSenha}>
              <label htmlFor="perfil-senha-atual">Senha atual</label>
              <input
                id="perfil-senha-atual"
                type="password"
                autoComplete="current-password"
                value={senhaAtual}
                onChange={(event) => setSenhaAtual(event.target.value)}
                required
              />
              <label htmlFor="perfil-senha-nova">Nova senha</label>
              <input
                id="perfil-senha-nova"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={novaSenha}
                onChange={(event) => setNovaSenha(event.target.value)}
                required
              />
              <label htmlFor="perfil-senha-confirmacao">Confirmar nova senha</label>
              <input
                id="perfil-senha-confirmacao"
                type="password"
                autoComplete="new-password"
                minLength={6}
                value={confirmacaoSenha}
                onChange={(event) => setConfirmacaoSenha(event.target.value)}
                required
              />
              <div className="perfil-acoes-senha">
                <button type="submit" disabled={carregando}>
                  {carregando ? 'Salvando...' : 'Salvar senha'}
                </button>
                <button type="button" onClick={cancelarEdicao} disabled={carregando}>
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="perfil-senha">
              <input id="perfil-senha" type="password" value="********" readOnly aria-label="Senha cadastrada" />
              <button
                type="button"
                onClick={() => {
                  setErro('')
                  setSucesso('')
                  setEditandoSenha(true)
                }}
                aria-label="Editar senha"
              >
                <IconeLapis />
              </button>
            </div>
          )}
        </div>

        {erro && <p className="perfil-mensagem perfil-mensagem--erro" role="alert">{erro}</p>}
        {sucesso && <p className="perfil-mensagem perfil-mensagem--sucesso" role="status">{sucesso}</p>}

        <button type="button" className="perfil-sair" onClick={sair}>
          <IconeSair />
          <span>Sair</span>
        </button>
      </section>
    </main>
  )
}

export default Perfil
