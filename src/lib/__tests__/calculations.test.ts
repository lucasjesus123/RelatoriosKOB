import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { classificarLinha, apurar, type ItemExtraido } from '../calculations'
import type { BuscarCfop } from '../cfop-repo'
import type { CfopInfo } from '../cfop'

// Buscador falso que simula o mapeamento oficial mínimo usado nos testes.
const MAPA: Record<string, CfopInfo> = {
  '5102': { codigo: '5102', descricao: 'Venda', categoria: 'VENDAS' },
  '5933': { codigo: '5933', descricao: 'Serviço', categoria: 'SERVICOS' },
  '1102': { codigo: '1102', descricao: 'Compra', categoria: 'ENTRADAS' },
  '1202': { codigo: '1202', descricao: 'Devolução de venda', categoria: 'DEVOLUCAO_VENDAS' },
  '5202': { codigo: '5202', descricao: 'Devolução de compra', categoria: 'DEVOLUCAO_ENTRADAS' },
}
const buscar: BuscarCfop = (c) => MAPA[c.replace(/[^0-9]/g, '')]

describe('parser de número brasileiro', () => {
  it('converte milhar e centavos: 1.234.567,89', () => {
    const item = classificarLinha('5102', '1.234.567,89', buscar)
    expect(item?.valor.toFixed(2)).toBe('1234567.89')
  })

  it('converte valor simples com vírgula: 1234,56', () => {
    const item = classificarLinha('5102', '1234,56', buscar)
    expect(item?.valor.toFixed(2)).toBe('1234.56')
  })

  it('não perde centavos em valores pequenos: 0,05', () => {
    const item = classificarLinha('5102', '0,05', buscar)
    expect(item?.valor.toFixed(2)).toBe('0.05')
  })
})

describe('classificação por CFOP', () => {
  it('classifica CFOP da lista na categoria correta', () => {
    expect(classificarLinha('5102', '10,00', buscar)?.categoria).toBe('VENDAS')
    expect(classificarLinha('1102', '10,00', buscar)?.categoria).toBe('ENTRADAS')
    expect(classificarLinha('5933', '10,00', buscar)?.categoria).toBe('SERVICOS')
  })

  it('ignora CFOP fora da lista oficial (retorna null)', () => {
    expect(classificarLinha('9999', '10,00', buscar)).toBeNull()
  })

  it('aceita CFOP com separador (1-102 / 1.102)', () => {
    expect(classificarLinha('1-102', '10,00', buscar)?.categoria).toBe('ENTRADAS')
    expect(classificarLinha('1.102', '10,00', buscar)?.categoria).toBe('ENTRADAS')
  })
})

function item(cfop: string, categoria: ItemExtraido['categoria'], valor: string): ItemExtraido {
  return { cfop, descricao: '', valor: new Decimal(valor), categoria }
}

describe('somas e fórmula final', () => {
  it('soma subtotais por categoria com precisão de centavos', () => {
    const r = apurar([
      item('5102', 'VENDAS', '100.10'),
      item('5102', 'VENDAS', '200.20'),
      item('1102', 'ENTRADAS', '50.05'),
    ])
    expect(r.categorias.VENDAS.total.toFixed(2)).toBe('300.30')
    expect(r.categorias.ENTRADAS.total.toFixed(2)).toBe('50.05')
  })

  it('compõe entradas (ENTRADAS + DEVOLUCAO_VENDAS) e saídas (VENDAS + DEVOLUCAO_ENTRADAS + SERVICOS)', () => {
    const r = apurar([
      item('1102', 'ENTRADAS', '400.00'),
      item('1202', 'DEVOLUCAO_VENDAS', '100.00'),
      item('5102', 'VENDAS', '1000.00'),
      item('5202', 'DEVOLUCAO_ENTRADAS', '50.00'),
      item('5933', 'SERVICOS', '200.00'),
    ])
    expect(r.somaGeralEntradas.toFixed(2)).toBe('500.00') // 400 + 100
    expect(r.somaGeralSaidas.toFixed(2)).toBe('1250.00') // 1000 + 50 + 200
  })

  it('Percentual X = (saídas / entradas) * -1 * 100', () => {
    const r = apurar([
      item('1102', 'ENTRADAS', '400.00'),
      item('5102', 'VENDAS', '1000.00'),
    ])
    // (1000 / 400) * -1 * 100 = -250.00
    expect(r.percentualX.toFixed(2)).toBe('-250.00')
  })

  it('Percentual X é zero quando não há entradas (evita divisão por zero)', () => {
    const r = apurar([item('5102', 'VENDAS', '1000.00')])
    expect(r.percentualX.toFixed(2)).toBe('0.00')
  })
})
