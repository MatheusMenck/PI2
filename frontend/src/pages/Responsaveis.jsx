import './Alunos.css'
import logo from '../assets/logo.png'

function Responsaveis({ rota, aoNavegar }) {
  return (
    <main className="alunos-pagina">
      <aside className="menu" aria-label="Navegação principal">
        <img className="logo" src={logo} alt="Logo Recanto Betel" />
        <nav>
          <button className={`item-menu ${rota === 'inicio' ? 'selecionado' : ''}`} onClick={() => aoNavegar('inicio')}>
            <span>Início</span>
          </button>
          <button className={`item-menu ${rota === 'alunos' ? 'selecionado' : ''}`} onClick={() => aoNavegar('alunos')}>
            <span>Alunos</span>
          </button>
          <button className={`item-menu ${rota === 'responsaveis' ? 'selecionado' : ''}`} onClick={() => aoNavegar('responsaveis')}>
            <span>Responsáveis</span>
          </button>
        </nav>
      </aside>

      <section className="area-principal">
        <header className="cabecalho">
          <h1>Recanto Betel</h1>
        </header>
        <div className="conteudo-alunos">
          <h2>Gestão de Responsáveis</h2>
        </div>
      </section>
    </main>
  )
}

export default Responsaveis
