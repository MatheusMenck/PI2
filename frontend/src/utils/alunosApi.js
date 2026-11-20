const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

export async function buscarAlunos(caminho = '', signal) {
  const resposta = await fetch(`${API_URL}/alunos${caminho}`, {
    signal,
    headers: { Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}` },
  })
  if (!resposta.ok) {
    const mensagens = { 401: 'Sua sessão expirou. Entre novamente.', 403: 'Você não tem permissão para consultar alunos.', 404: 'Aluno não encontrado.' }
    throw new Error(mensagens[resposta.status] || 'Não foi possível carregar os alunos. Tente novamente.')
  }
  return resposta.json()
}

export function dataBr(valor) {
  if (!valor) return 'Não informado'
  const partes = valor.slice(0, 10).split('-')
  return partes.length === 3 ? partes.reverse().join('/') : valor
}

export async function cadastrarRelato(id, dados) {
  const resposta = await fetch(`${API_URL}/alunos/${id}/relatos`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
    },
    body: JSON.stringify(dados),
  })
  if (!resposta.ok) throw new Error('Não foi possível salvar o relato. Verifique os campos e tente novamente.')
  return resposta.json()
}
