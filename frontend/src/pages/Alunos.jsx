import { useEffect, useState } from 'react'
import './Alunos.css'
import { buscarAlunos, dataBr, fotoUrl } from '../utils/alunosApi'
import logo from '../assets/logo.png'

function Icone({ nome, tamanho = 26 }) {
  const comum = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    strokeWidth: '1.9',
  }

  const desenhos = {
    inicio: <path {...comum} d="m3 11 9-8 9 8v10H15v-6H9v6H3Z" />,
    alunos: <><rect {...comum} x="3" y="4" width="18" height="16" rx="1" /><circle {...comum} cx="8" cy="10" r="2" /><path {...comum} d="M5.5 16c.5-2 4.5-2 5 0M14 9h4M14 13h4M14 17h3" /></>,
    responsaveis: <><circle {...comum} cx="9" cy="8" r="4" /><circle {...comum} cx="16" cy="7" r="3" /><path {...comum} d="M2.5 20c.4-4 3.1-6 6.5-6s6.1 2 6.5 6M15 14c3.5.2 5.7 2.2 6 5.5" /></>,
    busca: <><circle {...comum} cx="10.5" cy="10.5" r="7" /><path {...comum} d="m16 16 5 5" /></>,
    filtro: <path {...comum} d="M3 4h18l-7 8v6l-4 2v-8Z" />,
    perfil: <><circle {...comum} cx="12" cy="12" r="9" /><circle {...comum} cx="12" cy="9" r="3" /><path {...comum} d="M6.5 19c.8-3.2 3.1-4.8 5.5-4.8s4.7 1.6 5.5 4.8" /></>,
  }

  return <svg aria-hidden="true" viewBox="0 0 24 24" width={tamanho} height={tamanho}>{desenhos[nome]}</svg>
}

