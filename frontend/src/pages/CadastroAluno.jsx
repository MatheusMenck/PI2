import { useState } from 'react'
import './CadastroAluno.css'
import logo from '../assets/logo.png'

const vazio = {
  nome: '', religiao: '', dataNascimento: '', cpf: '', escola: '', rg: '', telefone: '', serie: '', periodo: '',
  relatoData: '', relatoTitulo: '', relato: '', fotoAluno: '', fotoMae: '', fotoPai: '',
  nomeMae: '', nisMae: '', nascimentoMae: '', cpfMae: '', escolaridadeMae: '', rgMae: '', telefoneMae: '', profissaoMae: '', salarioMae: '', enderecoComercialMae: '',
  nomePai: '', nisPai: '', nascimentoPai: '', cpfPai: '', escolaridadePai: '', rgPai: '', telefonePai: '', profissaoPai: '', salarioPai: '', enderecoComercialPai: '',
  cep: '', rua: '', bairro: '', numero: '', referencia: '', cidade: '', estado: '', tipoMoradia: 'Própria', agua: '', luz: '', gas: '', alimentacao: '', rendaTotal: '', rendaPerCapita: '', beneficio: 'Sim', nomeBeneficio: '', valorBeneficio: '',
  problemaSaude: 'Não', problemaSaudeQual: '', tratamento: 'Não', tratamentoQual: '', alergia: 'Não', alergiaQual: '', doencasAnteriores: '',
  queixaPrincipal: '', medico: '', telefoneMedico: '', doenca: 'Não', doencaQual: '', operado: 'Não', operadoQual: '', anestesia: 'Não', cicatrizacao: 'Não', hemorragia: 'Não', habitos: '', antecedentes: '', outrosProblemas: '', assinatura: '', acompanhante: '',
}

const DOENCAS_ESPECIFICAS = [
  'Febre Reumática',
  'Problemas Cardíacos',
  'Problemas Renais',
  'Problemas Gástricos',
  'Problemas Respiratórios',
  'Problemas com Alergia',
  'Problemas Articulares ou Reumatismo',
  'Diabetes',
  'Hipertensão Arterial',
]

const perguntas = ['Febre Reumática?', 'Problemas Cardíacos?', 'Problemas Renais?', 'Problemas Gástricos?', 'Problemas Respiratórios?', 'Problemas com Alergia?', 'Problemas Articulares ou Reumatismo', 'Diabetes?', 'Hipertensão Arterial']

function Icone({ nome, tamanho = 24 }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '1.9' }
  const desenhos = {
    inicio: <path {...p} d="m3 11 9-8 9 8v10H15v-6H9v6H3Z" />,
    alunos: <><rect {...p} x="3" y="4" width="18" height="16" rx="1" /><circle {...p} cx="8" cy="10" r="2" /><path {...p} d="M5.5 16c.5-2 4.5-2 5 0M14 9h4M14 13h4M14 17h3" /></>,
    responsaveis: <><circle {...p} cx="9" cy="8" r="4" /><circle {...p} cx="16" cy="7" r="3" /><path {...p} d="M2.5 20c.4-4 3.1-6 6.5-6s6.1 2 6.5 6M15 14c3.5.2 5.7 2.2 6 5.5" /></>,
    perfil: <><circle {...p} cx="12" cy="12" r="9" /><circle {...p} cx="12" cy="9" r="3" /><path {...p} d="M6.5 19c.8-3.2 3.1-4.8 5.5-4.8s4.7 1.6 5.5 4.8" /></>,
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={tamanho} height={tamanho}>{desenhos[nome]}</svg>
}

