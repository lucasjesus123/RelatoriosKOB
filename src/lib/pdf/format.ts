// Formata um valor numérico (string com ponto decimal) no padrão brasileiro:
// 1234.5 -> "1.234,50".
export function formatarMoedaBR(valor: string): string {
  const n = Number(valor)
  if (!Number.isFinite(n)) return valor
  const [inteiro, decimal] = Math.abs(n).toFixed(2).split('.')
  const comMilhar = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `${n < 0 ? '-' : ''}${comMilhar},${decimal}`
}
