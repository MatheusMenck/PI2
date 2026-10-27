import './Dashboard.css'
import logo from '../assets/logo.png'

function Icon({ name, size = 24 }) {
  const props = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, viewBox: '0 0 24 24', width: size, height: size }
  const paths = {
    home: <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3Z" />,
    students: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="10" r="2.2" /><path d="M5.5 16c.7-2.3 5.3-2.3 6 0M14 9h4M14 13h4M14 17h3" /></>,
    guardians: <><circle cx="9" cy="8" r="3.5" /><circle cx="16.5" cy="8" r="2.5" /><path d="M2.5 20c.7-3.5 3-5.2 6.5-5.2s5.8 1.7 6.5 5.2M15.5 14.5c3.2.4 5.1 2.1 5.6 5" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    report: <><path d="M6 3h9l3 3v15H6Z" /><path d="M9 11h6M9 15h6M15 3v4h4" /></>,
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
  { label: 'Alunos Ativos', value: 458, tone: 'green' },
  { label: 'Rematriculas Pedente', value: 52, tone: 'yellow' },
  { label: 'Indeferido', value: 5, tone: 'red' },
]

function Dashboard({ rota, aoNavegar }) {
  const usuario = (() => {
    try { return JSON.parse(localStorage.getItem('auth_user')) || null } catch { return null }
  })()
  const primeiroNome = usuario?.name?.trim().split(/\s+/)[0] || 'usuário'

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
          <div className="dashboard-user"><Icon name="profile" size={34} /><span>{usuario?.name || 'Usuário'}</span></div>
        </header>

        <main className="dashboard-content">
          <section className="dashboard-welcome" aria-labelledby="dashboard-title">
            <h2 id="dashboard-title">Olá, {primeiroNome}!</h2>
            <p>Pronto para o dia de hoje?</p>
          </section>

          <section className="dashboard-actions" aria-label="Ações futuras">
            <article><span>Adicionar Aluno</span><Icon name="plus" size={25} /></article>
            <article><span>Adicionar Responsavel</span><Icon name="plus" size={25} /></article>
            <article><span>Adicionar Relatos</span><Icon name="plus" size={25} /></article>
          </section>

          <section className="dashboard-indicators" aria-label="Indicadores demonstrativos">
            {indicadores.map((indicador) => (
              <article className="dashboard-card" key={indicador.label}>
                <span className={`dashboard-status dashboard-status--${indicador.tone}`} aria-hidden="true" />
                <p>{indicador.label}</p>
                <strong>{indicador.value}</strong>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
