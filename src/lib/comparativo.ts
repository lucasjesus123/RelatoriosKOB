import Decimal from 'decimal.js'
import type { ItemCfopResumo } from './cfop-resumo'
import type { SimplesNacionalDados } from './simples'
import type { CfopCategoria } from './cfop'

// Devoluções contam (regra do usuário): documentos com CFOP 1/2 (devolução de
// venda) somam como entrada; CFOP 5/6 (devolução de compra) somam como saída.
const CATEGORIAS_ENTRADA: CfopCategoria[] = ['ENTRADAS', 'DEVOLUCAO_VENDAS']
const CATEGORIAS_SAIDA: CfopCategoria[] = ['VENDAS', 'DEVOLUCAO_ENTRADAS']

export interface LinhaComparativo {
  cfop: string
  descricao: string
  valor: string
}

export interface ComparativoResultado {
  entradas: LinhaComparativo[]
  saidasMercadorias: LinhaComparativo[]
  servicos: string
  totalEntradas: string
  totalSaidasMercadorias: string
  totalSaidas: string // mercadorias + serviços
  resultado: string // saídas - entradas
  valorSimples: string
  percVendas: string
  percServicos: string
}

function somar(itens: ItemCfopResumo[]): Decimal {
  return itens.reduce((acc, i) => acc.plus(i.valor), new Decimal(0))
}

export function montarComparativo(
  itens: ItemCfopResumo[],
  simples: SimplesNacionalDados
): ComparativoResultado {
  const entradas = itens.filter((i) => CATEGORIAS_ENTRADA.includes(i.categoria))
  const saidasMerc = itens.filter((i) => CATEGORIAS_SAIDA.includes(i.categoria))

  const totalEntradas = somar(entradas)
  const totalSaidasMerc = somar(saidasMerc)
  const servicos = simples.servicosReceita
  const totalSaidas = totalSaidasMerc.plus(servicos)
  const resultado = totalSaidas.minus(totalEntradas)

  const linha = (i: ItemCfopResumo): LinhaComparativo => ({
    cfop: i.cfop,
    descricao: i.descricao,
    valor: i.valor.toFixed(2),
  })

  return {
    entradas: entradas.map(linha),
    saidasMercadorias: saidasMerc.map(linha),
    servicos: servicos.toFixed(2),
    totalEntradas: totalEntradas.toFixed(2),
    totalSaidasMercadorias: totalSaidasMerc.toFixed(2),
    totalSaidas: totalSaidas.toFixed(2),
    resultado: resultado.toFixed(2),
    valorSimples: simples.valorSimples.toFixed(2),
    percVendas: simples.percVendas.toFixed(2),
    percServicos: simples.percServicos.toFixed(2),
  }
}
