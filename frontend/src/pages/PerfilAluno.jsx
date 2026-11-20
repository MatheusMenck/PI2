import FotoPessoa from '../components/FotoPessoa'
import AtalhoAdministrador from '../components/AtalhoAdministrador'
import { useEffect, useMemo, useState } from 'react'
import { getDisplayName, getStoredAuthUser } from '../authUser'
import './PerfilAluno.css'
import logo from '../assets/logo.png'
import { buscarAlunos, cadastrarRelato, dataBr } from '../utils/alunosApi'

const menu = [
  { id: 'inicio', icone: 'inicio', texto: 'Início' },
  { id: 'alunos', icone: 'alunos', texto: 'Alunos' },
  { id: 'responsaveis', icone: 'responsaveis', texto: 'Responsáveis' },
]

const abas = [
  { id: 1, icone: 'pessoal', texto: 'Dados Pessoais' },
  { id: 2, icone: 'familia', texto: 'Família e Autorizações' },
  { id: 3, icone: 'saude', texto: 'Saúde' },
  { id: 4, icone: 'relatos', texto: 'Relatos' },
]

const camposPessoais = [
  ['CPF', 'cpf'],
  ['RG', 'rg'],
  ['Telefone Principal', 'telefone'],
  ['Data de Nascimento', 'nascimento'],
  ['Religião', 'religiao'],
]

const camposEndereco = [
  ['Rua', 'rua'],
  ['Número', 'numero'],
  ['Bairro', 'bairro'],
  ['Referência', 'referencia'],
  ['Cidade / Estado', 'cidade'],
]

const camposEscolaridade = [
  ['Escola', 'escola'],
  ['Série', 'serie'],
  ['Período', 'periodo'],
]

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
    pessoal: <><circle cx="12" cy="8" r="3.5" /><path d="M5 21c.7-4.1 3-6.2 7-6.2s6.3 2.1 7 6.2" /></>,
    familia: <><circle cx="9" cy="8" r="3.5" /><circle cx="17" cy="9" r="2.5" /><path d="M2.5 20c.7-3.8 2.9-5.7 6.5-5.7s5.8 1.9 6.5 5.7M15 15c3.5-.2 5.5 1.5 6 5" /></>,
    saude: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M9 5V3h6v2M12 9v8M8 13h8" /></>,
    relatos: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 2v4M15 2v4M8 10h8M8 14h8M8 18h4" /></>,
    editar: <><path d="m4 16.5-.8 4.3 4.3-.8L20 7.5 16.5 4 4 16.5Z" /><path d="m14.5 6 3.5 3.5" /></>,
    adicionar: <><path d="M12 5v14M5 12h14" /></>,
  }

  return <svg {...props}>{desenhos[nome]}</svg>
}

function Bloco({ titulo, children, classe = '' }) {
  return (
    <section className={`bloco-perfil ${classe}`}>
      <h3><i aria-hidden="true" />{titulo}</h3>
      {children}
    </section>
  )
}

function Dado({ titulo, valor }) {
  return <div className="dado-perfil"><small>{titulo}</small><strong>{valor == null || valor === '' ? 'Não informado' : valor}</strong></div>
}

function simNao(valor) {
  return valor === true || valor === 1 || valor === '1' ? 'Sim' : 'Não'
}