function CadastroAluno({ aoNavegar }) {
  const [etapaAtual, setEtapaAtual] = useState(1)
  const [aluno, setAluno] = useState(vazio)
  const [erroEtapa, setErroEtapa] = useState('')
  const [relatos, setRelatos] = useState([{ data: '', titulo: '', relato: '' }])
  const [familia, setFamilia] = useState([{ nome: '', nascimento: '', parentesco: '', renda: '' }])
  const [acompanhantes, setAcompanhantes] = useState([{ nome: '', parentesco: '', telefone: '' }])
  const [doencasEspecificasSelecionadas, setDoencasEspecificasSelecionadas] = useState(new Set())
  const atualizarAluno = (evento) => {
    setErroEtapa('')
    setAluno((atual) => ({ ...atual, [evento.target.name]: evento.target.value }))
  }
  const campo = (nome, titulo, tipo = 'text') => <label className="campo-form">{titulo}<input type={tipo} name={nome} value={aluno[nome]} onChange={atualizarAluno} /></label>
  const radio = (nome) => <span className="radios">{['Sim', 'Não'].map((opcao) => <label key={opcao}><input type="radio" name={nome} value={opcao} checked={aluno[nome] === opcao} onChange={atualizarAluno} />{opcao}</label>)}</span>

  const toggleDoencaEspecifica = (nomeDoenca, marcadoSim) => {
    setDoencasEspecificasSelecionadas((atual) => {
      const novo = new Set(atual)
      if (marcadoSim) {
        novo.add(nomeDoenca)
      } else {
        novo.delete(nomeDoenca)
      }
      return novo
    })
  }

  const radioDoencaEspecifica = (nomeDoenca) => (
    <span className="radios">
      {['Sim', 'Não'].map((opcao) => (
        <label key={opcao}>
          <input
            type="radio"
            value={opcao}
            checked={opcao === 'Sim' ? doencasEspecificasSelecionadas.has(nomeDoenca) : !doencasEspecificasSelecionadas.has(nomeDoenca)}
            onChange={() => toggleDoencaEspecifica(nomeDoenca, opcao === 'Sim')}
          />
          {opcao}
        </label>
      ))}
    </span>
  )

  const montarPayload = () => ({
    ...aluno,
    relatos: relatos.filter((r) => r.relato.trim() || r.titulo.trim()),
    doencasEspecificas: Array.from(doencasEspecificasSelecionadas),
  })

  const avancar = async () => {
    setErroEtapa('')
    if (etapaAtual === 1) {
      if (!aluno.nome.trim()) {
        setErroEtapa('Por favor, informe o nome da criança antes de prosseguir.')
        return
      }
    }
    if (etapaAtual === 4) {
      if (!aluno.nomeMae?.trim() && !aluno.nomePai?.trim()) {
        setErroEtapa('Por favor, informe ao menos um responsável (Mãe ou Pai) para prosseguir.')
        return
      }
    }
    if (etapaAtual === 5) {
      const camposObrigatoriosEndereco = [
        { chave: 'cep', rotulo: 'CEP' },
        { chave: 'rua', rotulo: 'Rua' },
        { chave: 'bairro', rotulo: 'Bairro' },
        { chave: 'numero', rotulo: 'Número' },
        { chave: 'cidade', rotulo: 'Cidade' },
        { chave: 'estado', rotulo: 'Estado' },
      ]
      const faltando = camposObrigatoriosEndereco.find((item) => !aluno[item.chave]?.toString().trim())
      if (faltando) {
        setErroEtapa(`Por favor, preencha o campo de endereço "${faltando.rotulo}" antes de prosseguir.`)
        return
      }
    }
    if (etapaAtual === 9) {
      await enviarCadastro()
      return
    }
    setEtapaAtual((atual) => Math.min(9, atual + 1))
  }

  const enviarCadastro = async () => {
    const token = localStorage.getItem('auth_token')
    try {
      const resposta = await fetch('http://localhost:8000/api/alunos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(montarPayload()),
      })
      const dados = await resposta.json()
      if (!resposta.ok) {
        const mensagensErro = dados.errors
          ? Object.values(dados.errors).flat().join(' | ')
          : dados.message || 'Erro ao cadastrar aluno.'
        setErroEtapa(mensagensErro)
        return
      }
      aoNavegar('alunos')
    } catch {
      setErroEtapa('Erro de conexão. Verifique o servidor e tente novamente.')
    }
  }
  const voltar = () => etapaAtual === 1 ? aoNavegar('alunos') : setEtapaAtual((atual) => atual - 1)
  const foto = (nome) => <label className="foto"><span>{aluno[nome] ? <img src={aluno[nome]} alt="Prévia" /> : 'Foto'}</span><input type="file" accept="image/*" onChange={(e) => { const arquivo = e.target.files?.[0]; if (arquivo) setAluno((a) => ({ ...a, [nome]: URL.createObjectURL(arquivo) })) }} />Enviar Foto</label>
  const atualizarLista = (lista, setLista, indice, nome, valor) => setLista((atual) => atual.map((item, i) => i === indice ? { ...item, [nome]: valor } : item))
  const grupo = etapaAtual <= 5 ? 1 : etapaAtual <= 8 ? 2 : 3
  const usuario = (() => { try { return JSON.parse(localStorage.getItem('auth_user')) || null } catch { return null } })()

  function etapa() {
    if (etapaAtual === 1) return (
      <>
        <h2>Ficha de Matrícula - Criança</h2>
        {erroEtapa && <p className="mensagem-erro-etapa" style={{ color: '#d9534f', marginBottom: '10px' }}>{erroEtapa}</p>}
        <div className="form-colunas">
          {foto('fotoAluno')}
          <div className="grade campos-crianca">
            {campo('nome', 'Nome')}
            {campo('religiao', 'Religião')}
            {campo('dataNascimento', 'Data de Nascimento', 'date')}
            {campo('cpf', 'CPF')}
            {campo('escola', 'Escola')}
            {campo('rg', 'RG')}
            {campo('telefone', 'Telefone Principal', 'tel')}
            {campo('serie', 'Série')}
            <label className="campo-form">
              Período
              <select name="periodo" value={aluno.periodo} onChange={atualizarAluno}>
                <option value="">Selecione o período</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
              </select>
            </label>
          </div>
        </div>
      </>
    )
    if (etapaAtual === 2) return (
      <>
        <h2>Ficha de Matrícula - Relatos</h2>
        {relatos.map((item, i) => (
          <div className="caixa" key={i} style={{ marginBottom: '16px' }}>
            <div className="grade relato-topo">
              <label className="campo-form">
                Data
                <input
                  type="date"
                  value={item.data}
                  onChange={(e) => atualizarLista(relatos, setRelatos, i, 'data', e.target.value)}
                />
              </label>
              <label className="campo-form">
                Título
                <input
                  type="text"
                  value={item.titulo}
                  onChange={(e) => atualizarLista(relatos, setRelatos, i, 'titulo', e.target.value)}
                />
              </label>
            </div>
            <label className="campo-form">
              Relato
              <textarea
                value={item.relato}
                onChange={(e) => atualizarLista(relatos, setRelatos, i, 'relato', e.target.value)}
                placeholder="Insira um relato que ocorreu com o aluno"
              />
            </label>
          </div>
        ))}
        <button
          className="adicionar-linha"
          type="button"
          onClick={() => setRelatos((atual) => [...atual, { data: '', titulo: '', relato: '' }])}
        >
          ＋
        </button>
      </>
    )
    if (etapaAtual === 3 || etapaAtual === 4) {
      const mae = etapaAtual === 3
      const p = mae ? 'Mae' : 'Pai'
      return (
        <>
          <h2>Ficha de Matrícula - {mae ? 'Mãe' : 'Pai'}</h2>
          {erroEtapa && <p className="mensagem-erro-etapa" style={{ color: '#d9534f', marginBottom: '10px' }}>{erroEtapa}</p>}
          <div className="form-colunas">
            {foto(`foto${p}`)}
            <div className="grade responsavel">
              {campo(`nome${p}`, 'Nome')}
              {campo(`nis${p}`, 'NIS')}
              {campo(`nascimento${p}`, 'Data de Nascimento', 'date')}
              {campo(`cpf${p}`, 'CPF')}
              {campo(`escolaridade${p}`, 'Grau de escolaridade')}
              {campo(`rg${p}`, 'RG')}
              {campo(`telefone${p}`, 'Telefone', 'tel')}
              {campo(`profissao${p}`, 'Profissão')}
              {campo(`enderecoComercial${p}`, 'Endereço Comercial')}
              {campo(`salario${p}`, 'Salário', 'number')}
            </div>
          </div>
        </>
      )
    }
    if (etapaAtual === 5) return (
      <>
        <h2>Ficha de Matrícula - Residência</h2>
        {erroEtapa && <p className="mensagem-erro-etapa" style={{ color: '#d9534f', marginBottom: '10px' }}>{erroEtapa}</p>}
        <h3>Composição Familiar</h3>
        {familia.map((pessoa, i) => (
          <div className="linha-familia" key={i}>
            <b>{i + 1}</b>
            {['nome', 'nascimento', 'parentesco', 'renda'].map((nome) => (
              <label key={nome}>
                {nome === 'nascimento' ? 'Nasc.' : nome[0].toUpperCase() + nome.slice(1)}
                <input
                  value={pessoa[nome]}
                  onChange={(e) => atualizarLista(familia, setFamilia, i, nome, e.target.value)}
                />
              </label>
            ))}
          </div>
        ))}
        <button
          className="adicionar-linha"
          type="button"
          onClick={() => setFamilia((a) => [...a, { nome: '', nascimento: '', parentesco: '', renda: '' }])}
        >
          ＋
        </button>

        <h3>Endereço</h3>
        <div className="grade endereco">
          {campo('cep', 'CEP *')}
          {campo('rua', 'Rua *')}
          {campo('bairro', 'Bairro *')}
          {campo('numero', 'Número *', 'number')}
          {campo('referencia', 'Referência (opcional)')}
          {campo('cidade', 'Cidade *')}
          {campo('estado', 'Estado *')}
        </div>

        <h3>Renda e Despesas</h3>
        <div className="caixa moradia">
          Tipo de Moradia
          {['Própria', 'Cedida', 'Alugada'].map((x) => (
            <label key={x}>
              <input
                type="radio"
                name="tipoMoradia"
                value={x}
                checked={aluno.tipoMoradia === x}
                onChange={atualizarAluno}
              />
              {x}
            </label>
          ))}
        </div>
        <div className="grade despesas">
          {campo('agua', 'Conta de água', 'number')}
          {campo('luz', 'Conta de luz', 'number')}
          {campo('gas', 'Gás', 'number')}
          {campo('alimentacao', 'Alimentação', 'number')}
          {campo('rendaTotal', 'Renda Total', 'number')}
          {campo('rendaPerCapita', 'Renda Percapto', 'number')}
        </div>

        <h3>Benefícios</h3>
        <div className="caixa moradia">
          Possui algum Benefício do Governo? {radio('beneficio')}
        </div>
        <div className="grade beneficio">
          {campo('nomeBeneficio', 'Nome do Benefício')}
          {campo('valorBeneficio', 'Valor recebido', 'number')}
        </div>
      </>
    )
    if (etapaAtual === 6) return <><h2>Ficha de Saúde</h2>{[['problemaSaude', 'Possui algum problema de saúde?', 'problemaSaudeQual'], ['tratamento', 'Faz algum tratamento médico?', 'tratamentoQual'], ['alergia', 'Possui alguma Alergia?', 'alergiaQual']].map(([n, t, q]) => <div className="pergunta" key={n}><span>{t}</span>{radio(n)}{campo(q, 'Se sim, Qual(is)?')}</div>)}<div className="pergunta"><span>Que doença ele(a) já teve antes?</span>{campo('doencasAnteriores', '')}</div></>
    if (etapaAtual === 7 || etapaAtual === 8) return (
      <>
        <h2>Ficha Anamnese</h2>
        {erroEtapa && <p className="mensagem-erro-etapa" style={{ color: '#d9534f', marginBottom: '10px' }}>{erroEtapa}</p>}
        {etapaAtual === 7 && (
          <>
            <h3>Queixa Principal</h3>
            <textarea className="grande" name="queixaPrincipal" value={aluno.queixaPrincipal} onChange={atualizarAluno} />
            <h3>Informações do Médico/Assistente</h3>
            <div className="grade medico">
              {campo('medico', 'Nome')}
              {campo('telefoneMedico', 'Telefone')}
            </div>
            {[
              ['doenca', 'Sofre de alguma doença?', 'doencaQual'],
              ['operado', 'Já foi operado?', 'operadoQual'],
              ['anestesia', 'Teve problema com anestesia?'],
              ['cicatrizacao', 'Teve problema com cicatrização?'],
              ['hemorragia', 'Teve problema com hemorragia?'],
            ].map(([n, t, q]) => (
              <div className="pergunta" key={n}>
                <span>{t}</span>
                {radio(n)}
                {q && campo(q, 'Se sim, Qual(is)?')}
              </div>
            ))}
            <h3>Sofre de alguma dessas doenças?</h3>
          </>
        )}
        {(etapaAtual === 7 ? DOENCAS_ESPECIFICAS.slice(0, 5) : DOENCAS_ESPECIFICAS.slice(5)).map((nomeDoenca, idx) => (
          <div className="pergunta" key={nomeDoenca}>
            <span>{perguntas[etapaAtual === 7 ? idx : idx + 5]}</span>
            {radioDoencaEspecifica(nomeDoenca)}
          </div>
        ))}
        {etapaAtual === 8 && (
          <>
            <label className="texto-grande">Hábitos<textarea name="habitos" value={aluno.habitos} onChange={atualizarAluno} /></label>
            <label className="texto-grande">Antecedentes Familiares<textarea name="antecedentes" value={aluno.antecedentes} onChange={atualizarAluno} /></label>
            <label className="texto-grande">Outros Problemas<textarea name="outrosProblemas" value={aluno.outrosProblemas} onChange={atualizarAluno} /></label>
          </>
        )}
      </>
    )
    return (
      <>
        <h2>Autorizações</h2>
        {erroEtapa && <p className="mensagem-erro-etapa" style={{ color: '#d9534f', marginBottom: '10px' }}>{erroEtapa}</p>}
        <section className="termo">
          <h3>1 - Termo de compromisso a ser cumprido:</h3>
          <p>1º Devo respeitar e cumprir todas as normas do Regulamento do Projeto Samaritano e incentivar meus filhos a cumpri-las também.</p>
          <p>2º Estou ciente de que é importante participar de todas as convocações.</p>
          <p>3º Autorizo meu filho (a) ir embora sozinho (a): {radio('acompanhante')}</p>
          <p>Se não, Somente com:</p>
          {acompanhantes.map((item, i) => (
            <div className="linha-acompanhante" key={i}>
              {['nome', 'parentesco', 'telefone'].map((nome) => (
                <label key={nome}>
                  {nome[0].toUpperCase() + nome.slice(1)}
                  <input value={item[nome]} onChange={(e) => atualizarLista(acompanhantes, setAcompanhantes, i, nome, e.target.value)} />
                </label>
              ))}
            </div>
          ))}
          <button className="adicionar-linha" type="button" onClick={() => setAcompanhantes((a) => [...a, { nome: '', parentesco: '', telefone: '' }])}>＋</button>
          <h3>2 - Projeto Samaritano</h3>
          <p>Autorizo meu filho (a) a frequentar de segunda a sexta-feira, das 13h às 17 horas o Projeto Samaritano, pelo prazo de 1 mês de Adaptação, bem como participar de todas as atividades do Plano anual.</p>
          <h3>3 - Autorização de Atendimento</h3>
          <p>Eu, responsável legal, autorizo a passar pela avaliação e procedimentos odontológicos que sejam julgados necessários.</p>
          <label className="texto-grande">Assinatura (foto ou arquivo digitalizado)<input type="file" onChange={(e) => setAluno((a) => ({ ...a, assinatura: e.target.files?.[0]?.name || '' }))} /></label>
        </section>
      </>
    )
  }

  return <main className="cadastro-pagina"><aside className="menu"><img className="logo" src={logo} alt="Logo Recanto Betel" /><nav><button className="item-menu" onClick={() => aoNavegar('inicio')}><Icone nome="inicio" /><span>Início</span></button><button className="item-menu selecionado" onClick={() => aoNavegar('alunos')}><Icone nome="alunos" /><span>Alunos</span></button><button className="item-menu" onClick={() => aoNavegar('responsaveis')}><Icone nome="responsaveis" /><span>Responsáveis</span></button></nav></aside><section className="area-principal"><header className="cabecalho"><h1>Recanto Betel</h1><span className="perfil-cadastro"><Icone nome="perfil" tamanho={32} />{usuario?.name || 'NOME'}</span></header><div className="conteudo-cadastro"><div className="progresso">{['Matrícula', 'Saúde', 'Autorizações'].map((nome, i) => <div className={`passo ${grupo >= i + 1 ? 'ativo' : ''}`} key={nome}><b>{i + 1}</b><span>{nome}</span></div>)}</div><section className="cartao-cadastro">{etapa()}<footer className="acoes"><button type="button" className="voltar" onClick={voltar}>Voltar</button><button type="button" className="prosseguir" onClick={avancar}>{etapaAtual === 9 ? 'Finalizar' : 'Prosseguir'}</button></footer></section></div></section></main>
}

export default CadastroAluno
