import { useEffect, useMemo, useState } from 'react'
import './Funcionarios.css'
import logo from '../assets/logo.png'

function iniciais(nome) {
  const partes = (nome || '').split(' ').filter(Boolean)
  if (partes.length === 0) return '?'
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}

const svg = { width: 32, height: 32, viewBox: '0 0 32 32', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

function IconeMenu({ nome }) {
  if (nome === 'inicio') return <svg {...svg}><path d="M5 15 16 4l11 11v12h-8v-8h-6v8H5Z" /></svg>
  if (nome === 'alunos') return <svg {...svg}><rect x="4" y="6" width="24" height="20" rx="2" /><circle cx="12" cy="14" r="3" /><path d="M8 22c.8-3 6.2-3 8 0M19 13h6M19 19h6" /></svg>
  if (nome === 'responsaveis') return <svg {...svg}><circle cx="10.5" cy="12" r="5" /><path d="M2 25c1-4 4-6 8.5-6s7.5 2 8.5 6M19 7.5a5 5 0 0 1 0 9M23 19.5c3 .8 5 2.8 6 5.5" /></svg>
  return <svg {...svg}><circle cx="21" cy="11" r="7" /><path d="m16 16-11 11v2h4v-3h3v-3h3l1-1" /></svg>
}

const FORM_VAZIO = { nome: '', admissao: '', cargo: 'Funcionario', email: '', telefone: '' }

function Funcionarios({ aoNavegar }) {
  const [funcionarios, setFuncionarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('todos')
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [formErro, setFormErro] = useState('')

  async function carregarFuncionarios() {
    setCarregando(true)
    setErro('')
    try {
      const token = localStorage.getItem('auth_token')
      const resposta = await fetch('http://localhost:8000/api/funcionarios', {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!resposta.ok) {
        throw new Error('Falha ao obter lista de funcionários do servidor.')
      }

      const dados = await resposta.json()
      setFuncionarios(Array.isArray(dados) ? dados : dados.data || [])
    } catch (err) {
      console.error('Erro ao carregar funcionários:', err)
      setErro(err.message || 'Erro ao carregar funcionários.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregarFuncionarios()
  }, [])

  useEffect(() => {
    if (!modalAberto) return undefined
    const aoTeclar = (e) => e.key === 'Escape' && fecharModal()
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [modalAberto])

  function alterarCampo(e) {
    setForm((atual) => ({ ...atual, [e.target.name]: e.target.value }))
  }

  function fecharModal() {
    setModalAberto(false)
    setForm(FORM_VAZIO)
    setFormErro('')
  }

  async function enviarFormulario(e) {
    e.preventDefault()
    setSalvando(true)
    setFormErro('')

    try {
      const token = localStorage.getItem('auth_token')
      const resposta = await fetch('http://localhost:8000/api/funcionarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          nome: form.nome.trim(),
          admissao: form.admissao.trim(),
          cargo: form.cargo || 'Funcionario',
          email: form.email.trim(),
          telefone: form.telefone?.trim() || null,
          ativo: true,
        }),
      })

      const data = await resposta.json()

      if (!resposta.ok) {
        const mensagem =
          data.message ||
          (data.errors && Object.values(data.errors)[0]?.[0]) ||
          'Erro ao cadastrar funcionário.'
        throw new Error(mensagem)
      }

      await carregarFuncionarios()
      fecharModal()
    } catch (err) {
      setFormErro(err.message)
    } finally {
      setSalvando(false)
    }
  }

  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem('auth_user')) || null
    } catch {
      return null
    }
  })()

  const total = funcionarios.length
  const ativos = funcionarios.filter((f) => f.ativo).length

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return funcionarios.filter((f) => {
      if (status === 'ativo' && !f.ativo) return false
      if (status === 'inativo' && f.ativo) return false
      const nome = (f.nome || '').toLowerCase()
      const email = (f.email || '').toLowerCase()
      return !termo || nome.includes(termo) || email.includes(termo)
    })
  }, [funcionarios, busca, status])

  return (
    <div className="func-pagina">
      <aside className="func-menu" aria-label="Navegação principal">
        <div className="func-logo"><img src={logo} alt="Logo Recanto Betel" /></div>
        <nav className="func-nav">
          <button type="button" onClick={() => aoNavegar('/inicio')}><IconeMenu nome="inicio" /><span>Início</span></button>
          <button type="button" onClick={() => aoNavegar('/alunos')}><IconeMenu nome="alunos" /><span>Alunos</span></button>
          <button type="button" onClick={() => aoNavegar('/responsaveis')}><IconeMenu nome="responsaveis" /><span>Responsáveis</span></button>
        </nav>
        <div className="func-admin"><IconeMenu nome="admin" /><span>Administrador</span></div>
      </aside>

      <div className="func-principal">
        <header className="func-cabecalho">
          <h1>Recanto Betel</h1>
          <div className="func-perfil">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <circle cx="20" cy="20" r="15.5" />
              <circle cx="20" cy="17" r="5" />
              <path d="M10 31c1.5-4.5 5.5-6 10-6s8.5 1.500 10 6" />
            </svg>
            <span>{usuario?.name || 'Talda Fernanda'}</span>
          </div>
        </header>

        <main className="func-conteudo">
          <div className="func-titulo">
            <div>
              <h2>Gestão de Funcionarios</h2>
              <p>Controle de colaboradores e permissões de acesso</p>
            </div>
            <button type="button" className="func-adicionar" onClick={() => setModalAberto(true)}>
              <svg width="21" height="15" viewBox="0 0 21 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <circle cx="7.3" cy="3.7" r="2.8" />
                <path d="M1 13.7v-1.600c0-1.200.8-1.800 1.600-2.200 1.500-.8 3-1.200 4.700-1.200s3.200.4 4.700 1.200c.8.4 1.600 1 1.600 2.200v1.600ZM16.500 2.700v5.500M13.700 5.500h5.500" />
              </svg>
              Adicionar Funcionário
            </button>
          </div>

          <section className="func-filtros">
            <label className="func-busca">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
                <circle cx="7" cy="7" r="4.800" />
                <path d="m10.500 10.500 3.500 3.500" />
              </svg>
              <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar funcionário" />
            </label>
            <div className="func-select">
              <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filtrar por status">
                <option value="todos">Status: Todos</option>
                <option value="ativo">Status: Ativo</option>
                <option value="inativo">Status: Inativo</option>
              </select>
              <svg width="11" height="6" viewBox="0 0 11 6" fill="none" stroke="currentColor" aria-hidden="true"><path d="M0 0l5.500 6L11 0" /></svg>
            </div>
          </section>

          <div className="func-contadores">
            <span className="func-contador"><i style={{ background: '#1A1A1A' }} />Total: {total}</span>
            <span className="func-contador func-contador--ativo"><i />Ativo: {ativos}</span>
            <span className="func-contador func-contador--inativo"><i />Inativo: {total - ativos}</span>
          </div>

          <section className="func-tabela" aria-label="Lista de funcionários">
            <div className="func-linha func-linha--cabecalho">
              <span>Nome</span>
              <span>Email</span>
              <span>Cargo</span>
              <span className="func-centro">Status</span>
              <span className="func-centro">Ações</span>
            </div>

            {carregando && (
              <p className="func-vazio">Carregando funcionários...</p>
            )}

            {!carregando && erro && (
              <div className="func-vazio" style={{ color: '#b91c1c' }}>
                <p>{erro}</p>
                <button
                  type="button"
                  onClick={carregarFuncionarios}
                  style={{ marginTop: '8px', cursor: 'pointer', padding: '6px 14px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff' }}
                >
                  Tentar novamente
                </button>
              </div>
            )}

            {!carregando && !erro && filtrados.map((f) => (
              <div className="func-linha" key={f.id}>
                <div className="func-nome">
                  <span className="func-avatar">{iniciais(f.nome)}</span>
                  <div>
                    <strong>{f.nome}</strong>
                    <small>Admissão: {f.admissao}</small>
                  </div>
                </div>
                <span className="func-email">{f.email}</span>
                <span>{f.cargo}</span>
                <span className="func-centro">
                  <span className={`func-tag ${f.ativo ? 'func-tag--ativo' : 'func-tag--inativo'}`}>{f.ativo ? 'Ativo' : 'Inativo'}</span>
                </span>
                <span className="func-acoes">
                  <button type="button" className="func-acao func-acao--bloquear" aria-label={`Bloquear acesso de ${f.nome}`}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" aria-hidden="true">
                      <rect x="2.500" y="5.500" width="11" height="8" />
                      <path d="M5.500 5.500v-2a2.500 2.500 0 0 1 5 0v2" />
                      <circle cx="8" cy="9.500" r=".6" fill="currentColor" />
                    </svg>
                  </button>
                  <button type="button" className="func-acao" aria-label={`Editar ${f.nome}`}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2.500 13.500v-3l7.700-7.700a1 1 0 0 1 1.400 0l1.600 1.600a1 1 0 0 1 0 1.400L5.500 13.500Z" />
                      <path d="m9 4 3 3" />
                    </svg>
                  </button>
                </span>
              </div>
            ))}

            {!carregando && !erro && filtrados.length === 0 && (
              <p className="func-vazio">Nenhum funcionário encontrado.</p>
            )}
          </section>
        </main>
      </div>

      {modalAberto && (
        <div className="func-fundo-modal" onClick={fecharModal}>
          <form
            className="func-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="func-modal-titulo"
            onClick={(e) => e.stopPropagation()}
            onSubmit={enviarFormulario}
          >
            <header className="func-modal-cabecalho">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M31.9997 17.0001C31.9997 17.2653 31.8943 17.5197 31.7068 17.7072C31.5192 17.8948 31.2649 18.0001 30.9997 18.0001H28.9997V20.0001C28.9997 20.2653 28.8943 20.5197 28.7068 20.7072C28.5192 20.8948 28.2649 21.0001 27.9997 21.0001C27.7345 21.0001 27.4801 20.8948 27.2926 20.7072C27.105 20.5197 26.9997 20.2653 26.9997 20.0001V18.0001H24.9997C24.7345 18.0001 24.4801 17.8948 24.2926 17.7072C24.105 17.5197 23.9997 17.2653 23.9997 17.0001C23.9997 16.7349 24.105 16.4805 24.2926 16.293C24.4801 16.1055 24.7345 16.0001 24.9997 16.0001H26.9997V14.0001C26.9997 13.7349 27.105 13.4805 27.2926 13.293C27.4801 13.1055 27.7345 13.0001 27.9997 13.0001C28.2649 13.0001 28.5192 13.1055 28.7068 13.293C28.8943 13.4805 28.9997 13.7349 28.9997 14.0001V16.0001H30.9997C31.2649 16.0001 31.5192 16.1055 31.7068 16.293C31.8943 16.4805 31.9997 16.7349 31.9997 17.0001ZM24.7659 24.3564C24.9367 24.5596 25.0197 24.8223 24.9967 25.0867C24.9737 25.3512 24.8466 25.5956 24.6434 25.7664C24.4402 25.9371 24.1775 26.0201 23.9131 25.9971C23.6486 25.9742 23.4042 25.8471 23.2334 25.6439C20.7184 22.6489 17.2609 21.0001 13.4997 21.0001C9.73843 21.0001 6.28093 22.6489 3.76593 25.6439C3.59519 25.8469 3.35079 25.9738 3.08648 25.9967C2.82217 26.0196 2.55961 25.9365 2.35655 25.7657C2.15349 25.595 2.02658 25.3506 2.00372 25.0863C1.98087 24.822 2.06394 24.5594 2.23468 24.3564C4.10218 22.1339 6.42468 20.5551 9.00593 19.7101C7.43831 18.7337 6.23133 17.2734 5.56759 15.55C4.90386 13.8265 4.81949 11.9338 5.32724 10.1582C5.83499 8.38254 6.90724 6.82057 8.38176 5.70859C9.85629 4.59661 11.6529 3.99512 13.4997 3.99512C15.3465 3.99512 17.1431 4.59661 18.6176 5.70859C20.0921 6.82057 21.1644 8.38254 21.6721 10.1582C22.1799 11.9338 22.0955 13.8265 21.4318 15.55C20.768 17.2734 19.561 18.7337 17.9934 19.7101C20.5747 20.5551 22.8972 22.1339 24.7659 24.3564ZM13.4997 19.0001C14.7853 19.0001 16.042 18.6189 17.1109 17.9047C18.1798 17.1904 19.0129 16.1753 19.5049 14.9876C19.9969 13.7998 20.1256 12.4929 19.8748 11.232C19.624 9.97115 19.0049 8.81296 18.0959 7.90392C17.1868 6.99488 16.0286 6.37582 14.7678 6.12501C13.5069 5.87421 12.2 6.00293 11.0122 6.4949C9.82451 6.98687 8.80935 7.81999 8.09512 8.88891C7.38089 9.95783 6.99968 11.2145 6.99968 12.5001C7.00166 14.2234 7.68712 15.8756 8.90567 17.0941C10.1242 18.3127 11.7764 18.9981 13.4997 19.0001Z" fill="white" />
              </svg>
              <h3 id="func-modal-titulo">Novo Funcionário</h3>
              <button type="button" className="func-modal-fechar" onClick={fecharModal} aria-label="Fechar">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <path d="M25.7071 24.2926C25.8 24.3855 25.8737 24.4958 25.924 24.6172C25.9743 24.7386 26.0001 24.8687 26.0001 25.0001C26.0001 25.1315 25.9743 25.2616 25.924 25.383C25.8737 25.5044 25.8 25.6147 25.7071 25.7076C25.6142 25.8005 25.5039 25.8742 25.3825 25.9245C25.2611 25.9747 25.131 26.0006 24.9996 26.0006C24.8682 26.0006 24.7381 25.9747 24.6167 25.9245C24.4953 25.8742 24.385 25.8005 24.2921 25.7076L15.9996 17.4138L7.70708 25.7076C7.51944 25.8952 7.26494 26.0006 6.99958 26.0006C6.73422 26.0006 6.47972 25.8952 6.29208 25.7076C6.10444 25.5199 5.99902 25.2654 5.99902 25.0001C5.99902 24.7347 6.10444 24.4802 6.29208 24.2926L14.5858 16.0001L6.29208 7.70757C6.10444 7.51993 5.99902 7.26543 5.99902 7.00007C5.99902 6.7347 6.10444 6.48021 6.29208 6.29257C6.47972 6.10493 6.73422 5.99951 6.99958 5.99951C7.26494 5.99951 7.51944 6.10493 7.70708 6.29257L15.9996 14.5863L24.2921 6.29257C24.4797 6.10493 24.7342 5.99951 24.9996 5.99951C25.2649 5.99951 25.5194 6.10493 25.7071 6.29257C25.8947 6.48021 26.0001 6.7347 26.0001 7.00007C26.0001 7.26543 25.8947 7.51993 25.7071 7.70757L17.4133 16.0001L25.7071 24.2926Z" fill="white" />
                </svg>
              </button>
            </header>

            <div className="func-modal-corpo">
              {formErro && (
                <div className="func-erro" role="alert">
                  {formErro}
                </div>
              )}

              <label className="func-campo">
                <span>Nome Completo</span>
                <input name="nome" value={form.nome} onChange={alterarCampo} placeholder="Ex: Thiago Veigh" required />
              </label>
              <label className="func-campo">
                <span>Data de Admissão</span>
                <input name="admissao" value={form.admissao} onChange={alterarCampo} placeholder="Ex: 10/08/2026" required />
              </label>
              <label className="func-campo">
                <span>Cargo</span>
                <div className="func-campo-select">
                  <select name="cargo" value={form.cargo} onChange={alterarCampo}>
                    <option value="Funcionario">Funcionario</option>
                  </select>
                  <svg width="11" height="6" viewBox="0 0 11 6" fill="none" aria-hidden="true"><path d="M0 0L5.5 6L11 0" stroke="black" /></svg>
                </div>
              </label>
              <label className="func-campo">
                <span>Email</span>
                <input type="email" name="email" value={form.email} onChange={alterarCampo} placeholder="Ex: teste@gmail.com" required />
              </label>
              <label className="func-campo">
                <span>Telefone</span>
                <input type="tel" name="telefone" value={form.telefone} onChange={alterarCampo} placeholder="Ex: 15997854565" />
              </label>

              <aside className="func-aviso">
                <div className="func-aviso-topo">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2.25C10.0716 2.25 8.18657 2.82183 6.58319 3.89317C4.97982 4.96451 3.73013 6.48726 2.99218 8.26884C2.25422 10.0504 2.06114 12.0108 2.43735 13.9021C2.81355 15.7934 3.74215 17.5307 5.10571 18.8943C6.46928 20.2579 8.20656 21.1865 10.0979 21.5627C11.9892 21.9389 13.9496 21.7458 15.7312 21.0078C17.5127 20.2699 19.0355 19.0202 20.1068 17.4168C21.1782 15.8134 21.75 13.9284 21.75 12C21.7473 9.41498 20.7192 6.93661 18.8913 5.10872C17.0634 3.28084 14.585 2.25273 12 2.25ZM12 20.25C10.3683 20.25 8.77326 19.7661 7.41655 18.8596C6.05984 17.9531 5.00242 16.6646 4.378 15.1571C3.75358 13.6496 3.5902 11.9908 3.90853 10.3905C4.22685 8.79016 5.01259 7.32015 6.16637 6.16637C7.32016 5.01259 8.79017 4.22685 10.3905 3.90852C11.9909 3.59019 13.6497 3.75357 15.1571 4.37799C16.6646 5.00242 17.9531 6.05984 18.8596 7.41655C19.7661 8.77325 20.25 10.3683 20.25 12C20.2475 14.1873 19.3775 16.2843 17.8309 17.8309C16.2843 19.3775 14.1873 20.2475 12 20.25ZM11.25 12.75V7.5C11.25 7.30109 11.329 7.11032 11.4697 6.96967C11.6103 6.82902 11.8011 6.75 12 6.75C12.1989 6.75 12.3897 6.82902 12.5303 6.96967C12.671 7.11032 12.75 7.30109 12.75 7.5V12.75C12.75 12.9489 12.671 13.1397 12.5303 13.2803C12.3897 13.421 12.1989 13.5 12 13.5C11.8011 13.5 11.6103 13.421 11.4697 13.2803C11.329 13.1397 11.25 12.9489 11.25 12.75ZM13.125 16.125C13.125 16.3475 13.059 16.565 12.9354 16.75C12.8118 16.935 12.6361 17.0792 12.4305 17.1644C12.225 17.2495 11.9988 17.2718 11.7805 17.2284C11.5623 17.185 11.3618 17.0778 11.2045 16.9205C11.0472 16.7632 10.94 16.5627 10.8966 16.3445C10.8532 16.1262 10.8755 15.9 10.9606 15.6945C11.0458 15.4889 11.19 15.3132 11.375 15.1896C11.56 15.066 11.7775 15 12 15C12.2984 15 12.5845 15.1185 12.7955 15.3295C13.0065 15.5405 13.125 15.8266 13.125 16.125Z" fill="#60AAFF" />
                  </svg>
                  <strong>Aviso</strong>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2.25C10.0716 2.25 8.18657 2.82183 6.58319 3.89317C4.97982 4.96451 3.73013 6.48726 2.99218 8.26884C2.25422 10.0504 2.06114 12.0108 2.43735 13.9021C2.81355 15.7934 3.74215 17.5307 5.10571 18.8943C6.46928 20.2579 8.20656 21.1865 10.0979 21.5627C11.9892 21.9389 13.9496 21.7458 15.7312 21.0078C17.5127 20.2699 19.0355 19.0202 20.1068 17.4168C21.1782 15.8134 21.75 13.9284 21.75 12C21.7473 9.41498 20.7192 6.93661 18.8913 5.10872C17.0634 3.28084 14.585 2.25273 12 2.25ZM12 20.25C10.3683 20.25 8.77326 19.7661 7.41655 18.8596C6.05984 17.9531 5.00242 16.6646 4.378 15.1571C3.75358 13.6496 3.5902 11.9908 3.90853 10.3905C4.22685 8.79016 5.01259 7.32015 6.16637 6.16637C7.32016 5.01259 8.79017 4.22685 10.3905 3.90852C11.9909 3.59019 13.6497 3.75357 15.1571 4.37799C16.6646 5.00242 17.9531 6.05984 18.8596 7.41655C19.7661 8.77325 20.25 10.3683 20.25 12C20.2475 14.1873 19.3775 16.2843 17.8309 17.8309C16.2843 19.3775 14.1873 20.2475 12 20.25ZM11.25 12.75V7.5C11.25 7.30109 11.329 7.11032 11.4697 6.96967C11.6103 6.82902 11.8011 6.75 12 6.75C12.1989 6.75 12.3897 6.82902 12.5303 6.96967C12.671 7.11032 12.75 7.30109 12.75 7.5V12.75C12.75 12.9489 12.671 13.1397 12.5303 13.2803C12.3897 13.421 12.1989 13.5 12 13.5C11.8011 13.5 11.6103 13.421 11.4697 13.2803C11.329 13.1397 11.25 12.9489 11.25 12.75ZM13.125 16.125C13.125 16.3475 13.059 16.565 12.9354 16.75C12.8118 16.935 12.6361 17.0792 12.4305 17.1644C12.225 17.2495 11.9988 17.2718 11.7805 17.2284C11.5623 17.185 11.3618 17.0778 11.2045 16.9205C11.0472 16.7632 10.94 16.5627 10.8966 16.3445C10.8532 16.1262 10.8755 15.9 10.9606 15.6945C11.0458 15.4889 11.19 15.3132 11.375 15.1896C11.56 15.066 11.7775 15 12 15C12.2984 15 12.5845 15.1185 12.7955 15.3295C13.0065 15.5405 13.125 15.8266 13.125 16.125Z" fill="#60AAFF" />
                  </svg>
                </div>
                <p>A “Senha de Token” é uma senha gerada aleatoriamente usada para enviar ao funcionario via email na sua primeira entrada ao sistema, a senha pode ser enviada após a criação do funcionario e indo no “lapis” da categoria ações</p>
              </aside>
            </div>

            <footer className="func-modal-rodape">
              <button type="button" className="func-btn func-btn--cancelar" onClick={fecharModal} disabled={salvando}>Cancelar</button>
              <button type="submit" className="func-btn func-btn--adicionar" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Adicionar'}
              </button>
            </footer>
          </form>
        </div>
      )}
    </div>
  )
}

export default Funcionarios
