import { describe, it, expect } from 'vitest'
import { extrairItensDoTexto } from '../extract'
import type { BuscarCfop } from '../cfop-repo'
import type { CfopInfo } from '../cfop'

const MAPA: Record<string, CfopInfo> = {
  '5102': { codigo: '5102', descricao: 'Venda', categoria: 'VENDAS' },
  '1102': { codigo: '1102', descricao: 'Compra', categoria: 'ENTRADAS' },
}
const buscar: BuscarCfop = (c) => MAPA[c.replace(/[^0-9]/g, '')]

describe('extração de CFOP e valor do texto', () => {
  it('extrai uma linha com CFOP e valor', () => {
    const itens = extrairItensDoTexto('5102 Venda de mercadoria 1.000,00', buscar)
    expect(itens).toHaveLength(1)
    expect(itens[0].cfop).toBe('5102')
    expect(itens[0].valor.toFixed(2)).toBe('1000.00')
  })

  it('usa o último valor da linha quando há vários (qtd, unitário, total)', () => {
    const itens = extrairItensDoTexto('5102 Produto 10,00 5,00 1.234,56', buscar)
    expect(itens[0].valor.toFixed(2)).toBe('1234.56')
  })

  it('ignora linhas cujo CFOP não está na lista oficial', () => {
    const itens = extrairItensDoTexto('9999 Item fora da lista 500,00', buscar)
    expect(itens).toHaveLength(0)
  })

  it('processa múltiplas linhas', () => {
    const texto = ['5102 Venda 1.000,00', '1102 Compra 400,00', '9999 Fora 999,00'].join('\n')
    const itens = extrairItensDoTexto(texto, buscar)
    expect(itens).toHaveLength(2)
  })
})
