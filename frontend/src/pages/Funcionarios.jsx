import { useMemo, useState } from 'react'
import './Funcionarios.css'
import logo from '../assets/logo.png'

const FUNCIONARIOS = [
  { id: 1, nome: 'Talda Fernanda', email: 'taldafernada2007@gmail.com', cargo: 'Funcionário', ativo: true, admissao: '15/04/2026' },
  { id: 2, nome: 'Matheus Henrique Menck dos Reis', email: 'Matheusreidopvp2006@gmail.com', cargo: 'Funcionário', ativo: true, admissao: '15/04/2026' },
  { id: 3, nome: 'Gabrielly Vieira dos Santos', email: 'Gabibigbs34@gmail.com', cargo: 'Funcionário', ativo: false, admissao: '15/04/2026' },
]

function iniciais(nome) {
  const partes = nome.split(' ').filter(Boolean)
  return (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : '')).toUpperCase()
}

const svg = { width: 32, height: 32, viewBox: '0 0 32 32', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

function IconeMenu({ nome }) {
  if (nome === 'inicio') return <svg {...svg}><path d="M5 15 16 4l11 11v12h-8v-8h-6v8H5Z" /></svg>
  if (nome === 'alunos') return <svg {...svg}><rect x="4" y="6" width="24" height="20" rx="2" /><circle cx="12" cy="14" r="3" /><path d="M8 22c.8-3 6.2-3 8 0M19 13h6M19 19h6" /></svg>
  if (nome === 'responsaveis') return <svg {...svg}><circle cx="10.5" cy="12" r="5" /><path d="M2 25c1-4 4-6 8.5-6s7.5 2 8.5 6M19 7.5a5 5 0 0 1 0 9M23 19.5c3 .8 5 2.8 6 5.5" /></svg>
  return <svg {...svg}><circle cx="21" cy="11" r="7" /><path d="m16 16-11 11v2h4v-3h3v-3h3l1-1" /></svg>
}

function Funcionarios({ aoNavegar }) {
  const [busca, setBusca] = useState('')
  const [status, setStatus] = useState('todos')

  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem('auth_user')) || null
    } catch {
      return null
    }
  })()

  const total = FUNCIONARIOS.length
  const ativos = FUNCIONARIOS.filter((f) => f.ativo).length

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return FUNCIONARIOS.filter((f) => {
      if (status === 'ativo' && !f.ativo) return false
      if (status === 'inativo' && f.ativo) return false
      return !termo || f.nome.toLowerCase().includes(termo) || f.email.toLowerCase().includes(termo)
    })
  }, [busca, status])

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
            <button type="button" className="func-adicionar" onClick={() => aoNavegar('/funcionarios/novo')}>
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

            {filtrados.map((f) => (
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

            {filtrados.length === 0 && <p className="func-vazio">Nenhum funcionário encontrado.</p>}
          </section>
        </main>
      </div>
    </div>
  )
}

export default Funcionarios
