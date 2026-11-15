import { useEffect, useState } from 'react'
import './PerfilAluno.css'
import logo from '../assets/logo.png'
import { buscarAlunos, dataBr, fotoUrl } from '../utils/alunosApi'

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
  return <div className="dado-perfil"><small>{titulo}</small><strong>{valor ?? 'Não informado'}</strong></div>
}

function PerfilAluno({ rota, aoNavegar }) {
  const id = rota.split('/')[1]
  const [aba, setAba] = useState(1)
  const [aluno, setAluno] = useState(null)
  const [erro, setErro] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    buscarAlunos(`/${id}`, controller.signal).then((dados) => setAluno(dados.aluno))
      .catch((erro) => { if (erro.name !== 'AbortError') setErro(erro.message) })
    return () => controller.abort()
  }, [id])
  let usuario = null
  try { usuario = JSON.parse(localStorage.getItem('auth_user')) } catch { /* Sessão ausente. */ }
  const simNao = (valor) => valor == null ? 'Não informado' : valor === true || valor === 1 || valor === '1' ? 'Sim' : 'Não'
  const campos = (lista, dados = aluno) => lista.map(([titulo, campo]) => <Dado key={campo} titulo={titulo} valor={campo === 'nascimento' ? dataBr(dados[campo]) : dados[campo]} />)
  function conteudo() {
    if (aba === 1) return <div className="grade-perfil dados-pessoais">
      <Bloco titulo="Dados Pessoais">{campos(camposPessoais)}</Bloco>
      <Bloco titulo="Endereço">{campos(camposEndereco)}</Bloco>
      <Bloco titulo="Escolaridade">{campos(camposEscolaridade)}</Bloco>
    </div>
    if (aba === 2) return <div className="grade-perfil familia-perfil">
      <Bloco titulo="Responsável(is)">
        {!aluno.responsaveis.length && <p>Nenhum responsável cadastrado.</p>}
        {aluno.responsaveis.map((p) => <div className="pessoa" key={p.id}><span><b>{p.nome}</b><small>Parentesco: {p.parentesco || 'Não informado'}</small><small>{p.telefone || 'Telefone não informado'}</small></span></div>)}
      </Bloco>
      <Bloco titulo="Autorizações">
        <Dado titulo="Autorização para sair sozinho" valor={simNao(aluno.autorizado_sair_sozinho)} />
        {aluno.autorizado_sair_sozinho === false && <><b>Saída somente com:</b>
          {!aluno.pessoas_autorizadas.length && <p>Nenhuma pessoa autorizada cadastrada.</p>}
          {aluno.pessoas_autorizadas.map((p) => <div className="pessoa" key={p.id_pessoa_autorizada}><span><b>{p.nome}</b><small>{p.telefone}</small></span><em>{p.parentesco}</em></div>)}
        </>}
        <Dado titulo="Autorização odontológica" valor={simNao(aluno.saude?.autoriza_atendimento_odontologico)} />
      </Bloco>
      <Bloco titulo="Composição Familiar">
        {!aluno.familia.length && <p>Nenhum membro da família cadastrado.</p>}
        {aluno.familia.map((p) => <div className="familia-item" key={p.id_membro_familia}><b>{p.nome}</b><small>Nasc: {dataBr(p.data_nascimento)}</small><em>{p.parentesco}</em></div>)}
      </Bloco>
    </div>
    if (aba === 3) {
      const saude = aluno.saude
      if (!saude) return <p>Nenhuma informação de saúde cadastrada.</p>
      return <div className="grade-saude">
        <Bloco titulo="Doenças e Alergias">
          <Dado titulo="Possui alergia" valor={simNao(saude.possui_alergia)} />
          <Dado titulo="Descrição da alergia" valor={saude.descricao_alergia} />
          {!aluno.doencas.length && <p>Nenhuma doença cadastrada.</p>}
          {aluno.doencas.map((d) => <div key={d.id_doenca}>
            <Dado titulo="Doença" valor={d.nome} />
            <Dado titulo="Status" valor={d.pivot?.status} />
            <Dado titulo="Observação" valor={d.pivot?.observacao} />
            <Dado titulo="Medicação" valor={d.pivot?.medicacao_em_uso} />
            <Dado titulo="Cuidados especiais" valor={simNao(d.pivot?.requer_cuidados_especiais)} />
          </div>)}
          <Dado titulo="Em tratamento médico" valor={simNao(saude.em_tratamento_medico)} />
          <Dado titulo="Gestante" valor={simNao(saude.gestante)} />
          <Dado titulo="Usa medicação contínua" valor={simNao(saude.usa_medicacao_continua)} />
          <Dado titulo="Descrição da medicação" valor={saude.descricao_medicacao} />
        </Bloco>
        <Bloco titulo="Histórico Cirúrgico">
          {[['Já foi operado?', 'ja_foi_operado'], ['Problema com anestesia?', 'problema_anestesia'], ['Problema com cicatrização?', 'problema_cicatrizacao'], ['Problema com hemorragia?', 'problema_hemorragia']].map(([titulo, campo]) => <Dado key={campo} titulo={titulo} valor={simNao(saude[campo])} />)}
          <Dado titulo="Descrição das cirurgias" valor={saude.descricao_cirurgias} />
        </Bloco>
        <Bloco titulo="Antecedentes Familiares"><div className="caixa-texto">{saude.antecedentes_familiares || 'Não informado'}</div></Bloco>
        <Bloco titulo="Hábitos"><div className="caixa-texto">{saude.habitos || 'Não informado'}</div></Bloco>
        <Bloco titulo="Outros Problemas"><div className="caixa-texto">{saude.observacoes_saude || 'Não informado'}</div></Bloco>
        <Bloco titulo="Informações do Médico">{campos([['Médico', 'medico_responsavel_nome'], ['Telefone', 'medico_responsavel_telefone'], ['Queixa principal', 'queixa_principal']], saude)}</Bloco>
      </div>
    }
    return <Bloco titulo="Histórico de Relatos" classe="historico">
      <button class="novo-relato" type="button">Novo Relato <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg></button>
      {!aluno.relatos.length && <p>Nenhum relato cadastrado.</p>}
      {aluno.relatos.map((r) => <article className="relato" key={r.id_relato}><header><i aria-hidden="true" /><small>{dataBr(r.data_registro)} - {r.titulo}</small></header><p style={{ whiteSpace: 'pre-wrap' }}>{r.descricao || 'Sem descrição'}</p></article>)}
    </Bloco>
  }
  return <main className="perfil-aluno">
    <aside className="menu-perfil" aria-label="Navegação principal"><img src={logo} alt="Logo Recanto Betel" />
      {menu.map((item) => <button type="button" className={item.id === 'alunos' ? 'selecionado' : ''} key={item.id} onClick={() => aoNavegar(item.id)}><Icone nome={item.icone} tamanho={26} /><span>{item.texto}</span></button>)}
    </aside>
    <section className="perfil-area"><header className="perfil-topo"><h1>Recanto Betel</h1><span><Icone nome="pessoal" tamanho={30} /><small>{usuario?.name || 'Usuário'}</small></span></header>
      <div className="perfil-conteudo">
        {erro && <p role="alert">{erro}</p>}
        {!erro && !aluno && <p role="status">Carregando aluno...</p>}
        {aluno && <>
          <section className="cabecalho-aluno">
            <div className="avatar-aluno">{aluno.foto ? <img src={fotoUrl(aluno.foto)} alt="" /> : aluno.nome.split(' ').slice(0, 2).map((n) => n[0]).join('')}</div>
            <div className="aluno-identificacao"><h2>{aluno.nome}</h2><span className={`status-aluno ${aluno.status?.toLowerCase() || ''}`}>Status: {aluno.status || 'Não informado'}</span></div>
            <p>Data de cadastro {dataBr(aluno.cadastro)}</p>
          </section>
          <nav className="abas-perfil" aria-label="Informações do aluno">{abas.map((item) => <button type="button" className={aba === item.id ? 'ativa' : ''} key={item.id} aria-current={aba === item.id ? 'page' : undefined} onClick={() => setAba(item.id)}><Icone nome={item.icone} />{item.texto}</button>)}</nav>
          <div className="conteudo-perfil">{conteudo()}</div>
        </>}
      </div>
    </section>
  </main>
}

export default PerfilAluno
