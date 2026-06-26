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
  // Alíquotas efetivas do Simples por anexo (string com 2 casas, '0.00' se não houver).
  percComercio: string
  percIndustria: string
  percServicos: string
  // Indica quais grupos existem (receita > 0), para exibir só o que faz sentido.
  temComercio: boolean
  temIndustria: boolean
  temServicos: boolean
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
  const servicos = simples.servico.receita
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
    percComercio: simples.comercio.perc.toFixed(2),
    percIndustria: simples.industria.perc.toFixed(2),
    percServicos: simples.servico.perc.toFixed(2),
    temComercio: !simples.comercio.receita.isZero(),
    temIndustria: !simples.industria.receita.isZero(),
    temServicos: !simples.servico.receita.isZero(),
  }
}
