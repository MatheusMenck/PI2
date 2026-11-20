import FotoPessoa from '../components/FotoPessoa'
import AtalhoAdministrador from '../components/AtalhoAdministrador'
import { useEffect, useRef, useState } from 'react'
import { getStoredAuthUser } from '../authUser'
import './CadastroAluno.css'
import logo from '../assets/logo.png'
import { cpfValido, normalizarCpf } from '../utils/cpf'
import { consultarCpf } from '../utils/responsaveisApi'

const vazio = {
  nome: '', religiao: '', dataNascimento: '', cpf: '', escola: '', rg: '', telefone: '', serie: '', periodo: '',
  relatoData: '', relatoTitulo: '', relato: '',
  nomeMae: '', nisMae: '', nascimentoMae: '', cpfMae: '', escolaridadeMae: '', rgMae: '', telefoneMae: '', profissaoMae: '', salarioMae: '', enderecoComercialMae: '',
  nomePai: '', nisPai: '', nascimentoPai: '', cpfPai: '', escolaridadePai: '', rgPai: '', telefonePai: '', profissaoPai: '', salarioPai: '', enderecoComercialPai: '',
  cep: '', rua: '', bairro: '', numero: '', referencia: '', cidade: '', estado: '', tipoMoradia: 'Própria', agua: '', luz: '', gas: '', alimentacao: '', rendaTotal: '', rendaPerCapita: '', beneficio: 'Sim', nomeBeneficio: '', valorBeneficio: '',
  problemaSaude: 'Não', problemaSaudeQual: '', tratamento: 'Não', tratamentoQual: '', alergia: 'Não', alergiaQual: '', doencasAnteriores: '',
  queixaPrincipal: '', medico: '', telefoneMedico: '', doenca: 'Não', doencaQual: '', operado: 'Não', operadoQual: '', anestesia: 'Não', cicatrizacao: 'Não', hemorragia: 'Não', habitos: '', antecedentes: '', outrosProblemas: '', autorizadoSairSozinho: '', declaracaoVeracidade: false, autorizaAtendimentoOdontologico: '',
}

