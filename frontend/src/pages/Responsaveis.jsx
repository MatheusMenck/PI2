import FotoPessoa from '../components/FotoPessoa'
import AtalhoAdministrador from '../components/AtalhoAdministrador'
import { contemTexto, contemNumero, correspondeBusca } from '../utils/filtrosCadastro'
import { useCallback, useEffect, useRef, useState } from 'react'
import { getDisplayName, getStoredAuthUser } from '../authUser'
import './Alunos.css'
import './Responsaveis.css'
import logo from '../assets/logo.png'
import { buscarResponsaveis } from '../utils/responsaveisApi'
import { dataBr } from '../utils/alunosApi'
import { buscarAlunos } from '../utils/alunosApi'
import { consultarCpf, salvarResponsavel } from '../utils/responsaveisApi'
import { cpfValido, normalizarCpf } from '../utils/cpf'

const filtrosVazios = { nome: '', cpf: '', telefone: '', nis: '' }

function Icone({ nome, tamanho = 26 }) {
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
    <aside className="menu menu-lateral" aria-label="Navegação principal">
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
      <AtalhoAdministrador aoNavegar={aoNavegar} />
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
      <FotoPessoa
        tipo="responsaveis"
        pessoa={responsavel}
        className="responsavel-cartao-foto"
        alternativa={<span className="responsavel-cartao-iniciais">{responsavel.nome.slice(0, 1)}</span>}
      />
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
            <FotoPessoa tipo="responsaveis" pessoa={responsavel} alternativa={responsavel.nome.slice(0, 1)} />
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
                <span className="responsavel-dependente-avatar"><FotoPessoa tipo="alunos" pessoa={aluno} alternativa={aluno.nome.slice(0, 1)} /></span>
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

const camposResponsavel = [
  ['nome', 'Nome *', 'text'], ['nis', 'NIS', 'text'], ['data_nascimento', 'Data de Nascimento', 'date'],
  ['cpf', 'CPF *', 'text'], ['escolaridade', 'Grau de escolaridade', 'text'], ['rg', 'RG', 'text'],
  ['telefone', 'Telefone', 'tel'], ['profissao', 'Profissão', 'text'],
  ['endereco_comercial', 'Endereço Comercial', 'text'], ['salario', 'Salário', 'number'],
]
const formularioVazio = Object.fromEntries(camposResponsavel.map(([chave]) => [chave, '']))

function FormularioResponsavel({ aoNavegar }) {
  const [dados, setDados] = useState(formularioVazio)
  const [foto, setFoto] = useState(null)
  const [previa, setPrevia] = useState(null)
  const urlPrevia = useRef(null)
  const consultaAtual = useRef({ id: 0 })
  const envioAtivo = useRef(false)
  const [existente, setExistente] = useState(null)
  const [consultando, setConsultando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [alunos, setAlunos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroAlunos, setErroAlunos] = useState('')
  const [pesquisaAluno, setPesquisaAluno] = useState('')
  const [alunosSelecionados, setAlunosSelecionados] = useState([])

  useEffect(() => {
    const controller = new AbortController()
    const estadoConsulta = consultaAtual.current
    buscarAlunos('', controller.signal).then((resposta) => { if (!controller.signal.aborted) setAlunos(resposta.alunos) })
      .catch((falha) => { if (!controller.signal.aborted) setErroAlunos(falha.message) })
      .finally(() => { if (!controller.signal.aborted) setCarregando(false) })
    return () => { controller.abort(); estadoConsulta.id++; if (urlPrevia.current) URL.revokeObjectURL(urlPrevia.current) }
  }, [])

  async function buscarCpf() {
    if (!cpfValido(dados.cpf)) { setErro('Informe um CPF válido.'); return }
    const consulta = ++consultaAtual.current.id
    setConsultando(true)
    setErro('')
    try {
      const pessoa = await consultarCpf(normalizarCpf(dados.cpf))
      if (consulta !== consultaAtual.current.id) return
      setExistente(pessoa)
      if (pessoa) {
        setDados(Object.fromEntries(camposResponsavel.map(([chave]) => [chave, chave === 'data_nascimento' ? pessoa[chave]?.slice(0, 10) || '' : pessoa[chave] ?? ''])))
        setFoto(null)
        if (urlPrevia.current) URL.revokeObjectURL(urlPrevia.current)
        urlPrevia.current = null
        setPrevia(null)
      }
    } catch (falha) { if (consulta === consultaAtual.current.id) setErro(falha.message) }
    finally { if (consulta === consultaAtual.current.id) setConsultando(false) }
  }

  function alterarCampo(evento) {
    const { name, value } = evento.target
    if (name === 'cpf') {
      consultaAtual.current.id++
      setConsultando(false)
      if (existente) { setDados({ ...formularioVazio, cpf: value }); setPrevia(null) }
      else setDados((atual) => ({ ...atual, cpf: value }))
      setExistente(null)
    } else setDados((atual) => ({ ...atual, [name]: value }))
    setErro('')
  }

  function onFotoChange(evento) {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type) || arquivo.size > 5 * 1024 * 1024) {
      setErro('Envie uma foto JPEG, PNG ou WebP de até 5 MB.'); evento.target.value = ''; return
    }
    if (urlPrevia.current) URL.revokeObjectURL(urlPrevia.current)
    urlPrevia.current = URL.createObjectURL(arquivo)
    setPrevia(urlPrevia.current)
    setFoto(arquivo)
    setErro('')
  }

  function alterarVinculo(id, campo, valor) {
    setAlunosSelecionados((atuais) => atuais.map((aluno) => aluno.id === id ? { ...aluno, [campo]: valor } : aluno))
  }

  async function confirmar() {
    if (envioAtivo.current || consultando) return
    setErro('')
    if (!dados.nome.trim() || !cpfValido(dados.cpf)) { setErro('Informe nome e CPF válido.'); return }
    if (!alunosSelecionados.length || alunosSelecionados.some((aluno) => !aluno.parentesco)) {
      setErro('Selecione ao menos um aluno e informe se o responsável é mãe ou pai de cada um.'); return
    }
    envioAtivo.current = true
    setSalvando(true)
    try {
      const formulario = new FormData()
      Object.entries(dados).forEach(([chave, valor]) => formulario.append(chave, valor))
      if (foto && !existente) formulario.append('foto', foto)
      alunosSelecionados.forEach((aluno, indice) => {
        for (const chave of ['id', 'parentesco', 'e_responsavel_legal', 'autorizado_retirar']) {
          formulario.append(`alunos[${indice}][${chave}]`, typeof aluno[chave] === 'boolean' ? Number(aluno[chave]) : aluno[chave])
        }
      })
      const pessoa = await salvarResponsavel(formulario)
      aoNavegar(`responsaveis/${pessoa.id}`)
    } catch (falha) { setErro(falha.message) }
    finally { envioAtivo.current = false; setSalvando(false) }
  }

  const alunosFiltrados = alunos.filter((aluno) => !alunosSelecionados.some((selecionado) => selecionado.id === aluno.id) && aluno.nome.toLowerCase().includes(pesquisaAluno.trim().toLowerCase()))
  return (
    <main className="alunos-pagina responsaveis-pagina">
      <NavegacaoResponsaveis rota="responsaveis" aoNavegar={aoNavegar} />
      <section className="area-principal">
        <Cabecalho aoNavegar={aoNavegar} />
        <div className="responsaveis-conteudo"><div className="responsavel-cadastro">
          <h2 className="responsavel-titulo-cadastro">Adicionar novo Responsável</h2>
          {erro && <p role="alert">{erro}</p>}
          {consultando && <p role="status">Consultando CPF...</p>}
          {existente && <p role="status">Responsável encontrado. Os dados, a foto e os vínculos existentes serão preservados. Selecione os novos alunos abaixo.</p>}
          <fieldset className="responsavel-form-sem-borda" disabled={salvando}>
          <div className="responsavel-formulario">
            <div className="responsavel-foto-coluna">
              <div className="responsavel-foto-area">
                {previa ? <img src={previa} alt="Foto do responsável" /> : (
                  <FotoPessoa tipo="responsaveis" pessoa={existente} alt="Foto do responsável" alternativa={<span>Sem foto</span>} />
                )}
              </div>
              <label className="responsavel-enviar-foto"><input type="file" accept="image/jpeg,image/png,image/webp" disabled={!!existente} onChange={onFotoChange} /><span>Enviar Foto</span></label>
            </div>
            <div className="responsavel-campos">
              {camposResponsavel.map(([chave, rotulo, tipo]) => <label key={chave} className={`responsavel-campo ${chave === 'endereco_comercial' ? 'responsavel-campo-largo' : ''}`}>
                <span>{rotulo}</span><input type={tipo} name={chave} value={dados[chave]} onChange={alterarCampo} onBlur={chave === 'cpf' ? buscarCpf : undefined} readOnly={!!existente && chave !== 'cpf'} min={tipo === 'number' ? 0 : undefined} step={tipo === 'number' ? '0.01' : undefined} />
              </label>)}
            </div>
          </div>
          <div className="responsavel-vinculo">
            <h3>Responsável de:</h3>
            <div className="responsavel-pesquisa"><Icone nome="busca" tamanho={18} /><input type="search" value={pesquisaAluno} onChange={(e) => setPesquisaAluno(e.target.value)} placeholder="Pesquise aqui o nome do aluno" aria-label="Pesquisar aluno" /></div>
            {carregando && <p role="status">Carregando alunos...</p>}
            {erroAlunos && <p role="alert">{erroAlunos}</p>}
            {!carregando && !erroAlunos && !alunosFiltrados.length && <p>Nenhum aluno disponível para esta pesquisa.</p>}
            <div className="responsavel-alunos-disponiveis">{alunosFiltrados.map((aluno) => <button key={aluno.id} type="button" className="responsavel-aluno-card" onClick={() => setAlunosSelecionados((atuais) => atuais.some((item) => item.id === aluno.id) ? atuais : [...atuais, { ...aluno, parentesco: '', e_responsavel_legal: false, autorizado_retirar: false }])}>
              <FotoPessoa tipo="alunos" pessoa={aluno} /><span>{aluno.nome}</span>
            </button>)}</div>
            {alunosSelecionados.map((aluno) => <div key={aluno.id} className="responsavel-vinculo-item">
              <div className="responsavel-selecionado-card"><div className="responsavel-selecionado-info">
                <FotoPessoa tipo="alunos" pessoa={aluno} /><div><strong>{aluno.nome}</strong><p>Data de Nascimento: {dataBr(aluno.nascimento)}</p><p>Telefone Principal: {aluno.telefone || 'Não informado'}</p></div>
              </div><button type="button" className="responsavel-remover" onClick={() => setAlunosSelecionados((atuais) => atuais.filter((item) => item.id !== aluno.id))} aria-label={`Remover ${aluno.nome}`}><Icone nome="fechar" tamanho={28} /></button></div>
              <div className="responsavel-vinculo-opcoes">
                <label>Parentesco * <select aria-label={`Parentesco com ${aluno.nome}`} value={aluno.parentesco} onChange={(e) => alterarVinculo(aluno.id, 'parentesco', e.target.value)}><option value="">Selecione</option><option value="Mãe">Mãe</option><option value="Pai">Pai</option></select></label>
                <label><input type="checkbox" checked={aluno.e_responsavel_legal} onChange={(e) => alterarVinculo(aluno.id, 'e_responsavel_legal', e.target.checked)} /> Responsável legal</label>
                <label><input type="checkbox" checked={aluno.autorizado_retirar} onChange={(e) => alterarVinculo(aluno.id, 'autorizado_retirar', e.target.checked)} /> Autorizado a retirar</label>
              </div>
            </div>)}
          </div>
          <div className="responsavel-acoes"><button type="button" className="responsavel-cancelar" onClick={() => aoNavegar('responsaveis')}>Cancelar</button><button type="button" className="responsavel-confirmar" disabled={consultando || carregando || !!erroAlunos} onClick={confirmar}>{salvando ? 'Salvando...' : 'Confirmar'}</button></div>
          </fieldset>
        </div></div>
      </section>
    </main>
  )
}

function Responsaveis({ rota, aoNavegar }) {
  const [busca, setBusca] = useState('')
  const [modalFiltroAberto, setModalFiltroAberto] = useState(false)
  const [filtros, setFiltros] = useState(filtrosVazios)
  const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosVazios)
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
  const { nome, cpf, telefone, nis } = filtrosAplicados
  const responsaveisVisiveis = responsaveis.filter((responsavel) =>
    correspondeBusca(busca, [responsavel.nome, responsavel.profissao], [responsavel.cpf, responsavel.telefone, responsavel.nis])
    && contemTexto(responsavel.nome, nome)
    && contemNumero(responsavel.cpf, cpf)
    && contemNumero(responsavel.telefone, telefone)
    && contemNumero(responsavel.nis, nis)
  )
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
    setFiltros(filtrosAplicados)
    setModalFiltroAberto(true)
  }

  function aplicarFiltros() {
    setFiltrosAplicados(filtros)
    fecharFiltro()
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
              {!erro && !carregando && !responsaveisVisiveis.length && (
                <p>{responsaveis.length ? 'Nenhum responsável encontrado.' : 'Nenhum responsável cadastrado.'}</p>
              )}
              {responsaveisVisiveis.map((responsavel) => (
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
