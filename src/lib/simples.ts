import Decimal from 'decimal.js'

export interface SimplesNacionalDados {
  valorSimples: Decimal // valor total do Simples Nacional (DAS) a recolher
  servicosReceita: Decimal // receita tributada de serviços
  servicosSimples: Decimal // parcela do Simples referente a serviços
  vendasReceita: Decimal // receita tributada de mercadorias (comércio/indústria)
  vendasSimples: Decimal // parcela do Simples referente a vendas
  percVendas: Decimal // % efetiva do Simples sobre vendas
  percServicos: Decimal // % efetiva do Simples sobre serviços
}

function dec(br: string): Decimal {
  return new Decimal(br.replace(/\./g, '').replace(',', '.'))
}

// Cada seção do extrato traz uma linha no formato:
//   "<simples>\tSimples Nacional Total:\tReceita Tributada Total: <receita> Alíquota: ..."
// precedida por uma linha "Anexo X - <tipo>". Anexos de serviço contêm
// "Serviço"/"Locação"; os demais (Comércio/Indústria) são vendas.
const LINHA_SECAO = /([\d.]+,\d{2})\s+Simples Nacional Total:\s+Receita Tributada Total:\s+([\d.]+,\d{2})/
const LINHA_ANEXO = /Anexo\s+[IVX]+\s*-\s*(.+)/i

export function parseSimplesNacional(texto: string): SimplesNacionalDados {
  const linhas = texto.split(/\r?\n/)

  let anexoAtual = ''
  let servicosReceita = new Decimal(0)
  let servicosSimples = new Decimal(0)
  let vendasReceita = new Decimal(0)
  let vendasSimples = new Decimal(0)

  for (const linha of linhas) {
    const mAnexo = linha.match(LINHA_ANEXO)
    if (mAnexo) {
      anexoAtual = mAnexo[1]
      continue
    }
    const mSecao = linha.match(LINHA_SECAO)
    if (mSecao) {
      const simples = dec(mSecao[1])
      const receita = dec(mSecao[2])
      const ehServico = /servi[çc]o|loca[çc][ãa]o/i.test(anexoAtual)
      if (ehServico) {
        servicosSimples = servicosSimples.plus(simples)
        servicosReceita = servicosReceita.plus(receita)
      } else {
        vendasSimples = vendasSimples.plus(simples)
        vendasReceita = vendasReceita.plus(receita)
      }
    }
  }

  const valorSimples = vendasSimples.plus(servicosSimples)
  const percVendas = vendasReceita.isZero()
    ? new Decimal(0)
    : vendasSimples.dividedBy(vendasReceita).times(100)
  const percServicos = servicosReceita.isZero()
    ? new Decimal(0)
    : servicosSimples.dividedBy(servicosReceita).times(100)

  return {
    valorSimples,
    servicosReceita,
    servicosSimples,
    vendasReceita,
    vendasSimples,
    percVendas,
    percServicos,
  }
}

// Extrai CNPJ, razão social e período do extrato (cabeçalho).
export function parseSimplesIdentificacao(texto: string): {
  cnpj: string | null
  empresa: string | null
  periodo: string | null
} {
  const cnpj = texto.match(/(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/)?.[1] ?? null
  const periodo = texto.match(/Per[íi]odo:\s*\n?\s*[\s\S]{0,40}?(\d{2}\/\d{4})/)?.[1]
    ?? texto.match(/\b(\d{2}\/\d{4})\b/)?.[1]
    ?? null
  const empresa =
    texto.match(/^([A-ZÀ-Ÿ][A-ZÀ-Ÿ0-9 .,&'-]{4,})\s*$/m)?.[1]?.trim() ?? null
  return { cnpj, empresa, periodo }
}