const CAMPOS_RESPONSAVEL = {
  nome: 'nome', nis: 'nis', nascimento: 'data_nascimento', escolaridade: 'escolaridade',
  rg: 'rg', telefone: 'telefone', profissao: 'profissao', salario: 'salario', enderecoComercial: 'endereco_comercial',
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
  const [arquivos, setArquivos] = useState({ fotoAluno: null, fotoMae: null, fotoPai: null, assinatura: null })
  const [previas, setPrevias] = useState({})
  const urlsPrevias = useRef({})
  useEffect(() => () => Object.values(urlsPrevias.current).forEach(URL.revokeObjectURL), [])

  const selecionarArquivo = (nome, evento) => {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arquivo.type) || arquivo.size > 5 * 1024 * 1024) {
      setErroEtapa('Envie uma imagem JPEG, PNG ou WebP de até 5 MB.')
      evento.target.value = ''
      return
    }
    if (urlsPrevias.current[nome]) URL.revokeObjectURL(urlsPrevias.current[nome])
    const previa = URL.createObjectURL(arquivo)
    urlsPrevias.current[nome] = previa
    setPrevias((atual) => ({ ...atual, [nome]: previa }))
    setArquivos((atual) => ({ ...atual, [nome]: arquivo }))
    setErroEtapa('')
  }
  const [erroEtapa, setErroEtapa] = useState('')
  const [relatos, setRelatos] = useState([{ data: '', titulo: '', relato: '' }])
  const [familia, setFamilia] = useState([{ nome: '', nascimento: '', parentesco: '', renda: '' }])
  const [acompanhantes, setAcompanhantes] = useState([{ nome: '', parentesco: '', telefone: '' }])
  const [doencasEspecificasSelecionadas, setDoencasEspecificasSelecionadas] = useState(new Set())
  const [consultasCpf, setConsultasCpf] = useState({})
  const requisicoesCpf = useRef({ Mae: 0, Pai: 0 })
  const atualizarAluno = (evento) => {
    const { name, value } = evento.target
    setErroEtapa('')
    const parentesco = name === 'cpfMae' ? 'Mae' : name === 'cpfPai' ? 'Pai' : null
    if (parentesco) {
      requisicoesCpf.current[parentesco]++
      setConsultasCpf((atual) => ({ ...atual, [parentesco]: null }))
    }
    setAluno((atual) => {
      const campos = parentesco && consultasCpf[parentesco]?.responsavel
        ? Object.fromEntries(Object.keys(CAMPOS_RESPONSAVEL).map((campo) => [`${campo}${parentesco}`, '']))
        : {}
      return { ...atual, ...campos, [name]: value }
    })
  }

  const buscarResponsavel = async (parentesco) => {
    const cpf = normalizarCpf(aluno[`cpf${parentesco}`])
    if (!cpf) return
    if (!cpfValido(cpf)) {
      setErroEtapa('Informe um CPF válido para o responsável.')
      return
    }
    if (consultasCpf[parentesco]?.cpf === cpf && consultasCpf[parentesco]?.status === 'concluida') return
    const requisicao = ++requisicoesCpf.current[parentesco]
    setConsultasCpf((atual) => ({ ...atual, [parentesco]: { status: 'carregando', cpf } }))
    try {
      const responsavel = await consultarCpf(cpf)
      if (requisicoesCpf.current[parentesco] !== requisicao) return
      if (responsavel) {
        setAluno((atual) => ({ ...atual, ...Object.fromEntries(Object.entries(CAMPOS_RESPONSAVEL).map(([campo, coluna]) => [
          `${campo}${parentesco}`, campo === 'nascimento' ? (responsavel[coluna]?.slice(0, 10) || '') : (responsavel[coluna] ?? ''),
        ])) }))
      }
      setConsultasCpf((atual) => ({ ...atual, [parentesco]: { status: 'concluida', cpf, responsavel } }))
    } catch {
      if (requisicoesCpf.current[parentesco] !== requisicao) return
      setConsultasCpf((atual) => ({ ...atual, [parentesco]: { status: 'erro', cpf } }))
      setErroEtapa('Não foi possível consultar o CPF. Tente novamente.')
    }
  }
  const campo = (nome, titulo, tipo = 'text', propriedades = {}) => {
    const parentesco = nome.endsWith('Mae') ? 'Mae' : nome.endsWith('Pai') ? 'Pai' : null
    const bloqueado = parentesco && !nome.startsWith('cpf') && !!consultasCpf[parentesco]?.responsavel
    return <label className="campo-form">{titulo}<input type={tipo} name={nome} value={aluno[nome]} onChange={atualizarAluno} readOnly={bloqueado} onBlur={nome === 'cpfMae' || nome === 'cpfPai' ? () => buscarResponsavel(parentesco) : undefined} {...propriedades} /></label>
  }
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
    familia: familia.filter((pessoa) => Object.values(pessoa).some((valor) => valor.trim())),
    acompanhantes: aluno.autorizadoSairSozinho === 'Não' ? acompanhantes.filter((pessoa) => Object.values(pessoa).some((valor) => valor.trim())) : [],
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
    if (etapaAtual === 3 || etapaAtual === 4) {
      const p = etapaAtual === 3 ? 'Mae' : 'Pai'
      if (consultasCpf[p]?.status === 'carregando') {
        setErroEtapa('Aguarde a consulta do CPF.')
        return
      }
      if (aluno[`nome${p}`].trim() || aluno[`cpf${p}`].trim()) {
        if (!cpfValido(aluno[`cpf${p}`])) {
          setErroEtapa('Informe um CPF válido para o responsável preenchido.')
          return
        }
        if (!aluno[`nome${p}`].trim()) {
          setErroEtapa('Informe o nome do responsável.')
          return
        }
      }
      if (aluno.cpfMae && aluno.cpfPai && normalizarCpf(aluno.cpfMae) === normalizarCpf(aluno.cpfPai)) {
        setErroEtapa('Mãe e pai não podem ter o mesmo CPF.')
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
      if (aluno.beneficio === 'Sim' && (!aluno.nomeBeneficio.trim() || !aluno.valorBeneficio.trim())) {
        setErroEtapa('Informe o nome e o valor do benefício.')
        return
      }
      if (aluno.beneficio === 'Sim' && (!Number.isFinite(Number(aluno.valorBeneficio)) || Number(aluno.valorBeneficio) < 0)) {
        setErroEtapa('O valor do benefício deve ser um número maior ou igual a zero.')
        return
      }
      if (montarPayload().familia.some((pessoa) => !pessoa.nome.trim() || !pessoa.parentesco.trim())) {
        setErroEtapa('Informe nome e parentesco de cada familiar preenchido.')
        return
      }
      if (montarPayload().familia.some((pessoa) => pessoa.renda.trim() && (!Number.isFinite(Number(pessoa.renda)) || Number(pessoa.renda) < 0))) {
        setErroEtapa('A renda do familiar deve ser um número maior ou igual a zero.')
        return
      }
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
      if (!arquivos.assinatura) {
        setErroEtapa('Envie a imagem da assinatura do responsável para concluir a matrícula.')
        return
      }
      if (!aluno.declaracaoVeracidade) {
        setErroEtapa('Confirme a declaração de veracidade para concluir a matrícula.')
        return
      }
      if (!aluno.autorizadoSairSozinho || !aluno.autorizaAtendimentoOdontologico) {
        setErroEtapa('Responda às autorizações de saída e de atendimento odontológico.')
        return
      }
      if (aluno.autorizadoSairSozinho === 'Não') {
        const pessoas = montarPayload().acompanhantes
        if (!pessoas.length || pessoas.some((pessoa) => !pessoa.nome.trim() || !pessoa.parentesco.trim() || !pessoa.telefone.trim())) {
          setErroEtapa('Informe ao menos uma pessoa autorizada, com nome, parentesco e telefone preenchidos.')
          return
        }
      }
      await enviarCadastro()
      return
    }
    setEtapaAtual((atual) => Math.min(9, atual + 1))
  }

  const enviarCadastro = async () => {
    const token = localStorage.getItem('auth_token')
    try {
      const formulario = new FormData()
      const adicionarCampo = (chave, valor) => {
        if (valor === null || valor === undefined) return
        if (Array.isArray(valor) || typeof valor === 'object') {
          Object.entries(valor).forEach(([indice, item]) => adicionarCampo(`${chave}[${indice}]`, item))
        } else {
          formulario.append(chave, typeof valor === 'boolean' ? (valor ? '1' : '0') : valor)
        }
      }
      Object.entries(montarPayload()).forEach(([chave, valor]) => adicionarCampo(chave, valor))
      Object.entries(arquivos).forEach(([chave, arquivo]) => {
        if (arquivo) formulario.append(chave, arquivo)
      })
      const resposta = await fetch('http://localhost:8000/api/alunos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formulario,
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
  const foto = (nome) => {
    const p = nome === 'fotoMae' ? 'Mae' : nome === 'fotoPai' ? 'Pai' : null
    const responsavel = p ? consultasCpf[p]?.responsavel : null
    const previa = previas[nome]
    const imagem = responsavel
      ? <FotoPessoa tipo="responsaveis" pessoa={responsavel} alt="Foto do responsável" alternativa="Foto" />
      : (previa ? <img src={previa} alt="Prévia" /> : 'Foto')
    return <label className="foto"><span>{imagem}</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={!!responsavel} onChange={(e) => selecionarArquivo(nome, e)} />{responsavel ? 'Foto cadastrada' : 'Enviar Foto'}</label>
  }
  const atualizarLista = (lista, setLista, indice, nome, valor) => setLista((atual) => atual.map((item, i) => i === indice ? { ...item, [nome]: valor } : item))
  const grupo = etapaAtual <= 5 ? 1 : etapaAtual <= 8 ? 2 : 3
  const usuario = getStoredAuthUser()

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
          <p>Ao informar o CPF, os dados de um responsável já cadastrado serão preenchidos automaticamente.</p>
          {consultasCpf[p]?.status === 'carregando' && <p role="status">Consultando CPF...</p>}
          {consultasCpf[p]?.status === 'concluida' && <p role="status">{consultasCpf[p].responsavel ? 'Responsável encontrado. Os dados e a foto cadastrados serão reutilizados.' : 'CPF ainda não cadastrado. Preencha os dados do responsável.'}</p>}
          <div className="form-colunas">
            {foto(`foto${p}`)}
            <div className="grade responsavel">
              {campo(`nome${p}`, 'Nome')}
              {campo(`nis${p}`, 'NIS')}
              {campo(`nascimento${p}`, 'Data de Nascimento', 'date')}
              {campo(`cpf${p}`, 'CPF do responsável *', 'text', { maxLength: 14 })}
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
        <p>Opcional. Informe somente os demais familiares, sem repetir a criança, a mãe ou o pai.</p>
        {familia.map((pessoa, i) => (
          <div className="linha-familia" key={i}>
            <b>{i + 1}</b>
            {['nome', 'nascimento', 'parentesco', 'renda'].map((nome) => (
              <label key={nome}>
                {nome === 'nascimento' ? 'Nasc.' : nome[0].toUpperCase() + nome.slice(1)}{['nome', 'parentesco'].includes(nome) ? ' *' : ''}
                <input
                  type={nome === 'nascimento' ? 'date' : nome === 'renda' ? 'number' : 'text'}
                  min={nome === 'renda' ? '0' : undefined}
                  max={nome === 'renda' ? '99999999.99' : undefined}
                  step={nome === 'renda' ? '0.01' : undefined}
                  maxLength={nome === 'nome' ? 255 : nome === 'parentesco' ? 50 : undefined}
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
        {aluno.beneficio === 'Sim' && <div className="grade beneficio">
          {campo('nomeBeneficio', 'Nome do Benefício *', 'text', { maxLength: 100 })}
          {campo('valorBeneficio', 'Valor recebido *', 'number', { min: 0, max: 99999999.99, step: '0.01' })}
        </div>}
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
          <p>3º Autorizo meu filho (a) ir embora sozinho (a): {radio('autorizadoSairSozinho')}</p>
          {aluno.autorizadoSairSozinho === 'Não' && <>
          <p>Somente com:</p>
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
          </>}
          <h3>2 - Projeto Samaritano</h3>
          <p>Autorizo meu filho (a) a frequentar de segunda a sexta-feira, das 13h às 17 horas o Projeto Samaritano, pelo prazo de 1 mês de Adaptação, bem como participar de todas as atividades do Plano anual.</p>
          <h3>3 - Autorização de Atendimento</h3>
          <p>Eu, responsável legal, autorizo a passar pela avaliação e procedimentos odontológicos que sejam julgados necessários.</p>
          <div className="pergunta"><span>Autoriza o atendimento odontológico?</span>{radio('autorizaAtendimentoOdontologico')}</div>
          <label><input type="checkbox" checked={aluno.declaracaoVeracidade} onChange={(e) => { setErroEtapa(''); setAluno((atual) => ({ ...atual, declaracaoVeracidade: e.target.checked })) }} /> Declaro que as informações fornecidas são verdadeiras.</label>
          <p>Responsável pela aprovação: {aluno.nomeMae.trim() || aluno.nomePai.trim() || 'Não informado'}</p>
          <label className="texto-grande">Assinatura do responsável (obrigatória)<input type="file" accept="image/jpeg,image/png,image/webp" required onChange={(e) => selecionarArquivo('assinatura', e)} /></label>
          <p>Envie a foto ou digitalização da assinatura no papel, em JPEG, PNG ou WebP, de até 5 MB.</p>
          {arquivos.assinatura && <p>Arquivo selecionado: {arquivos.assinatura.name}</p>}
          {previas.assinatura && <img src={previas.assinatura} alt="Prévia da assinatura do responsável" style={{ maxWidth: '100%', maxHeight: 180 }} />}
        </section>
      </>
    )
  }

  return <main className="cadastro-pagina"><aside className="menu menu-lateral"><img className="logo" src={logo} alt="Logo Recanto Betel" /><nav><button className="item-menu" onClick={() => aoNavegar('inicio')}><Icone nome="inicio" /><span>Início</span></button><button className="item-menu selecionado" onClick={() => aoNavegar('alunos')}><Icone nome="alunos" /><span>Alunos</span></button><button className="item-menu" onClick={() => aoNavegar('responsaveis')}><Icone nome="responsaveis" /><span>Responsáveis</span></button></nav><AtalhoAdministrador aoNavegar={aoNavegar} /></aside><section className="area-principal"><header className="cabecalho"><h1>Recanto Betel</h1><span className="perfil-cadastro"><Icone nome="perfil" tamanho={32} />{usuario?.name || 'Usuário'}</span></header><div className="conteudo-cadastro"><div className="progresso">{['Matrícula', 'Saúde', 'Autorizações'].map((nome, i) => <div className={`passo ${grupo >= i + 1 ? 'ativo' : ''}`} key={nome}><b>{i + 1}</b><span>{nome}</span></div>)}</div><section className="cartao-cadastro">{etapa()}<footer className="acoes"><button type="button" className="voltar" onClick={voltar}>Voltar</button><button type="button" className="prosseguir" onClick={avancar}>{etapaAtual === 9 ? 'Finalizar' : 'Prosseguir'}</button></footer></section></div></section></main>
}

export default CadastroAluno
