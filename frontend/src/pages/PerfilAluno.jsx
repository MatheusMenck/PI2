import { useMemo, useState } from 'react'
import './PerfilAluno.css'
import logo from '../assets/logo.png'
import fotoAlunoReferencia from '../assets/aluno-referencia.png'

const alunos = {
  1: {
    nome: 'Cinnamoroll dos Santos Vieira',
    status: 'Ativa',
    cadastro: '17/05/2026',
    foto: fotoAlunoReferencia,
    cpf: '154.125.685-54',
    rg: '154.125.685-54',
    telefone: '(15) 99795-3456',
    nascimento: '01/02/2007',
    religiao: 'Católico',
    rua: 'Pires Arnaldo de Campos',
    numero: '524',
    bairro: 'Jardim Aeroporto',
    referencia: 'N/A',
    cidade: 'São Paulo, SP',
    escola: 'Etec Sales Gomes',
    serie: '5º B',
    periodo: 'Tarde',
  },
  2: {
    nome: 'Hello Kitty da Silva',
    status: 'Pendente',
    cadastro: '18/05/2026',
    cpf: '325.641.987-10',
    rg: '325.641.987-10',
    telefone: '(15) 99872-2210',
    nascimento: '14/08/2010',
    religiao: 'Católica',
    rua: 'Rua das Flores',
    numero: '105',
    bairro: 'Centro',
    referencia: 'Próximo à praça',
    cidade: 'Tatuí, SP',
    escola: 'EMEF João Paulo',
    serie: '4º A',
    periodo: 'Manhã',
  },
  3: {
    nome: 'Kuromi Oliveira',
    status: 'Indeferida',
    cadastro: '20/05/2026',
    cpf: '498.215.736-02',
    rg: '498.215.736-02',
    telefone: '(15) 99611-8721',
    nascimento: '22/11/2008',
    religiao: 'Não informado',
    rua: 'Rua das Acácias',
    numero: '88',
    bairro: 'Vila Nova',
    referencia: 'N/A',
    cidade: 'Tatuí, SP',
    escola: 'EE Barão de Suruí',
    serie: '6º A',
    periodo: 'Tarde',
  },
}

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
  return <div className="dado-perfil"><small>{titulo}</small><strong>{valor}</strong></div>
}

