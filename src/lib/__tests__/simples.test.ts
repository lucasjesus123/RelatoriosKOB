import { describe, it, expect } from 'vitest'
import { parseSimplesNacional } from '../simples'

// Trecho representativo do extrato do Simples Nacional (layout do pdf-parse).
const TEXTO = [
  'Anexo I - Comércio\tAnexo:',
  'Seção I - Receitas ...',
  '325,57\tSimples Nacional Total:\tReceita Tributada Total: 4.117,60 Alíquota: 7,90',
  'Anexo I - Comércio\tAnexo:',
  'Seção II - Receitas ...',
  '52,26\tSimples Nacional Total:\tReceita Tributada Total: 994,00 Alíquota: 5,25',
  'Anexo I - Comércio\tAnexo:',
  'Seção II - Receitas ...',
  '757,22\tSimples Nacional Total:\tReceita Tributada Total: 11.334,00 Alíquota: 6,68',
  'Anexo III - Locação de Bens Móveis e Prestação de Serviços\tAnexo:',
  'Seção III - ...',
  '4.085,23\tSimples Nacional Total:\tReceita Tributada Total: 35.293,00 Alíquota: 11,57',
].join('\n')

describe('parseSimplesNacional', () => {
  const d = parseSimplesNacional(TEXTO)

  it('soma o valor total do Simples (DAS)', () => {
    expect(d.valorSimples.toFixed(2)).toBe('5220.28')
  })

  it('separa a receita de serviços do anexo de serviços', () => {
    expect(d.servicosReceita.toFixed(2)).toBe('35293.00')
    expect(d.servicosSimples.toFixed(2)).toBe('4085.23')
  })

  it('soma a receita de vendas (comércio)', () => {
    expect(d.vendasReceita.toFixed(2)).toBe('16445.60')
    expect(d.vendasSimples.toFixed(2)).toBe('1135.05')
  })

  it('calcula as porcentagens efetivas', () => {
    expect(d.percVendas.toFixed(2)).toBe('6.90')
    expect(d.percServicos.toFixed(2)).toBe('11.58')
  })
})
