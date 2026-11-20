function normalizarTexto(valor) {
  return String(valor ?? '').trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
}

function digitos(valor) {
  return String(valor ?? '').replace(/\D/g, '')
}

export function contemTexto(valor, busca) {
  return normalizarTexto(valor).includes(normalizarTexto(busca))
}

export function contemNumero(valor, busca) {
  if (!busca.trim()) return true

  const termo = digitos(busca)
  return Boolean(termo) && digitos(valor).includes(termo)
}

export function correspondeBusca(busca, textos, numeros) {
  return textos.some((valor) => contemTexto(valor, busca))
    || (/^[\d\s.()+-]+$/.test(busca) && numeros.some((valor) => contemNumero(valor, busca)))
}
