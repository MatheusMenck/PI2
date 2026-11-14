export const normalizarCpf = (cpf) => cpf.replace(/[.\-\s]/g, '')

export function cpfValido(valor) {
  const cpf = normalizarCpf(valor)
  if (!/^[0-9]{11}$/.test(cpf) || /^([0-9])\1{10}$/.test(cpf)) return false
  for (let posicao = 9; posicao <= 10; posicao++) {
    let soma = 0
    for (let indice = 0; indice < posicao; indice++) soma += Number(cpf[indice]) * (posicao + 1 - indice)
    const digito = (10 * soma) % 11
    if ((digito === 10 ? 0 : digito) !== Number(cpf[posicao])) return false
  }
  return true
}
