const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')
const moeda = (valor) => valor === null || valor === undefined ? 'Não informado' : Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export async function buscarResponsaveis(caminho = '', signal) {
  const resposta = await fetch(`${API_URL}/responsaveis${caminho}`, {
    signal,
    headers: { Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}` },
  })
  if (!resposta.ok) {
    const mensagens = { 401: 'Sua sessão expirou. Entre novamente.', 403: 'Você não tem permissão para consultar responsáveis.', 404: 'Responsável não encontrado.' }
    throw new Error(mensagens[resposta.status] || 'Não foi possível carregar os responsáveis. Tente novamente.')
  }
  const dados = await resposta.json()
  if (dados.responsavel) {
    const renda = dados.responsavel.renda
    dados.responsavel.renda = {
      ...renda, salario: moeda(renda.salario), total: moeda(renda.total), percapta: moeda(renda.percapta),
      beneficio: renda.beneficio_governo === null ? 'Não informado' : renda.beneficio_governo ? `Sim, ${renda.nome_beneficio || 'Não informado'} — ${moeda(renda.valor_beneficio)}` : 'Não',
      moradia: { propria: 'Própria', cedida: 'Cedida', alugada: 'Alugada' }[renda.moradia] || null,
    }
    dados.responsavel.despesas = dados.responsavel.despesas.map(([nome, valor]) => [nome, moeda(valor)])
  }
  return dados
}

export async function consultarCpf(cpf) {
  const resposta = await fetch(`${API_URL}/responsaveis/por-cpf?cpf=${encodeURIComponent(cpf)}`, {
    headers: { Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}` },
  })
  if (!resposta.ok) throw new Error('Não foi possível consultar o CPF. Tente novamente.')
  return (await resposta.json()).responsavel
}

export async function salvarResponsavel(formulario) {
  const resposta = await fetch(`${API_URL}/responsaveis`, {
    method: 'POST', body: formulario,
    headers: { Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}` },
  })
  const dados = await resposta.json()
  if (!resposta.ok) throw new Error(dados.errors ? Object.values(dados.errors).flat().join(' | ') : dados.message || 'Não foi possível salvar o responsável.')
  return dados.responsavel
}