function PerfilAluno({ rota, aoNavegar }) {
  const id = rota.split('/')[1]
  const alunoBase = alunos[id] || alunos[1]
  const [etapaAtual, setEtapaAtual] = useState(4)
  const [dadosAluno, setDadosAluno] = useState(alunoBase)
  const [editando, setEditando] = useState(false)
  const iniciais = useMemo(
    () => dadosAluno.nome.split(' ').slice(0, 2).map((nome) => nome[0]).join(''),
    [dadosAluno.nome],
  )

  function atualizarAluno(evento) {
    setDadosAluno((atual) => ({ ...atual, [evento.target.name]: evento.target.value }))
  }

  function renderizarCampos(campos) {
    return campos.map(([titulo, nome]) => (
      editando
        ? <label key={nome}>{titulo}<input name={nome} value={dadosAluno[nome]} onChange={atualizarAluno} /></label>
        : <Dado key={nome} titulo={titulo} valor={dadosAluno[nome]} />
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
    return (
      <div className="grade-perfil familia-perfil">
        <Bloco titulo="Responsável(is)">
          <div className="pessoa">◉ <span><b>Mamãe Kurumi</b><small>Parentesco: Mãe</small></span></div>
        </Bloco>
        <Bloco titulo="Autorizações">
          <small>Autorização para Sair Sozinho:</small>
          <b>Não, Saída somente com:</b>
          <div className="pessoa"><span><b>Gabriely Hello Kitty</b><small>☎ (15) 99785-6425</small></span><em>Irmã</em></div>
          <div className="pessoa"><span><b>Renan Kitty</b><small>☎ (15) 99785-6425</small></span><em>Pai</em></div>
          <small>Autorização Odontológica:</small>
          <b>Sim</b>
        </Bloco>
        <Bloco titulo="Composição Familiar">
          <div className="familia-item"><b>Gabriely Hello Kitty</b><small>Nasc: 05/03/2014</small><em>Irmã</em></div>
          <div className="familia-item"><b>Renan Kitty</b><small>Nasc: 05/03/1985</small><em>Pai</em></div>
        </Bloco>
      </div>
    )
  }

  function saude() {
    const condicoes = [
      'Doenças Pré-Existentes',
      'Febre Reumática',
      'Cardíacos',
      'Renais',
      'Gástricos',
      'Respiratórios',
      'Articulares',
      'Diabetes',
      'Hipertensão Arterial Sistêmica',
    ]
    const historico = [
      'Já foi operado?',
      'Problema com anestesia?',
      'Problema com cicatrização?',
      'Problema com hemorragia?',
    ]

    return (
      <div className="grade-saude">
        <Bloco titulo="Doenças e Alergias">
          <small>Alergias Catalogadas</small>
          <p><mark>Amendoim</mark> <mark>Frutos do mar</mark> <mark>Mel</mark></p>
          {condicoes.map((item, indice) => (
            <div className="linha-saude" key={item}>
              {item}<b className={indice % 3 === 0 ? 'sim' : 'nao'}>{indice % 3 === 0 ? 'Sim' : 'Não'}</b>
            </div>
          ))}
        </Bloco>
        <Bloco titulo="Histórico Cirúrgico">
          {historico.map((item, indice) => (
            <div className="linha-saude" key={item}>
              {item}<b className={indice === 2 ? 'nao' : 'sim'}>{indice === 2 ? 'Não' : 'Sim'}</b>
            </div>
          ))}
        </Bloco>
        <Bloco titulo="Antecedentes Familiares">
          <div className="caixa-texto">Relatos de Antecedências<br /><small>Nenhum relato constatado na matrícula</small></div>
        </Bloco>
        <Bloco titulo="Hábitos">
          <div className="caixa-texto">Sono regular médio de 8 horas noturnas mantendo excelente aceitação hídrica durante todo o expediente de aulas.</div>
        </Bloco>
        <Bloco titulo="Outros Problemas">
          <div className="caixa-texto alerta">Observação<br />Ficar alerta caso o aluno demonstre agitação psicomotora ou ansiedade atípica.</div>
        </Bloco>
        <Bloco titulo="Informações do Médico">
          <div className="caixa-texto"><b>Dra. Kuromi</b><hr /><b>Queixa Principal</b><br />N/A</div>
        </Bloco>
      </div>
    )
  }

  function relatos() {
    return (
      <Bloco titulo="Histórico de Relatos" classe="historico">
        <button className="novo-relato" type="button">
          Novo Relato <Icone nome="adicionar" tamanho={20} />
        </button>
        <article className="relato">
          <header><i aria-hidden="true" /><small>17/06/2026 - Problemas de saúde</small></header>
          <p>
            Durante o período de aula, o aluno apresentou um mal-estar repentino, relatando tontura e fraqueza. O professor foi informado e prestou os primeiros cuidados, mantendo o aluno em repouso e comunicando a situação à coordenação da escola. Em seguida, os responsáveis foram avisados para que pudessem tomar as providências necessárias.
            <br />
            O aluno permaneceu acompanhado até a chegada do responsável. A situação foi registrada pela escola para fins de acompanhamento.
          </p>
        </article>
      </Bloco>
    )
  }

  const conteudo = [dadosPessoais, familia, saude, relatos][etapaAtual - 1]

  return (
    <main className="perfil-aluno">
      <aside className="menu-perfil" aria-label="Navegação principal">
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
      </aside>

      <section className="perfil-area">
        <header className="perfil-topo">
          <h1>Recanto Betel</h1>
          <span><Icone nome="pessoal" tamanho={30} /><small>Talda Fernanda</small></span>
        </header>

        <div className="perfil-conteudo">
          <section className="cabecalho-aluno">
            <div className="avatar-aluno">
              {dadosAluno.foto ? <img src={dadosAluno.foto} alt="" /> : iniciais}
            </div>
            <div className="aluno-identificacao">
              <h2>{dadosAluno.nome}</h2>
              <span className={`status-aluno ${dadosAluno.status.toLowerCase()}`}>Status: {dadosAluno.status}</span>
            </div>
            <button
              type="button"
              className="editar"
              aria-label={editando ? 'Concluir edição do aluno' : 'Editar aluno'}
              onClick={() => setEditando(!editando)}
            >
              <Icone nome={editando ? 'adicionar' : 'editar'} tamanho={27} />
            </button>
            <p>Data de cadastro {dadosAluno.cadastro}</p>
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
        </div>
      </section>
    </main>
  )
}

export default PerfilAluno
