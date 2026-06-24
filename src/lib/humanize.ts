import Decimal from 'decimal.js'

export function gerarResumoHumanizado(percentualX: Decimal, somaEntradas: Decimal, somaSaidas: Decimal): string[] {
  const percentualNum = percentualX.toNumber()
  const paragrafos: string[] = []

  if (somaEntradas.isZero()) {
    paragrafos.push(
      'Não foi possível calcular o percentual de apuração porque o total de entradas registrado no período é zero. Verifique se os PDFs enviados contêm notas de entrada (CFOPs iniciados em 1 ou 2) antes de prosseguir com a análise.'
    )
    paragrafos.push(
      'Sem uma base de entradas para comparação, qualquer leitura sobre a saúde financeira do período ficaria distorcida. Recomendamos confirmar a completude dos documentos e gerar o relatório novamente.'
    )
    return paragrafos
  }

  if (percentualNum > 0) {
    paragrafos.push(
      `O percentual apurado foi de ${percentualNum.toFixed(2)}%, o que indica que o volume de saídas superou o de entradas no período analisado. Isso costuma ser um sinal positivo de giro comercial, mas vale acompanhar se o estoque está sendo reposto na velocidade adequada para sustentar esse ritmo de vendas.`
    )
    paragrafos.push(
      `Com saídas totais de R$ ${somaSaidas.toFixed(2)} contra entradas de R$ ${somaEntradas.toFixed(2)}, o período mostra uma operação mais voltada à venda do que à compra. Continue monitorando esse equilíbrio nos próximos ciclos para evitar rupturas de estoque.`
    )
  } else if (percentualNum < 0) {
    paragrafos.push(
      `O percentual apurado foi de ${percentualNum.toFixed(2)}%, o que indica que o volume de entradas superou o de saídas no período analisado. Isso pode ser normal em fases de reposição de estoque, mas, se for um padrão recorrente, merece atenção para entender se as vendas estão acompanhando o ritmo das compras.`
    )
    paragrafos.push(
      `Com entradas totais de R$ ${somaEntradas.toFixed(2)} contra saídas de R$ ${somaSaidas.toFixed(2)}, vale revisar se há mercadoria parada ou se o período coincide com uma estratégia deliberada de compra antecipada.`
    )
  } else {
    paragrafos.push(
      'O percentual apurado foi de 0,00%, indicando um equilíbrio exato entre entradas e saídas no período analisado.'
    )
    paragrafos.push(
      `Com R$ ${somaEntradas.toFixed(2)} em entradas e R$ ${somaSaidas.toFixed(2)} em saídas, o período não apresentou predominância de compra nem de venda. Use esse ponto como referência para comparar com os próximos ciclos de apuração.`
    )
  }

  return paragrafos
}
