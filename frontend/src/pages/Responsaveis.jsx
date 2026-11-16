import { useCallback, useEffect, useRef, useState } from 'react'
import { getDisplayName, getStoredAuthUser } from '../authUser'
import './Alunos.css'
import './Responsaveis.css'
import logo from '../assets/logo.png'
import fotoResponsavel from '../assets/responsavel-referencia.png'
import { buscarResponsaveis } from '../utils/responsaveisApi'
import { dataBr, fotoUrl } from '../utils/alunosApi'
import fotoAluno from '../assets/aluno-vinculado-referencia.png'

const alunosReferencia = [
  { id: 'aluno-1', nome: 'Cinnamoroll dos Santos Vieira', nascimento: '01/02/2007', telefone: '(15) 99785-4515', foto: fotoAluno },
  { id: 'aluno-2', nome: 'Kuromi Oliveira', nascimento: '22/11/2008', telefone: '(15) 99775-0102', foto: fotoAluno },
  { id: 'aluno-3', nome: 'Hello Kitty da Silva', nascimento: '14/08/2010', telefone: '(15) 99810-3147', foto: fotoAluno },
]

const filtrosVazios = { nome: '', cpf: '', telefone: '', nis: '' }

function Icone({ nome, tamanho = 24 }) {
  const props = {
    width: tamanho,
    height: tamanho,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }
  const desenhos = {
    inicio: <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3Z" />,
    alunos: <><rect x="3" y="4" width="18" height="16" rx="1" /><circle cx="8" cy="10" r="2" /><path d="M5.5 16c.5-2 4.5-2 5 0M14 9h4M14 13h4M14 17h3" /></>,
    responsaveis: <><circle cx="9" cy="8" r="4" /><circle cx="16" cy="7" r="3" /><path d="M2.5 20c.4-4 3.1-6 6.5-6s6.1 2 6.5 6M15 14c3.5.2 5.7 2.2 6 5.5" /></>,
    busca: <><circle cx="10.5" cy="10.5" r="7" /><path d="m16 16 5 5" /></>,
    filtro: <path d="M3 4h18l-7 8v6l-4 2v-8Z" />,
    ajustar: <><path d="M4 6h16M4 12h16M4 18h16" /><path d="M8 4v4M15 10v4M10 16v4" /></>,
    perfil: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="9" r="3" /><path d="M6.5 19c.8-3.2 3.1-4.8 5.5-4.8s4.7 1.6 5.5 4.8" /></>,
    editar: <><path d="m4 16.5-.8 4.3 4.3-.8L20 7.5 16.5 4 4 16.5Z" /><path d="m14.5 6 3.5 3.5" /></>,
    voltar: <path d="m15 18-6-6 6-6M9 12h12" />,
    fechar: <path d="m5 5 14 14M19 5 5 19" />,
    limpar: <><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8" /><path d="M3 3v5h5" /></>,
  }

  return <svg {...props}>{desenhos[nome]}</svg>
}

function NavegacaoResponsaveis({ rota, aoNavegar }) {
  return (
    <aside className="menu" aria-label="Navegação principal">
      <img className="logo" src={logo} alt="Logo Recanto Betel" />
      <nav>
        <button type="button" className={`item-menu ${rota === 'inicio' ? 'selecionado' : ''}`} onClick={() => aoNavegar('inicio')}>
          <Icone nome="inicio" /><span>Início</span>
        </button>
        <button type="button" className={`item-menu ${rota === 'alunos' ? 'selecionado' : ''}`} onClick={() => aoNavegar('alunos')}>
          <Icone nome="alunos" /><span>Alunos</span>
        </button>
        <button type="button" className={`item-menu ${rota.startsWith('responsaveis') ? 'selecionado' : ''}`} onClick={() => aoNavegar('responsaveis')}>
          <Icone nome="responsaveis" /><span>Responsáveis</span>
        </button>
      </nav>
    </aside>
  )
}

function Cabecalho({ aoNavegar }) {
  const usuario = getStoredAuthUser()

  return (
    <header className="cabecalho">
      <h1>Recanto Betel</h1>
      <button type="button" className="botao-perfil" onClick={() => aoNavegar('perfil')} aria-label="Abrir perfil">
        <Icone nome="perfil" tamanho={34} />
        <span>{getDisplayName(usuario)}</span>
      </button>
    </header>
  )
}

