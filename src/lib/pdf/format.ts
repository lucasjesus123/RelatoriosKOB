// Formata o CFOP com traço: "1102" -> "1-102".
export function formatarCfop(codigo: string): string {
  const d = codigo.replace(/[^0-9]/g, '')
  return d.length === 4 ? `${d[0]}-${d.slice(1)}` : codigo
}

// Formata um valor numérico (string com ponto decimal) no padrão brasileiro:
// 1234.5 -> "1.234,50".
export function formatarMoedaBR(valor: string): string {
  const n = Number(valor)
  if (!Number.isFinite(n)) return valor
  const [inteiro, decimal] = Math.abs(n).toFixed(2).split('.')
  const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${n < 0 ? '-' : ''}${comMilhar},${decimal}`
}
