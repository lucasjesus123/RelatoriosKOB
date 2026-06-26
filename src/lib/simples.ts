import Decimal from 'decimal.js'

export interface GrupoSimples {
  receita: Decimal // receita tributada do grupo
  simples: Decimal // parcela do Simples (DAS) do grupo
  perc: Decimal // alíquota efetiva = simples / receita * 100
}

export interface SimplesNacionalDados {
  valorSimples: Decimal // valor total do Simples Nacional (DAS) a recolher
  comercio: GrupoSimples // Anexo I
  industria: GrupoSimples // Anexo II
  servico: GrupoSimples // Anexos III/IV/V (serviços/locação)
}

function dec(br: string): Decimal {
  return new Decimal(br.replace(/\./g, '').replace(',', '.'))
}

function perc(simples: Decimal, receita: Decimal): Decimal {
  return receita.isZero() ? new Decimal(0) : simples.dividedBy(receita).times(100)
}

// Linha de seção: "<simples>\tSimples Nacional Total:\tReceita Tributada Total: <receita> Alíquota: ..."
const LINHA_SECAO = /([\d.]+,\d{2})\s+Simples Nacional Total:\s+Receita Tributada Total:\s+([\d.]+,\d{2})/
const LINHA_ANEXO = /Anexo\s+([IVX]+)\s*-\s*(.+)/i

type Tipo = 'comercio' | 'industria' | 'servico'

// Classifica a seção pelo anexo: I = Comércio, II = Indústria,
// III/IV/V (ou texto com serviço/locação) = Serviço.
function classificarAnexo(numeral: string, descricao: string): Tipo {
  if (/servi[çc]o|loca[çc][ãa]o/i.test(descricao)) return 'servico'
  if (/ind[uú]stria/i.test(descricao)) return 'industria'
  if (/com[ée]rcio/i.test(descricao)) return 'comercio'
  const n = numeral.toUpperCase()
  if (n === 'I') return 'comercio'
  if (n === 'II') return 'industria'
  return 'servico'
}

export function parseSimplesNacional(texto: string): SimplesNacionalDados {
  const linhas = texto.split(/\r?\n/)

  const acc: Record<Tipo, { receita: Decimal; simples: Decimal }> = {
    comercio: { receita: new Decimal(0), simples: new Decimal(0) },
    industria: { receita: new Decimal(0), simples: new Decimal(0) },
    servico: { receita: new Decimal(0), simples: new Decimal(0) },
  }

  let tipoAtual: Tipo = 'comercio'
  for (const linha of linhas) {
    const mAnexo = linha.match(LINHA_ANEXO)
    if (mAnexo) {
      tipoAtual = classificarAnexo(mAnexo[1], mAnexo[2])
      continue
    }
    const mSecao = linha.match(LINHA_SECAO)
    if (mSecao) {
      acc[tipoAtual].simples = acc[tipoAtual].simples.plus(dec(mSecao[1]))
      acc[tipoAtual].receita = acc[tipoAtual].receita.plus(dec(mSecao[2]))
    }
  }

  const grupo = (t: Tipo): GrupoSimples => ({
    receita: acc[t].receita,
    simples: acc[t].simples,
    perc: perc(acc[t].simples, acc[t].receita),
  })

  const valorSimples = acc.comercio.simples.plus(acc.industria.simples).plus(acc.servico.simples)

  return {
    valorSimples,
    comercio: grupo('comercio'),
    industria: grupo('industria'),
    servico: grupo('servico'),
  }
}

// Extrai CNPJ, razão social e período do extrato (cabeçalho).
export function parseSimplesIdentificacao(texto: string): {
  cnpj: string | null
  empresa: string | null
  periodo: string | null
} {
  const cnpj = texto.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/)?.[1] ?? null
  // Período é a competência no formato MM/AAAA, que aparece sozinho numa linha.
  // Evita capturar o mês de uma data completa de emissão (ex.: 26/06/2026).
  const periodo = texto.match(/^\s*(\d{2}\/\d{4})\s*$/m)?.[1] ?? null
  const empresa =
    texto.match(/^([A-ZÀ-Ÿ][A-ZÀ-Ÿ0-9 .,&'-]{4,})\s*$/m)?.[1]?.trim() ?? null
  return { cnpj, empresa, periodo }
}
