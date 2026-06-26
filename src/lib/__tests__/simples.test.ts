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

describe('parseSimplesNacional (Anexo I comércio + serviços)', () => {
  const d = parseSimplesNacional(TEXTO)

  it('soma o valor total do Simples (DAS)', () => {
    expect(d.valorSimples.toFixed(2)).toBe('5220.28')
  })

  it('separa a receita de serviços do anexo de serviços', () => {
    expect(d.servico.receita.toFixed(2)).toBe('35293.00')
    expect(d.servico.simples.toFixed(2)).toBe('4085.23')
  })

  it('soma a receita de comércio (Anexo I)', () => {
    expect(d.comercio.receita.toFixed(2)).toBe('16445.60')
    expect(d.comercio.simples.toFixed(2)).toBe('1135.05')
    expect(d.industria.receita.toFixed(2)).toBe('0.00')
  })

  it('calcula as porcentagens efetivas por anexo', () => {
    expect(d.comercio.perc.toFixed(2)).toBe('6.90')
    expect(d.servico.perc.toFixed(2)).toBe('11.58')
  })
})

const TEXTO_CALTEC = [
  'Anexo I - Comércio',
  '298,23\tSimples Nacional Total:\tReceita Tributada Total: 3.282,00 Alíquota: 9,08',
  'Anexo II - Indústria',
  '670,97\tSimples Nacional Total:\tReceita Tributada Total: 6.999,00 Alíquota: 9,58',
  'Anexo III - Locação de Bens Móveis e Prestação de Serviços',
  '25.796,52\tSimples Nacional Total:\tReceita Tributada Total: 191.870,00 Alíquota: 13,44',
].join('\n')

describe('parseSimplesNacional (comércio + indústria + serviço — caso CALTEC)', () => {
  const d = parseSimplesNacional(TEXTO_CALTEC)

  it('separa os 3 anexos e calcula as alíquotas efetivas (arredondamento correto)', () => {
    // 298,23/3.282,00 = 9,0869% → 9,09 (a planilha manual truncou para 9,08)
    expect(d.comercio.perc.toFixed(2)).toBe('9.09')
    expect(d.industria.perc.toFixed(2)).toBe('9.59')
    expect(d.servico.perc.toFixed(2)).toBe('13.44')
  })

  it('soma o valor total do Simples (DAS)', () => {
    expect(d.valorSimples.toFixed(2)).toBe('26765.72')
  })
})