function Alunos({ rota, aoNavegar }) {
  const [alunos, setAlunos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    buscarAlunos('', controller.signal).then((dados) => setAlunos(dados.alunos))
      .catch((erro) => { if (erro.name !== 'AbortError') setErro(erro.message) })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false) })
    return () => controller.abort()
  }, [])

  const [perfil, setPerfil] = useState(false)
  const [modalAlunos, setModalAlunos] = useState(false)
  const [filtroAlunos, setFiltroAlunos] = useState({
    nome: '', cpf: '', telefone: '', dataInicio: '', dataFim: '', status: 'Todos',
  })
  const [pesquisa, setPesquisa] = useState('')

  function navegar(caminho) {
    aoNavegar(caminho)
  }

  function pesquisar(evento) {
    evento.preventDefault()
  }

  function adicionarAluno() {
    navegar('/alunos/novo')
  }

  function abrirAluno(id) {
    navegar(`/alunos/${id}`)
  }

  function fecharModal(evento) {
    if (evento.target === evento.currentTarget) {
      setModalAlunos(false)
    }
  }

  function alterarFiltro(evento) {
    setFiltroAlunos((atual) => ({ ...atual, [evento.target.name]: evento.target.value }))
  }

  function limparFiltros() {
    setFiltroAlunos({ nome: '', cpf: '', telefone: '', dataInicio: '', dataFim: '', status: 'Todos' })
  }

  function aplicarFiltros() {
    setModalAlunos(false)
  }

  useEffect(() => {
    if (!modalAlunos) return undefined
    const aoTeclar = (evento) => evento.key === 'Escape' && setModalAlunos(false)
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [modalAlunos])

  const usuarioSalvo = (() => {
    try {
      return JSON.parse(localStorage.getItem('auth_user')) || null
    } catch {
      return null
    }
  })()

  async function fazerLogout() {
    const token = localStorage.getItem('auth_token')
    if (token) {
      try {
        await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (err) {
        console.error('Erro ao deslogar na API:', err)
      }
    }
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    navegar('login')
  }

  return (
    <main className="alunos-pagina">
      <aside className="menu" aria-label="Navegação principal">
      <img className="logo" src={logo} alt="Logo Recanto Betel" />
        <nav>
          <button className={`item-menu ${rota === 'inicio' ? 'selecionado' : ''}`} onClick={() => navegar('/inicio')}>
            <Icone nome="inicio" /><span>Início</span>
          </button>
          <button className={`item-menu ${rota === 'alunos' || rota.startsWith('alunos/') ? 'selecionado' : ''}`} onClick={() => navegar('/alunos')}>
            <Icone nome="alunos" /><span>Alunos</span>
          </button>
          <button className={`item-menu ${rota === 'responsaveis' ? 'selecionado' : ''}`} onClick={() => navegar('/responsaveis')}>
            <Icone nome="responsaveis" /><span>Responsáveis</span>
          </button>
        </nav>
      </aside>

      <section className="area-principal">
        <header className="cabecalho">
          <h1>Recanto Betel</h1>
          <button className="botao-perfil" onClick={() => setPerfil(true)} aria-label="Abrir perfil">
            <Icone nome="perfil" tamanho={34} />
            <span>{usuarioSalvo?.name || 'NOME'}</span>
          </button>
        </header>

        <div className="conteudo-alunos">
          <form className="barra-pesquisa" onSubmit={pesquisar}>
            <input value={pesquisa} onChange={(evento) => setPesquisa(evento.target.value)} placeholder="Pesquisar" aria-label="Pesquisar alunos" />
            <button type="submit" aria-label="Pesquisar"><Icone nome="busca" tamanho={31} /></button>
            <button type="button" onClick={() => setModalAlunos(true)} aria-label="Abrir filtro"><Icone nome="filtro" tamanho={31} /></button>
          </form>

          <button className="adicionar-aluno" onClick={adicionarAluno}>Adicionar Aluno <strong>+</strong></button>

          <section className="lista-alunos" aria-label="Alunos">
            {carregando && <p role="status">Carregando alunos...</p>}
            {erro && <p role="alert">{erro}</p>}
            {!carregando && !erro && alunos.length === 0 && <p>Nenhum aluno cadastrado.</p>}
            {alunos.map((aluno) => (
              <button key={aluno.id} className="cartao-aluno" onClick={() => abrirAluno(aluno.id)}>
                <span className="avatar" aria-hidden="true" style={{ backgroundImage: aluno.foto ? `url("${fotoUrl(aluno.foto)}")` : 'none' }} />
                <span className="dados-aluno">
                  <span className="campo nome"><small>Nome</small><span>{aluno.nome}</span></span>
                  <span className="campo nascimento"><small>Data de Nascimento</small><span>{dataBr(aluno.nascimento)}</span></span>
                  <span className="campo cpf"><small>CPF</small><span>{aluno.cpf || 'Não informado'}</span></span>
                  <span className="campo telefone"><small>Telefone</small><span>{aluno.telefone || 'Não informado'}</span></span>
                </span>
                <span className={`status ${aluno.status?.toLowerCase() || 'sem-status'}`}><small>Status da Matrícula</small><span>{aluno.status || 'Não informado'}</span></span>
              </button>
            ))}
          </section>
        </div>
      </section>

      {perfil && (
        <div className="fundo-modal" onClick={() => setPerfil(false)}>
          <section
            className="modal-perfil"
            role="dialog"
            aria-modal="true"
            aria-label="Perfil"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="fechar-modal" onClick={() => setPerfil(false)} aria-label="Fechar">×</button>
            <div className="perfil-info">
              <h3>{usuarioSalvo?.name || 'Usuário'}</h3>
              <p>{usuarioSalvo?.email || 'Sem e-mail cadastrado'}</p>
            </div>
            <button className="botao-logout" onClick={fazerLogout}>
              Sair da conta
            </button>
          </section>
        </div>
      )}

      {modalAlunos && (
        <div className="fundo-modal fundo-modal--filtro" onClick={fecharModal}>
          <section className="modal-filtro" role="dialog" aria-modal="true" aria-labelledby="titulo-filtro-alunos" onClick={(evento) => evento.stopPropagation()}>
            <header className="modal-filtro-cabecalho">
              <span className="icone-filtro"><Icone nome="filtro" tamanho={24} /></span>
              <h2 id="titulo-filtro-alunos">Filtrar Aluno</h2>
              <button type="button" onClick={() => setModalAlunos(false)} aria-label="Fechar">×</button>
            </header>
            <div className="modal-filtro-corpo">
              <label>Nome do Aluno<input name="nome" value={filtroAlunos.nome} onChange={alterarFiltro} placeholder="Ex: Tiago Veigh" /></label>
              <label>CPF<input name="cpf" value={filtroAlunos.cpf} onChange={alterarFiltro} placeholder="Ex: 157751452" /></label>
              <label>Telefone<input name="telefone" value={filtroAlunos.telefone} onChange={alterarFiltro} placeholder="Ex: 15997854565" /></label>
              <fieldset className="filtro-data"><legend>Data de Cadastro</legend><label>De<input type="date" name="dataInicio" value={filtroAlunos.dataInicio} onChange={alterarFiltro} /></label><span>—</span><label>Até<input type="date" name="dataFim" value={filtroAlunos.dataFim} onChange={alterarFiltro} /></label></fieldset>
              <fieldset className="filtro-status"><legend>Status de Matrícula</legend>
                {['Todos', 'Ativos', 'Pendentes'].map((status) => <button type="button" key={status} className={`${filtroAlunos.status === status ? 'selecionado ' : ''}${status.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`} onClick={() => setFiltroAlunos((atual) => ({ ...atual, status }))}>{status !== 'Todos' && <i />} {status}</button>)}
              </fieldset>
            </div>
            <footer className="modal-filtro-rodape">
              <button type="button" className="limpar-filtros" onClick={limparFiltros}>↶ Limpar Filtros</button>
              <div><button type="button" className="cancelar-filtro" onClick={() => setModalAlunos(false)}>Cancelar</button><button type="button" className="aplicar-filtro" onClick={aplicarFiltros}>Aplicar</button></div>
            </footer>
          </section>
        </div>
      )}
    </main>
  )
}

export default Alunos
