import type { ComparativoResultado } from './comparativo'

// Gera um resumo em 2 parágrafos, em linguagem simples (poucos termos técnicos),
// para o cliente entender o relatório. O texto varia a cada geração: as frases
// são escolhidas aleatoriamente entre variações equivalentes.

function fmt(v: string): string {
  const n = Number(v)
  const [i, d] = Math.abs(n).toFixed(2).split('.')
  return `${n < 0 ? '-' : ''}${i.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${d}`
}

function escolher<T>(opcoes: T[]): T {
  return opcoes[Math.floor(Math.random() * opcoes.length)]
}

export function gerarResumoComparativo(dados: ComparativoResultado): string[] {
  const entradas = `R$ ${fmt(dados.totalEntradas)}`
  const saidas = `R$ ${fmt(dados.totalSaidas)}`
  const resultadoNum = Number(dados.resultado)
  const resultado = `R$ ${fmt(dados.resultado)}`
  const simples = `R$ ${fmt(dados.valorSimples)}`
  const temServico = dados.temServicos && Number(dados.servicos) > 0

  // ---- Parágrafo 1: movimento do período (entradas x saídas x resultado) ----
  const aberturas = [
    `No período analisado, sua empresa registrou ${entradas} em compras (entradas) e ${saidas} em vendas e serviços (saídas).`,
    `Durante o mês, o movimento ficou assim: ${entradas} em entradas (compras) e ${saidas} em saídas (vendas e serviços).`,
    `Olhando o período, as compras somaram ${entradas} e as vendas e serviços chegaram a ${saidas}.`,
    `Neste mês, entraram ${entradas} em compras e saíram ${saidas} entre vendas e serviços.`,
  ]

  let leituraResultado: string
  if (resultadoNum > 0) {
    leituraResultado = escolher([
      `Como as saídas superaram as entradas, o saldo do período ficou positivo em ${resultado} — sinal de boa atividade comercial.`,
      `Isso deixou um saldo positivo de ${resultado}, ou seja, você vendeu mais do que comprou no período.`,
      `O resultado foi positivo em ${resultado}, indicando um período de vendas aquecidas em relação às compras.`,
    ])
  } else if (resultadoNum < 0) {
    leituraResultado = escolher([
      `Como as compras superaram as vendas, o saldo ficou em ${resultado}, o que costuma acontecer em meses de reposição de estoque.`,
      `O saldo do período foi de ${resultado}, refletindo um mês em que se comprou mais do que se vendeu.`,
      `Isso resultou em um saldo de ${resultado}; vale acompanhar se as vendas vão acompanhar esse volume de compras nos próximos meses.`,
    ])
  } else {
    leituraResultado = escolher([
      `As entradas e as saídas ficaram equilibradas, com saldo de ${resultado} no período.`,
      `O período fechou equilibrado, com resultado de ${resultado}.`,
    ])
  }

  const p1 = `${escolher(aberturas)} ${leituraResultado}`

  // ---- Parágrafo 2: imposto do Simples Nacional e alíquotas efetivas ----
  const aberturasImposto = [
    `Sobre esse faturamento, o valor do Simples Nacional (DAS) a recolher foi de ${simples}.`,
    `O imposto do período pelo Simples Nacional ficou em ${simples}.`,
    `Em relação aos tributos, o Simples Nacional do mês totalizou ${simples}.`,
    `Quanto à parte fiscal, o DAS (Simples Nacional) do período somou ${simples}.`,
  ]

  const partes: string[] = []
  if (dados.temComercio) partes.push(`${fmt(dados.percComercio)}% nas vendas de comércio`)
  if (dados.temIndustria) partes.push(`${fmt(dados.percIndustria)}% nas vendas de indústria`)
  if (temServico) partes.push(`${fmt(dados.percServicos)}% nos serviços`)

  let leituraAliquota = ''
  if (partes.length > 0) {
    const lista =
      partes.length === 1
        ? partes[0]
        : `${partes.slice(0, -1).join(', ')} e ${partes[partes.length - 1]}`
    leituraAliquota = escolher([
      ` Na prática, a carga efetiva ficou em ${lista}.`,
      ` Isso representa uma alíquota efetiva de ${lista}.`,
      ` Em percentual sobre o faturamento, isso equivale a ${lista}.`,
    ])
  }

  const fechamentos = [
    ` Qualquer dúvida sobre estes números, a KOB está à disposição para explicar com calma.`,
    ` Estamos à disposição para detalhar qualquer ponto deste relatório.`,
    ` Conte com a KOB para planejar os próximos meses com base nesses dados.`,
  ]

  const p2 = `${escolher(aberturasImposto)}${leituraAliquota}${escolher(fechamentos)}`

  return [p1, p2]
}