function PerfilAluno({ rota, aoNavegar }) {
  const id = rota.split('/')[1]
  const usuario = getStoredAuthUser()
  const abrindoRelato = rota.split('/')[2] === 'relatos'
  const [etapaAtual, setEtapaAtual] = useState(abrindoRelato ? 4 : 1)
  const [formRelatoAberto, setFormRelatoAberto] = useState(abrindoRelato)
  const [salvandoRelato, setSalvandoRelato] = useState(false)
  const [erroRelato, setErroRelato] = useState('')
  const [dadosAluno, setDadosAluno] = useState(null)
  const [erro, setErro] = useState('')
  const [editando, setEditando] = useState(false)
  const iniciais = useMemo(
    () => dadosAluno?.nome?.trim().split(/\s+/).slice(0, 2).map((nome) => nome[0]).join('') || '',
    [dadosAluno?.nome],
  )

  useEffect(() => {
    const controller = new AbortController()
    buscarAlunos(`/${id}`, controller.signal)
      .then((dados) => {
        if (!controller.signal.aborted) setDadosAluno(dados.aluno)
      })
      .catch((erro) => {
        if (!controller.signal.aborted) setErro(erro.message)
      })
    return () => controller.abort()
  }, [id])

  function atualizarAluno(evento) {
    setDadosAluno((atual) => ({ ...atual, [evento.target.name]: evento.target.value }))
  }

  function renderizarCampos(campos) {
    return campos.map(([titulo, nome]) => (
      editando
        ? <label key={nome}>{titulo}<input name={nome} value={dadosAluno[nome] ?? ''} onChange={atualizarAluno} /></label>
        : <Dado key={nome} titulo={titulo} valor={nome === 'nascimento' ? dataBr(dadosAluno[nome]) : dadosAluno[nome]} />
    ))
  }

  function dadosPessoais() {
    return (
      <div className="grade-perfil dados-pessoais">
        <Bloco titulo="Dados Pessoais">{renderizarCampos(camposPessoais)}</Bloco>
        <Bloco titulo="Endereço">{renderizarCampos(camposEndereco)}</Bloco>
        <Bloco titulo="Escolaridade">{renderizarCampos(camposEscolaridade)}</Bloco>
      </div>
    )
  }

  function familia() {
    const responsaveis = dadosAluno.responsaveis ?? []
    const autorizados = dadosAluno.pessoas_autorizadas ?? []
    const membros = dadosAluno.familia ?? []
    return (
      <div className="grade-perfil familia-perfil">
        <Bloco titulo="Responsável(is)">
          {!responsaveis.length && <p>Nenhum responsável cadastrado.</p>}
          {responsaveis.map((pessoa) => (
            <div className="pessoa" key={pessoa.id}>◉ <span><b>{pessoa.nome}</b><small>Parentesco: {pessoa.parentesco || 'Não informado'}</small>{pessoa.telefone && <small>☎ {pessoa.telefone}</small>}</span></div>
          ))}
        </Bloco>
        <Bloco titulo="Autorizações">
          <small>Autorização para Sair Sozinho:</small>
          <b>{dadosAluno.autorizado_sair_sozinho === false ? 'Não, Saída somente com:' : simNao(dadosAluno.autorizado_sair_sozinho)}</b>
          {dadosAluno.autorizado_sair_sozinho === false && <>
            {!autorizados.length && <p>Nenhuma pessoa autorizada cadastrada.</p>}
            {autorizados.map((pessoa) => (
              <div className="pessoa" key={pessoa.id_pessoa_autorizada}><span><b>{pessoa.nome}</b><small>☎ {pessoa.telefone || 'Não informado'}</small></span><em>{pessoa.parentesco}</em></div>
            ))}
          </>}
          <small>Autorização Odontológica:</small>
          <b>{simNao(dadosAluno.saude?.autoriza_atendimento_odontologico)}</b>
        </Bloco>
        <Bloco titulo="Composição Familiar">
          {!membros.length && <p>Nenhum membro da família cadastrado.</p>}
          {membros.map((pessoa) => (
            <div className="familia-item" key={pessoa.id_membro_familia}><b>{pessoa.nome}</b><small>Nasc: {dataBr(pessoa.data_nascimento)}</small><em>{pessoa.parentesco}</em></div>
          ))}
        </Bloco>
      </div>
    )
  }

  function saude() {
    const saude = dadosAluno.saude ?? {}
    const doencas = dadosAluno.doencas ?? []
    const condicoes = [
      ['Doenças Pré-Existentes', doencas.length ? true : null],
      ['Febre Reumática', 'Febre Reumática'],
      ['Cardíacos', 'Problemas Cardíacos'],
      ['Renais', 'Problemas Renais'],
      ['Gástricos', 'Problemas Gástricos'],
      ['Respiratórios', 'Problemas Respiratórios'],
      ['Articulares', 'Problemas Articulares ou Reumatismo'],
      ['Diabetes', 'Diabetes'],
      ['Hipertensão Arterial Sistêmica', 'Hipertensão Arterial'],
    ]
    const historico = [
      ['Já foi operado?', saude.ja_foi_operado],
      ['Problema com anestesia?', saude.problema_anestesia],
      ['Problema com cicatrização?', saude.problema_cicatrizacao],
      ['Problema com hemorragia?', saude.problema_hemorragia],
    ]
    const linha = (titulo, valor) => (
      <div className="linha-saude" key={titulo}>
        {titulo}<b className={simNao(valor) === 'Sim' ? 'sim' : 'nao'}>{simNao(valor)}</b>
      </div>
    )

    return (
      <div className="grade-saude">
        <Bloco titulo="Doenças e Alergias">
          <small>Alergias Catalogadas</small>
          <p>{saude.descricao_alergia
            ? <mark>{saude.descricao_alergia}</mark>
            : saude.possui_alergia === false ? 'Nenhuma alergia informada' : 'Não informado'}</p>
          {condicoes.map(([titulo, nome]) => linha(titulo,
            typeof nome === 'string' ? (doencas.some((doenca) => doenca.nome === nome) ? true : null) : nome,
          ))}
          {doencas.length > 0 && <p>{doencas.map((doenca) => <mark key={doenca.id_doenca}>{doenca.nome}</mark>)}</p>}
          {doencas.map((doenca) => (
            <div key={doenca.id_doenca}>
              {doenca.pivot?.status && <small>{doenca.nome}: {doenca.pivot.status}</small>}
              {doenca.pivot?.observacao && <div className="caixa-texto">{doenca.pivot.observacao}</div>}
              {doenca.pivot?.medicacao_em_uso && <div className="caixa-texto">Medicação: {doenca.pivot.medicacao_em_uso}</div>}
              {doenca.pivot?.requer_cuidados_especiais != null && linha(`Cuidados especiais: ${doenca.nome}`, doenca.pivot.requer_cuidados_especiais)}
            </div>
          ))}
        </Bloco>
        <Bloco titulo="Histórico Cirúrgico">
          {historico.map(([titulo, valor]) => linha(titulo, valor))}
          {saude.descricao_cirurgias && <div className="caixa-texto">{saude.descricao_cirurgias}</div>}
        </Bloco>
        <Bloco titulo="Antecedentes Familiares">
          <div className="caixa-texto">Relatos de Antecedências<br /><small>{saude.antecedentes_familiares || 'Não informado'}</small></div>
        </Bloco>
        <Bloco titulo="Hábitos">
          <div className="caixa-texto">{saude.habitos || 'Não informado'}</div>
        </Bloco>
        <Bloco titulo="Outros Problemas">
          <div className="caixa-texto alerta">Observação<br />{saude.observacoes_saude || 'Não informado'}</div>
          {linha('Em tratamento médico', saude.em_tratamento_medico)}
          {linha('Gestante', saude.gestante)}
          {linha('Usa medicação contínua', saude.usa_medicacao_continua)}
          {saude.descricao_medicacao && <div className="caixa-texto">Medicação: {saude.descricao_medicacao}</div>}
        </Bloco>
        <Bloco titulo="Informações do Médico">
          <div className="caixa-texto"><b>{saude.medico_responsavel_nome || 'Não informado'}</b>
            {saude.medico_responsavel_telefone && <><br />☎ {saude.medico_responsavel_telefone}</>}
            <hr /><b>Queixa Principal</b><br />{saude.queixa_principal || 'Não informado'}
          </div>
        </Bloco>
      </div>
    )
  }

  async function salvarRelato(evento) {
    evento.preventDefault()
    setErroRelato('')
    const dados = Object.fromEntries(new FormData(evento.currentTarget))
    setSalvandoRelato(true)
    try {
      const { relato } = await cadastrarRelato(id, dados)
      setDadosAluno((aluno) => ({ ...aluno, relatos: [relato, ...(aluno.relatos ?? [])] }))
      setFormRelatoAberto(false)
    } catch (falha) {
      setErroRelato(falha.message)
    } finally {
      setSalvandoRelato(false)
    }
  }

  function relatos() {
    return (
      <Bloco titulo="Histórico de Relatos" classe="historico">
        {formRelatoAberto ? (
          <form onSubmit={salvarRelato}>
            <fieldset disabled={salvandoRelato}>
              <label>Título <input name="titulo" maxLength={150} required /></label>
              <label>Descrição <textarea name="descricao" required /></label>
              <button type="submit">{salvandoRelato ? 'Salvando…' : 'Salvar relato'}</button>
              <button type="button" onClick={() => { setFormRelatoAberto(false); setErroRelato('') }}>Cancelar</button>
            </fieldset>
            {erroRelato && <p role="alert">{erroRelato}</p>}
          </form>
        ) : (
          <button className="novo-relato" type="button" onClick={() => setFormRelatoAberto(true)}>
            Novo Relato <Icone nome="adicionar" tamanho={20} />
          </button>
        )}
        {!(dadosAluno.relatos ?? []).length && <p>Nenhum relato cadastrado.</p>}
        {(dadosAluno.relatos ?? []).map((relato) => (
          <article className="relato" key={relato.id_relato}>
            <header><i aria-hidden="true" /><small>{dataBr(relato.data_registro)} - {relato.titulo}</small></header>
            <p style={{ whiteSpace: 'pre-wrap' }}>{relato.descricao || 'Sem descrição'}</p>
          </article>
        ))}
      </Bloco>
    )
  }

  const conteudo = [dadosPessoais, familia, saude, relatos][etapaAtual - 1]

  return (
    <main className="perfil-aluno">
      <aside className="menu-perfil menu-lateral" aria-label="Navegação principal">
        <img src={logo} alt="Logo Recanto Betel" />
        {menu.map((item) => (
          <button
            type="button"
            className={item.id === 'alunos' ? 'selecionado' : ''}
            key={item.id}
            onClick={() => aoNavegar(item.id)}
          >
            <Icone nome={item.icone} tamanho={26} />
            <span>{item.texto}</span>
          </button>
        ))}
        <AtalhoAdministrador aoNavegar={aoNavegar} />
      </aside>

      <section className="perfil-area">
        <header className="perfil-topo">
          <h1>Recanto Betel</h1>
          <button type="button" className="perfil-topo-usuario" onClick={() => aoNavegar('perfil')} aria-label="Abrir perfil">
            <Icone nome="pessoal" tamanho={34} />
            <small>{getDisplayName(usuario)}</small>
          </button>
        </header>

        <div className="perfil-conteudo">
          {erro && <p role="alert">{erro}</p>}
          {!erro && !dadosAluno && <p role="status">Carregando aluno...</p>}
          {dadosAluno && <>
            <section className="cabecalho-aluno">
              <div className="avatar-aluno">
                <FotoPessoa tipo="alunos" pessoa={dadosAluno} alternativa={iniciais} />
              </div>
              <div className="aluno-identificacao">
                <h2>{dadosAluno.nome}</h2>
                <span className={`status-aluno ${dadosAluno.status?.toLowerCase() || ''}`}>Status: {dadosAluno.status || 'Não informado'}</span>
              </div>
              <button
                type="button"
                className="editar"
                aria-label={editando ? 'Concluir edição do aluno' : 'Editar aluno'}
                onClick={() => setEditando(!editando)}
              >
                <Icone nome={editando ? 'adicionar' : 'editar'} tamanho={27} />
              </button>
              <p>Data de cadastro {dataBr(dadosAluno.cadastro)}</p>
            </section>

            <nav className="abas-perfil" aria-label="Informações do aluno">
              {abas.map((aba) => (
                <button
                  type="button"
                  className={etapaAtual === aba.id ? 'ativa' : ''}
                  key={aba.id}
                  aria-current={etapaAtual === aba.id ? 'page' : undefined}
                  onClick={() => setEtapaAtual(aba.id)}
                >
                  <Icone nome={aba.icone} tamanho={24} />
                  {aba.texto}
                </button>
              ))}
            </nav>

            <div className="conteudo-perfil">{conteudo()}</div>
          </>}
        </div>
      </section>
    </main>
  )
}

export default PerfilAluno
