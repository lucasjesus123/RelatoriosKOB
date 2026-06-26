import { describe, it, expect } from 'vitest'
import { detectarCliente } from '../detect-client'

describe('detecção de cliente no PDF', () => {
  it('detecta CNPJ formatado e razão social por rótulo', () => {
    const texto = ['Razão Social: REVIZZI COMERCIO LTDA', 'CNPJ: 12.345.678/0001-99', 'Período: 01/2026'].join('\n')
    const d = detectarCliente(texto)
    expect(d?.cnpj).toBe('12.345.678/0001-99')
    expect(d?.nome).toBe('REVIZZI COMERCIO LTDA')
  })

  it('detecta CNPJ sem pontuação e formata', () => {
    const d = detectarCliente('EMPRESA EXEMPLO ME CNPJ 12345678000199')
    expect(d?.cnpj).toBe('12.345.678/0001-99')
  })

  it('usa o texto antes do CNPJ na mesma linha quando não há rótulo', () => {
    const d = detectarCliente('MERCADO BOM PRECO LTDA   12.345.678/0001-99')
    expect(d?.cnpj).toBe('12.345.678/0001-99')
    expect(d?.nome).toBe('MERCADO BOM PRECO LTDA')
  })

  it('retorna null quando não há CNPJ', () => {
    expect(detectarCliente('Relatório sem identificação fiscal')).toBeNull()
  })

  it('retorna cnpj com nome nulo quando não há nome confiável', () => {
    const d = detectarCliente('12.345.678/0001-99')
    expect(d?.cnpj).toBe('12.345.678/0001-99')
    expect(d?.nome).toBeNull()
  })
})
