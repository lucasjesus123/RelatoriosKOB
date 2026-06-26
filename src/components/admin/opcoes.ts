import { CATEGORIA_LABEL, type CfopCategoria } from '@/lib/cfop'

export const CATEGORIA_OPCOES: { value: CfopCategoria; label: string }[] = (
  ['VENDAS', 'DEVOLUCAO_VENDAS', 'ENTRADAS', 'DEVOLUCAO_ENTRADAS', 'SERVICOS'] as CfopCategoria[]
).map((value) => ({ value, label: CATEGORIA_LABEL[value] }))

export const NATUREZA_OPCOES: { value: 'ENTRADA' | 'SAIDA'; label: string }[] = [
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'SAIDA', label: 'Saída' },
]
