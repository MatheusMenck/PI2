import { useEffect, useState } from 'react'
import { buscarIndicadores } from '../utils/dashboardApi'
import './Dashboard.css'
import { getDisplayName, getStoredAuthUser } from '../authUser'
import logo from '../assets/logo.png'

function Icon({ name, size = 24 }) {
  const props = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, viewBox: '0 0 24 24', width: size, height: size }
  const paths = {
    home: <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3Z" />,
    students: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="10" r="2.2" /><path d="M5.5 16c.7-2.3 5.3-2.3 6 0M14 9h4M14 13h4M14 17h3" /></>,
    guardians: <><circle cx="9" cy="8" r="3.5" /><circle cx="16.5" cy="8" r="2.5" /><path d="M2.5 20c.7-3.5 3-5.2 6.5-5.2s5.8 1.7 6.5 5.2M15.5 14.5c3.2.4 5.1 2.1 5.6 5" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    admin: <><circle cx="16" cy="8" r="5" /><path d="m12.5 11.5-8.5 8.5v1h3v-2h2v-2h2l2.5-2.5" /></>,
    profile: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="9" r="3" /><path d="M6.5 19c.9-3 3-4.5 5.5-4.5s4.6 1.5 5.5 4.5" /></>,
  }
  return <svg {...props}>{paths[name]}</svg>
}

const links = [
  { route: 'inicio', label: 'Início', icon: 'home' },
  { route: 'alunos', label: 'Alunos', icon: 'students' },
  { route: 'responsaveis', label: 'Responsáveis', icon: 'guardians' },
]

const indicadores = [
  { label: 'Alunos Ativos', key: 'ativos', tone: 'green' },
  { label: 'Rematriculas Pedente', key: 'pendentes', tone: 'yellow' },
  { label: 'Indeferido', key: 'indeferidos', tone: 'red' },
]

function Dashboard({ rota, aoNavegar }) {
  const [totais, setTotais] = useState(null)
  const [erro, setErro] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    buscarIndicadores(controller.signal)
      .then((dados) => { if (!controller.signal.aborted) setTotais(dados) })
      .catch((falha) => { if (!controller.signal.aborted) setErro(falha.message) })
    return () => controller.abort()
  }, [])
  const usuario = getStoredAuthUser()
  const primeiroNome = getDisplayName(usuario).trim().split(/\s+/)[0]

  function navegar(route) {
    aoNavegar(route)
  }

  return (
    <div className="dashboard">
      <aside className="dashboard-sidebar" aria-label="Navegação principal">
        <div className="dashboard-brand"><img src={logo} alt="Logo Recanto Betel" /></div>
        <nav className="dashboard-nav">
          {links.map((link) => (
            <button key={link.route} type="button" className={rota === link.route ? 'is-active' : ''} onClick={() => navegar(link.route)}>
              <Icon name={link.icon} /><span>{link.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <div className="dashboard-layout">
        <header className="dashboard-header">
          <h1>Recanto Betel</h1>
          <div className="dashboard-header-actions">
            {usuario?.cargo === 'admin' && (
              <button type="button" className="dashboard-user" onClick={() => navegar('funcionarios')} aria-label="Administrar funcionários">
                <Icon name="admin" size={30} />
              </button>
            )}
            <button type="button" className="dashboard-user" onClick={() => navegar('perfil')} aria-label="Abrir perfil">
              <Icon name="profile" size={34} /><span>{getDisplayName(usuario)}</span>
            </button>
          </div>
        </header>

        <main className="dashboard-content">
          <section className="dashboard-welcome" aria-labelledby="dashboard-title">
            <h2 id="dashboard-title">Olá, {primeiroNome}!</h2>
            <p>Pronto para o dia de hoje?</p>
          </section>

          <section className="dashboard-actions" aria-label="Ações futuras">
            <article 
    onClick={() => navegar('alunos/novo')} 
    style={{ cursor: 'pointer' }}
  >
    <span>Adicionar Aluno</span>
    <Icon name="plus" size={25} />
  </article>
            <article><span>Adicionar Responsavel</span><Icon name="plus" size={25} /></article>
            <article><span>Adicionar Relatos</span><Icon name="plus" size={25} /></article>
          </section>

          {erro && <p role="alert">{erro}</p>}
          <section className="dashboard-indicators" aria-label="Indicadores de alunos" aria-busy={!totais && !erro}>
            {indicadores.map((indicador) => (
              <article className="dashboard-card" key={indicador.label}>
                <span className={`dashboard-status dashboard-status--${indicador.tone}`} aria-hidden="true" />
                <p>{indicador.label}</p>
                <strong>{indicador.key === 'indeferidos' ? 0 : totais?.[indicador.key] ?? '—'}</strong>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
