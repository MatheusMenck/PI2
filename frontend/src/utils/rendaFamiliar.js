// Calcular em centavos evita acumular erros nas somas de valores monetários.
export function calcularRendaFamiliar(aluno, familia) {
  const centavos = (valor) => Number.isFinite(Number(valor)) ? Math.round(Number(valor) * 100) : 0
  const familiares = familia.filter((pessoa) => pessoa.nome.trim())
  let pessoas = 1 + familiares.length
  let total = familiares.reduce((soma, pessoa) => soma + centavos(pessoa.renda), 0)
  for (const parentesco of ['Mae', 'Pai']) {
    if (aluno[`nome${parentesco}`]?.trim()) {
      pessoas++
      total += centavos(aluno[`salario${parentesco}`])
    }
  }
  if (aluno.beneficio === 'Sim') total += centavos(aluno.valorBeneficio)
  return { rendaTotal: (total / 100).toFixed(2), rendaPerCapita: (Math.round(total / pessoas) / 100).toFixed(2) }
}
