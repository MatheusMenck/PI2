const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

export async function buscarIndicadores(signal) {
  const resposta = await fetch(`${API_URL}/dashboard/indicadores`, {
    signal,
    headers: { Accept: 'application/json', Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}` },
  })
  if (!resposta.ok) {
    const mensagens = { 401: 'Sua sessão expirou. Entre novamente.', 403: 'Você não tem permissão para consultar os indicadores.' }
    throw new Error(mensagens[resposta.status] || 'Não foi possível carregar os indicadores. Tente novamente.')
  }
  return resposta.json()
}
