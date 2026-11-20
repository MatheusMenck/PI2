const CAMPOS_NOME = ['display_name', 'displayName', 'nome', 'full_name', 'fullName', 'name']

const NOMES_GENERICOS = new Set(['usuario', 'usuário', 'user'])

export function getDisplayName(user, fallback = 'Usuário') {
  if (!user || typeof user !== 'object') return fallback

  for (const campo of CAMPOS_NOME) {
    const valor = user[campo]
    if (typeof valor !== 'string' || !valor.trim()) continue

    const nome = valor.trim()
    if (!NOMES_GENERICOS.has(nome.toLocaleLowerCase('pt-BR'))) return nome
  }

  return fallback
}

export function normalizeAuthUser(user) {
  if (!user || typeof user !== 'object' || Array.isArray(user)) return null

  const dadosPublicos = { ...user }
  for (const campo of ['password', 'senha', 'token', 'token_acesso', 'remember_token']) {
    delete dadosPublicos[campo]
  }
  const nome = getDisplayName(dadosPublicos, '')

  return {
    ...dadosPublicos,
    ...(nome ? { name: nome } : {}),
  }
}

export function getStoredAuthUser() {
  try {
    return normalizeAuthUser(localStorage.getItem('auth_user')
      ? JSON.parse(localStorage.getItem('auth_user'))
      : null)
  } catch {
    return null
  }
}

export function getAdmissionDate(user) {
  const valor = [user?.admissao, user?.data_admissao, user?.admission_date]
    .find((data) => typeof data === 'string' && data.trim())
  if (!valor) return ''

  const dataISO = valor.trim().match(/^(\d{4})-(\d{2})-(\d{2})/)
  return dataISO ? dataISO[3] + '/' + dataISO[2] + '/' + dataISO[1] : valor.trim()
}