function CampoInfo({ rotulo, valor }) {
  return (
    <div className="responsavel-dado">
      <small>{rotulo}</small>
      <span>{valor === null || valor === undefined || valor === '' ? 'Não informado' : valor}</span>
    </div>
  )
}

function ModalFiltro({ filtros, setFiltros, fechar, aplicar }) {
  const primeiroCampo = useRef(null)

  useEffect(() => {
    primeiroCampo.current?.focus()
    function aoTeclar(evento) {
      if (evento.key === 'Escape') fechar()
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [fechar])

  function alterarFiltro(evento) {
    setFiltros((atuais) => ({ ...atuais, [evento.target.name]: evento.target.value }))
  }

  return (
    <div className="responsavel-modal-fundo" onMouseDown={(evento) => evento.target === evento.currentTarget && fechar()}>
      <section className="responsavel-modal" role="dialog" aria-modal="true" aria-labelledby="responsavel-modal-titulo">
        <header className="responsavel-modal-topo">
          <span className="responsavel-modal-icone"><Icone nome="ajustar" tamanho={23} /></span>
          <h2 id="responsavel-modal-titulo">Filtrar Responsável</h2>
          <button type="button" onClick={fechar} aria-label="Fechar filtros"><Icone nome="fechar" tamanho={23} /></button>
        </header>
        <form className="responsavel-modal-form" onSubmit={(evento) => { evento.preventDefault(); aplicar() }}>
          <label>
            Nome do Responsável
            <input ref={primeiroCampo} name="nome" value={filtros.nome} onChange={alterarFiltro} placeholder="Ex: Tiago Veigh" />
          </label>
          <label>
            CPF
            <input name="cpf" value={filtros.cpf} onChange={alterarFiltro} placeholder="Ex: 157751452" />
          </label>
          <label>
            Telefone
            <input name="telefone" value={filtros.telefone} onChange={alterarFiltro} placeholder="Ex: 15997854565" />
          </label>
          <label>
            NIS
            <input name="nis" value={filtros.nis} onChange={alterarFiltro} placeholder="Ex: 15997854565" />
          </label>
          <footer className="responsavel-modal-acoes">
            <button type="button" className="responsavel-limpar" onClick={() => setFiltros(filtrosVazios)}>
              <Icone nome="limpar" tamanho={14} />Limpar Filtros
            </button>
            <div>
              <button type="button" className="responsavel-cancelar" onClick={fechar}>Cancelar</button>
              <button type="submit" className="responsavel-aplicar">Aplicar</button>
            </div>
          </footer>
        </form>
      </section>
    </div>
  )
}

function CartaoResponsavel({ responsavel, abrir }) {
  return (
    <button className="responsavel-cartao" type="button" onClick={() => abrir(responsavel.id)}>
      {responsavel.foto
        ? <img className="responsavel-cartao-foto" src={fotoUrl(responsavel.foto)} alt="" />
        : <span className="responsavel-cartao-iniciais">{responsavel.nome.slice(0, 1)}</span>}
      <span className="responsavel-cartao-campos">
        <span><small>Nome</small><strong>{responsavel.nome}</strong></span>
        <span><small>Profissão</small><strong>{responsavel.profissao}</strong></span>
        <span><small>CPF</small><strong>{responsavel.cpf}</strong></span>
        <span><small>NIS</small><strong>{responsavel.nis}</strong></span>
        <span><small>Telefone</small><strong>{responsavel.telefone}</strong></span>
      </span>
    </button>
  )
}

function DetalhesResponsavel({ responsavel }) {
  return (
    <div className="responsavel-detalhes">
      <section className="responsavel-painel">
        <header className="responsavel-painel-titulo">
          <h2>PAINEL DO RESPONSÁVEL</h2>
        </header>
        <div className="responsavel-painel-perfil">
          <div className="responsavel-avatar-grande">
            {responsavel.foto ? <img src={fotoUrl(responsavel.foto)} alt="" /> : responsavel.nome.slice(0, 1)}
          </div>
          <div className="responsavel-nome">
            <h3>{responsavel.nome}</h3>
            <strong>NIS: {responsavel.nis}</strong>
          </div>
          <p>Data de cadastro: {dataBr(responsavel.cadastro)}</p>
        </div>
      </section>

      <section className="responsavel-painel painel-dependentes">
        <header className="responsavel-painel-titulo"><h2>DEPENDENTE(S)</h2></header>
        <div className="responsavel-lista-dependentes">
          {responsavel.alunos.length
            ? responsavel.alunos.map((aluno) => (
              <article className="responsavel-dependente" key={aluno.id}>
                <span className="responsavel-dependente-avatar">{aluno.foto ? <img src={fotoUrl(aluno.foto)} alt="" /> : aluno.nome.slice(0, 1)}</span>
                <span><strong>{aluno.nome}</strong><small>Parentesco: {aluno.parentesco}</small></span>
              </article>
            ))
            : <p className="responsavel-sem-dados">Nenhum aluno vinculado.</p>}
        </div>
      </section>

      <section className="responsavel-painel painel-informacoes">
        <header className="responsavel-painel-titulo"><h2>INFORMAÇÕES GERAIS</h2></header>
        <div className="responsavel-blocos">
          <section className="responsavel-bloco-info">
            <h3>ENDEREÇO</h3>
            <CampoInfo rotulo="Bairro" valor={responsavel.endereco?.bairro} />
            <CampoInfo rotulo="Rua" valor={responsavel.endereco?.rua} />
            <CampoInfo rotulo="Numero" valor={responsavel.endereco?.numero} />
            <CampoInfo rotulo="Referencia" valor={responsavel.endereco?.referencia} />
            <CampoInfo rotulo="Cidade/Estado" valor={responsavel.endereco?.cidade} />
            <CampoInfo rotulo="Endereço Comercial" valor={responsavel.endereco?.comercial} />
          </section>

          <section className="responsavel-bloco-info">
            <h3>DADOS DO RESPONSÁVEL</h3>
            <CampoInfo rotulo="CPF" valor={responsavel.cpf} />
            <CampoInfo rotulo="RG" valor={responsavel.dados.rg} />
            <CampoInfo rotulo="Telefone Principal" valor={responsavel.telefone} />
            <CampoInfo rotulo="Data de Nascimento" valor={dataBr(responsavel.dados.nascimento)} />
            <CampoInfo rotulo="Profissão" valor={responsavel.profissao} />
            <CampoInfo rotulo="Grau de escolaridade" valor={responsavel.dados.escolaridade} />
            <CampoInfo rotulo="NIS" valor={responsavel.nis} />
          </section>

          <section className="responsavel-bloco-info">
            <h3>RENDA</h3>
            {responsavel.renda
              ? <>
                <CampoInfo rotulo="Salário" valor={responsavel.renda.salario} />
                <CampoInfo rotulo="Renda Total" valor={responsavel.renda.total} />
                <CampoInfo rotulo="Renda Percapta" valor={responsavel.renda.percapta} />
                <CampoInfo rotulo="Recebe Beneficio do Governo?" valor={responsavel.renda.beneficio} />
                <CampoInfo rotulo="Moradia e Despesas" valor={responsavel.renda.moradia} />
                <div className="responsavel-despesas">
                  {responsavel.despesas.map(([nome, valor]) => <p key={nome}><span>{nome}:</span><span>{valor}</span></p>)}
                </div>
              </>
              : <p className="responsavel-sem-dados">Não informado.</p>}
          </section>
        </div>
      </section>
    </div>
  )
}

function FormularioResponsavel({ aoNavegar }) {
  const [fotoFormulario, setFotoFormulario] = useState(fotoResponsavel)
  const [pesquisaAluno, setPesquisaAluno] = useState('')
  const [alunosSelecionados, setAlunosSelecionados] = useState([])

  const alunosDisponiveis = alunosReferencia.filter(
    (aluno) => !alunosSelecionados.some((selecionado) => selecionado.id === aluno.id),
  )

  const alunosFiltrados = alunosDisponiveis.filter((aluno) =>
    aluno.nome.toLowerCase().includes(pesquisaAluno.trim().toLowerCase()),
  )

  function adicionarAluno(aluno) {
    setAlunosSelecionados((ativos) => {
      if (ativos.some((item) => item.id === aluno.id)) return ativos
      return [...ativos, aluno]
    })
  }

  function removerAluno(id) {
    setAlunosSelecionados((ativos) => ativos.filter((aluno) => aluno.id !== id))
  }

  function onFotoChange(evento) {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return
    const url = URL.createObjectURL(arquivo)
    setFotoFormulario(url)
  }

  return (
    <main className="alunos-pagina responsaveis-pagina">
      <NavegacaoResponsaveis rota="responsaveis" aoNavegar={aoNavegar} />
      <section className="area-principal">
        <Cabecalho aoNavegar={aoNavegar} />
        <div className="responsaveis-conteudo">
          <div className="responsavel-cadastro">
            <h2 className="responsavel-titulo-cadastro">Adicionar novo Responsável</h2>

            <div className="responsavel-formulario">
              <div className="responsavel-foto-coluna">
                <div className="responsavel-foto-area">
                  <img src={fotoFormulario} alt="Foto do responsável" />
                </div>
                <label className="responsavel-enviar-foto">
                  <input type="file" accept="image/*" onChange={onFotoChange} />
                  <span>Enviar Foto</span>
                </label>
              </div>

              <div className="responsavel-campos">
                <label className="responsavel-campo">
                  <span>Nome</span>
                  <input type="text" defaultValue="Mamãe Kuromi" />
                </label>
                <label className="responsavel-campo">
                  <span>NIS</span>
                  <input type="text" defaultValue="2154642560" />
                </label>
                <label className="responsavel-campo">
                  <span>Data de Nascimento</span>
                  <input type="text" defaultValue="01/05/2007" />
                </label>
                <label className="responsavel-campo">
                  <span>CPF</span>
                  <input type="text" defaultValue="15485120-9" />
                </label>
                <label className="responsavel-campo">
                  <span>Grau de escolaridade</span>
                  <input type="text" defaultValue="3º Ensino Médio - Completo" />
                </label>
                <label className="responsavel-campo">
                  <span>RG</span>
                  <input type="text" defaultValue="15485120" />
                </label>
                <label className="responsavel-campo">
                  <span>Telefone</span>
                  <input type="text" defaultValue="(15) 99723-0439" />
                </label>
                <label className="responsavel-campo">
                  <span>Profissão</span>
                  <input type="text" defaultValue="Médica" />
                </label>
                <label className="responsavel-campo responsavel-campo-largo">
                  <span>Endereço Comercial</span>
                  <input type="text" defaultValue="Rua Arnaldo de Campos, Bairro Ayrton cena, nº 10" />
                </label>
                <label className="responsavel-campo">
                  <span>Salário</span>
                  <input type="text" defaultValue="R$ 2000" />
                </label>
              </div>
            </div>

            <div className="responsavel-vinculo">
              <h3>Responsável de:</h3>
              <div className="responsavel-pesquisa">
                <Icone nome="busca" tamanho={18} />
                <input
                  type="search"
                  value={pesquisaAluno}
                  onChange={(evento) => setPesquisaAluno(evento.target.value)}
                  placeholder="Pesquise aqui o nome do aluno"
                  aria-label="Pesquisar aluno"
                />
              </div>

              <div className="responsavel-alunos-disponiveis">
                {alunosFiltrados.map((aluno) => (
                  <button key={aluno.id} type="button" className="responsavel-aluno-card" onClick={() => adicionarAluno(aluno)}>
                    <img src={aluno.foto} alt="" />
                    <span>{aluno.nome}</span>
                  </button>
                ))}
              </div>

              {alunosSelecionados.map((aluno) => (
                <div key={aluno.id} className="responsavel-selecionado-card">
                  <div className="responsavel-selecionado-info">
                    <img src={aluno.foto} alt="" />
                    <div>
                      <strong>{aluno.nome}</strong>
                      <p>Data de Nascimento: {aluno.nascimento}</p>
                      <p>Telefone Principal: {aluno.telefone}</p>
                    </div>
                  </div>
                  <button type="button" className="responsavel-remover" onClick={() => removerAluno(aluno.id)} aria-label={`Remover ${aluno.nome}`}>
                    <Icone nome="fechar" tamanho={28} />
                  </button>
                </div>
              ))}
            </div>

            <div className="responsavel-acoes">
              <button type="button" className="responsavel-cancelar" onClick={() => aoNavegar('responsaveis')}>Cancelar</button>
              <button type="button" className="responsavel-confirmar">Confirmar</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function Responsaveis({ rota, aoNavegar }) {
  const [busca, setBusca] = useState('')
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false)
  const [filtros, setFiltros] = useState(filtrosVazios)
  const [resultado, setResultado] = useState(null)
  const [erro, setErro] = useState('')
  const detalhe = rota.startsWith('responsaveis/') && rota !== 'responsaveis/novo'
  useEffect(() => {
    if (rota === 'responsaveis/novo') return
    const controller = new AbortController()
    buscarResponsaveis(detalhe ? `/${rota.split('/')[1]}` : '', controller.signal)
      .then((dados) => { if (!controller.signal.aborted) setResultado({ rota, dados }) })
      .catch((falha) => { if (!controller.signal.aborted) setErro(falha.message) })
    return () => controller.abort()
  }, [rota, detalhe])
  const carregando = !erro && resultado?.rota !== rota
  const responsaveis = resultado?.rota === rota ? (resultado.dados.responsaveis || []) : []
  const responsavelSelecionado = rota.startsWith('responsaveis/') && rota !== 'responsaveis/novo'
    ? (resultado?.rota === rota ? resultado.dados.responsavel : null)
    : null
  const origemBusca = useRef(null)

  const fecharFiltro = useCallback(() => {
    setModalFiltroAberto(false)
    origemBusca.current?.focus()
  }, [])

  if (rota === 'responsaveis/novo') {
    return <FormularioResponsavel aoNavegar={aoNavegar} />
  }

  function abrirResponsavel(id) {
    aoNavegar(`responsaveis/${id}`)
  }

  function abrirFiltro() {
    setModalFiltroAberto(true)
  }

  function aplicarFiltros() {
    setModalFiltroAberto(false)
  }

  function pesquisar(evento) {
    evento.preventDefault()
  }

  return (
    <main className="alunos-pagina responsaveis-pagina">
      <NavegacaoResponsaveis rota={rota} aoNavegar={aoNavegar} />
      <section className="area-principal">
        <Cabecalho aoNavegar={aoNavegar} />
        {detalhe ? (
          <div className="responsaveis-conteudo">
            <button className="responsavel-voltar" type="button" onClick={() => aoNavegar('responsaveis')}>
              <Icone nome="voltar" tamanho={19} /> Voltar para Responsáveis
            </button>
            {erro && <p role="alert">{erro}</p>}
            {carregando && <p role="status">Carregando responsável...</p>}
            {responsavelSelecionado && <DetalhesResponsavel responsavel={responsavelSelecionado} />}
          </div>
        ) : (
          <div className="responsaveis-conteudo">
            <form className="barra-pesquisa responsaveis-busca" onSubmit={pesquisar}>
              <input
                ref={origemBusca}
                type="search"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder="Pesquisar"
                aria-label="Pesquisar responsável"
              />
              <button type="submit" aria-label="Pesquisar"><Icone nome="busca" tamanho={26} /></button>
              <button type="button" onClick={abrirFiltro} aria-label="Abrir filtros de responsáveis"><Icone nome="filtro" tamanho={26} /></button>
            </form>
            <button className="adicionar-aluno responsaveis-adicionar" type="button" onClick={() => aoNavegar('responsaveis/novo')}>
              Adicionar Responsável <strong>+</strong>
            </button>
            <section className="responsaveis-lista" aria-label="Lista de responsáveis">
              {erro && <p role="alert">{erro}</p>}
              {carregando && <p role="status">Carregando responsáveis...</p>}
              {!erro && !carregando && !responsaveis.length && <p>Nenhum responsável cadastrado.</p>}
              {responsaveis.map((responsavel) => (
                <CartaoResponsavel key={responsavel.id} responsavel={responsavel} abrir={abrirResponsavel} />
              ))}
            </section>
          </div>
        )}
      </section>
      {modalFiltroAberto && (
        <ModalFiltro filtros={filtros} setFiltros={setFiltros} fechar={fecharFiltro} aplicar={aplicarFiltros} />
      )}
    </main>
  )
}

export default Responsaveis
