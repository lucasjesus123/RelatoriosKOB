import Decimal from 'decimal.js'
import { CFOP_DICIONARIO, CfopCategoria } from './cfop'
import type { BuscarCfop } from './cfop-repo'

export interface ItemExtraido {
  cfop: string
  descricao: string
  valor: Decimal
  categoria: CfopCategoria
}

export interface CategoriaResumo {
  categoria: CfopCategoria
  itens: ItemExtraido[]
  total: Decimal
}

export interface ApuracaoResultado {
  categorias: Record<CfopCategoria, CategoriaResumo>
  somaGeralEntradas: Decimal
  somaGeralSaidas: Decimal
  percentualX: Decimal
}

// Agrupamento por CFOP literal: 1/2-xxx (Entradas e Devolução de Vendas) somam como Entradas;
// 5/6-xxx (Vendas, Devolução de Entradas e Serviços) somam como Saídas.
const CATEGORIAS_DE_ENTRADA: CfopCategoria[] = ['ENTRADAS', 'DEVOLUCAO_VENDAS']
const CATEGORIAS_DE_SAIDA: CfopCategoria[] = ['VENDAS', 'DEVOLUCAO_ENTRADAS', 'SERVICOS']

export function classificarLinha(
  cfopBruto: string,
  valorBruto: string,
  buscarCfop: BuscarCfop
): ItemExtraido | null {
  const info = buscarCfop(cfopBruto)
  if (!info) return null

  const valorNormalizado = valorBruto
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.\-]/g, '')

  if (!valorNormalizado) return null

  let valor: Decimal
  try {
    valor = new Decimal(valorNormalizado)
  } catch {
    return null
  }

  return {
    cfop: info.codigo,
    descricao: info.descricao,
    valor,
    categoria: info.categoria,
  }
}

export function apurar(itens: ItemExtraido[]): ApuracaoResultado {
  const categorias = Object.fromEntries(
    Object.keys(CFOP_DICIONARIO).length
      ? (['VENDAS', 'DEVOLUCAO_VENDAS', 'ENTRADAS', 'DEVOLUCAO_ENTRADAS', 'SERVICOS'] as CfopCategoria[]).map(
          (categoria) => [categoria, { categoria, itens: [] as ItemExtraido[], total: new Decimal(0) }]
        )
      : []
  ) as Record<CfopCategoria, CategoriaResumo>

  for (const item of itens) {
    const resumo = categorias[item.categoria]
    resumo.itens.push(item)
    resumo.total = resumo.total.plus(item.valor)
  }

  const somaGeralEntradas = CATEGORIAS_DE_ENTRADA.reduce(
    (acc, categoria) => acc.plus(categorias[categoria].total),
    new Decimal(0)
  )

  const somaGeralSaidas = CATEGORIAS_DE_SAIDA.reduce(
    (acc, categoria) => acc.plus(categorias[categoria].total),
    new Decimal(0)
  )

  const percentualX = somaGeralEntradas.isZero()
    ? new Decimal(0)
    : somaGeralSaidas.dividedBy(somaGeralEntradas).times(-1).times(100)

  return {
    categorias,
    somaGeralEntradas,
    somaGeralSaidas,
    percentualX,
  }
}
