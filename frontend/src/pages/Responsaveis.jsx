import { useCallback, useEffect, useRef, useState } from 'react'
import './Alunos.css'
import './Responsaveis.css'
import logo from '../assets/logo.png'
import fotoResponsavel from '../assets/responsavel-referencia.png'
import fotoResponsavelCartao from '../assets/responsavel-cartao-referencia.png'
import fotoAluno from '../assets/aluno-vinculado-referencia.png'

const responsaveis = [
  {
    id: '1',
    nome: 'Mamãe Kuromi',
    profissao: 'Médica',
    cpf: '341431123-9',
    nis: '1587424',
    telefone: '(15) 99785-4515',
    cadastro: '17/05/2026',
    foto: fotoResponsavel,
    endereco: {
      bairro: 'Jardim Aeroporto',
      rua: 'Arnaldo de Campos',
      numero: '358',
      referencia: 'N/A',
      cidade: 'Tatuí, SP',
      comercial: 'Rua 11 de Agosto, Bairro 13 de Maio, n 840, Sorocaba, SP',
    },
    dados: {
      rg: '154.125.412-54',
      nascimento: '01/02/2007',
      escolaridade: '3 Ano do Ensino Médio - Completo',
    },
    renda: {
      salario: 'R$1.580,98',
      total: 'R$10.580,98',
      percapta: 'R$700,00',
      beneficio: 'Sim, Bolsa Família R$700',
      moradia: 'Casa',
    },
    despesas: [
      ['Água', 'R$100'],
      ['Luz', 'R$100'],
      ['Gás', 'R$100'],
      ['Alimentação', 'R$100'],
    ],
    alunos: [{ nome: 'Cinnamoroll dos Santos Vieira', parentesco: 'Filho' }],
  },
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

function Cabecalho() {
  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem('auth_user')) || null
    } catch {
      return null
    }
  })()

  return (
    <header className="cabecalho">
        <h1>Recanto Betel</h1>
        <div className="botao-perfil">
          <Icone nome="perfil" tamanho={34} />
          <span>{usuario?.name || 'Talda Fernanda'}</span>
        </div>
    </header>
  )
}

function CampoInfo({ rotulo, valor }) {
  return (
    <div className="responsavel-dado">
      <small>{rotulo}</small>
      <span>{valor || 'Não informado'}</span>
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
        ? <img className="responsavel-cartao-foto" src={fotoResponsavelCartao} alt="" />
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
            {responsavel.foto ? <img src={responsavel.foto} alt="" /> : responsavel.nome.slice(0, 1)}
          </div>
          <div className="responsavel-nome">
            <h3>{responsavel.nome}</h3>
            <strong>NIS: {responsavel.nis}</strong>
          </div>
          <p>Data de cadastro: {responsavel.cadastro}</p>
        </div>
      </section>

      <section className="responsavel-painel painel-dependentes">
        <header className="responsavel-painel-titulo"><h2>DEPENDENTE(S)</h2></header>
        <div className="responsavel-lista-dependentes">
          {responsavel.alunos.length
            ? responsavel.alunos.map((aluno) => (
              <article className="responsavel-dependente" key={`${aluno.nome}-${aluno.parentesco}`}>
                <img src={fotoAluno} alt="" />
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
            <CampoInfo rotulo="Data de Nascimento" valor={responsavel.dados.nascimento} />
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

function Responsaveis({ rota, aoNavegar }) {
  const [busca, setBusca] = useState('')
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false)
  const [filtros, setFiltros] = useState(filtrosVazios)
  const responsavelSelecionado = rota.startsWith('responsaveis/')
    ? responsaveis.find((item) => item.id === rota.split('/')[1])
    : null
  const origemBusca = useRef(null)

  const fecharFiltro = useCallback(() => {
    setModalFiltroAberto(false)
    origemBusca.current?.focus()
  }, [])

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
        <Cabecalho />
        {responsavelSelecionado ? (
          <div className="responsaveis-conteudo">
            <button className="responsavel-voltar" type="button" onClick={() => aoNavegar('responsaveis')}>
              <Icone nome="voltar" tamanho={19} /> Voltar para Responsáveis
            </button>
            <DetalhesResponsavel responsavel={responsavelSelecionado} />
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
            <button className="adicionar-aluno responsaveis-adicionar" type="button">
              Adicionar Responsável <strong>+</strong>
            </button>
            <section className="responsaveis-lista" aria-label="Lista de responsáveis">
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
