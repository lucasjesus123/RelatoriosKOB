import Decimal from 'decimal.js'
import type { BuscarCfop } from './cfop-repo'
import type { CfopCategoria } from './cfop'

export interface ItemCfopResumo {
  cfop: string
  descricao: string
  categoria: CfopCategoria
  valor: Decimal
}

// No "Resumo das Operações por CFOP" o Valor Contábil vem logo após o código
// do CFOP, ex.: "... 1-102 30.429,71 0,00 0,00". Captura o código (com - ou .)
// seguido do primeiro valor monetário.
const LINHA_CFOP_VALOR = /([1-7])[-.](\d{3})\s+([\d.]+,\d{2})/g

function dec(br: string): Decimal {
  return new Decimal(br.replace(/\./g, '').replace(',', '.'))
}

// Lê os CFOPs do PDF de resumo, mantendo apenas os que estão na lista oficial
// (buscarCfop). Cada CFOP encontrado aparece uma vez por linha.
export function extrairCfopsDoResumo(texto: string, buscarCfop: BuscarCfop): ItemCfopResumo[] {
  const itens: ItemCfopResumo[] = []
  for (const linha of texto.split(/\r?\n/)) {
    LINHA_CFOP_VALOR.lastIndex = 0
    const m = LINHA_CFOP_VALOR.exec(linha)
    if (!m) continue
    const codigo = `${m[1]}${m[2]}`
    const info = buscarCfop(codigo)
    if (!info) continue // fora da lista oficial → ignora
    itens.push({
      cfop: info.codigo,
      descricao: info.descricao,
      categoria: info.categoria,
      valor: dec(m[3]),
    })
  }
  return itens
}
