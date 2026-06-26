import { describe, it, expect } from 'vitest'
import Decimal from 'decimal.js'
import { extrairCfopsDoResumo } from '../cfop-resumo'
import { montarComparativo } from '../comparativo'
import { parseSimplesNacional } from '../simples'
import type { BuscarCfop } from '../cfop-repo'
import type { CfopInfo } from '../cfop'

const MAPA: Record<string, CfopInfo> = {
  '1102': { codigo: '1102', descricao: 'Compra', categoria: 'ENTRADAS' },
  '1403': { codigo: '1403', descricao: 'Compra ST', categoria: 'ENTRADAS' },
  '2102': { codigo: '2102', descricao: 'Compra inter', categoria: 'ENTRADAS' },
  '5102': { codigo: '5102', descricao: 'Venda', categoria: 'VENDAS' },
  '5405': { codigo: '5405', descricao: 'Venda ST', categoria: 'VENDAS' },
  '5202': { codigo: '5202', descricao: 'Devolução de compra', categoria: 'DEVOLUCAO_ENTRADAS' },
}
const buscar: BuscarCfop = (c) => MAPA[c.replace(/[^0-9]/g, '')]

// Linhas no formato do "Resumo das Operações por CFOP" (valor após o CFOP).
const TEXTO_CFOP = [
  '1 0,00 0,00 30.429,71 0,00 0,00\t1-102 30.429,71 0,00 0,00',
  '0,00 199,81 0,00 0,00 0,00\t1-353 199,81 0,00 0,00', // fora da lista → ignora
  '1 0,00 0,00 72,45 0,00 0,00\t1-403 72,45 0,00 0,00',
  '1 0,00 0,00 1.463,79 0,00 0,00\t2-102 1.463,79 12,00 0,00',
  '1 0,00 0,00 15.451,60 0,00\t5-102 15.451,60 0,00 0,00',
  '60,09 0,00 0,00 0,00\t5-202 353,50 353,50',
  '1 0,00 0,00 994,00 0,00\t5-405 994,00 0,00 0,00',
].join('\n')

const TEXTO_SIMPLES = [
  'Anexo I - Comércio',
  '325,57\tSimples Nacional Total:\tReceita Tributada Total: 4.117,60 Alíquota: 7,90',
  'Anexo I - Comércio',
  '52,26\tSimples Nacional Total:\tReceita Tributada Total: 994,00 Alíquota: 5,25',
  'Anexo I - Comércio',
  '757,22\tSimples Nacional Total:\tReceita Tributada Total: 11.334,00 Alíquota: 6,68',
  'Anexo III - Prestação de Serviços',
  '4.085,23\tSimples Nacional Total:\tReceita Tributada Total: 35.293,00 Alíquota: 11,57',
].join('\n')

describe('extrairCfopsDoResumo', () => {
  it('pega o valor contábil logo após o CFOP e filtra a lista oficial', () => {
    const itens = extrairCfopsDoResumo(TEXTO_CFOP, buscar)
    expect(itens.map((i) => i.cfop)).toEqual(['1102', '1403', '2102', '5102', '5202', '5405'])
    expect(itens.find((i) => i.cfop === '1102')?.valor.toFixed(2)).toBe('30429.71')
    // 1-353 não está na lista oficial
    expect(itens.find((i) => i.cfop === '1353')).toBeUndefined()
  })
})

describe('montarComparativo (com devoluções contando)', () => {
  it('reproduz os números do caso real REVIZZI', () => {
    const itens = extrairCfopsDoResumo(TEXTO_CFOP, buscar)
    const simples = parseSimplesNacional(TEXTO_SIMPLES)
    const r = montarComparativo(itens, simples)

    expect(r.totalEntradas).toBe('31965.95')
    expect(r.totalSaidasMercadorias).toBe('16799.10') // 15451.60 + 994.00 + 353.50
    expect(r.servicos).toBe('35293.00')
    expect(r.totalSaidas).toBe('52092.10')
    expect(r.resultado).toBe('20126.15')
    expect(r.valorSimples).toBe('5220.28')
    expect(r.percVendas).toBe('6.90')
    expect(r.percServicos).toBe('11.58')
  })

  it('usa Decimal sem perder centavos', () => {
    const itens = extrairCfopsDoResumo(TEXTO_CFOP, buscar)
    const simples = parseSimplesNacional(TEXTO_SIMPLES)
    const r = montarComparativo(itens, simples)
    expect(new Decimal(r.totalSaidas).minus(r.totalEntradas).toFixed(2)).toBe(r.resultado)
  })
})
