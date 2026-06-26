export type CfopCategoria =
  | 'VENDAS'
  | 'DEVOLUCAO_VENDAS'
  | 'ENTRADAS'
  | 'DEVOLUCAO_ENTRADAS'
  | 'SERVICOS'

export interface CfopInfo {
  codigo: string
  descricao: string
  categoria: CfopCategoria
}

function normalizaCfop(codigo: string): string {
  return codigo.replace(/[^0-9]/g, '')
}

const CFOP_DICIONARIO_RAW: Record<string, { descricao: string; categoria: CfopCategoria }> = {
  // ENTRADAS
  '1101': { descricao: 'Compra para industrialização ou produção rural', categoria: 'ENTRADAS' },
  '1102': { descricao: 'Compra para comercialização', categoria: 'ENTRADAS' },
  '1403': { descricao: 'Compra para comercialização com subst. tributária', categoria: 'ENTRADAS' },
  '1401': { descricao: 'Compra para industrialização ou produção rural em operação com mercadoria sujeita ao regime de substituição tributária', categoria: 'ENTRADAS' },
  '2101': { descricao: 'Compra para industrialização ou produção rural', categoria: 'ENTRADAS' },
  '2102': { descricao: 'Compra para comercialização', categoria: 'ENTRADAS' },
  '2403': { descricao: 'Compra para comercialização com subst. tributária', categoria: 'ENTRADAS' },
  '2401': { descricao: 'Compra para industrialização ou produção rural em operação com mercadoria sujeita ao regime de substituição tributária', categoria: 'ENTRADAS' },

  // DEVOLUCAO DE VENDAS
  '1202': { descricao: 'Devolução de venda de mercadoria adquirida ou recebida de terceiros', categoria: 'DEVOLUCAO_VENDAS' },
  '1201': { descricao: 'Devolução de venda de produção do estabelecimento', categoria: 'DEVOLUCAO_VENDAS' },
  '1411': { descricao: 'Devolução de venda de mercadoria de substituição tributária', categoria: 'DEVOLUCAO_VENDAS' },
  '2202': { descricao: 'Devolução de venda de mercadoria adquirida ou recebida de terceiros', categoria: 'DEVOLUCAO_VENDAS' },
  '2411': { descricao: 'Devolução de venda de mercadoria de substituição tributária', categoria: 'DEVOLUCAO_VENDAS' },

  // VENDAS
  '5101': { descricao: 'Venda de produção do estabelecimento', categoria: 'VENDAS' },
  '6101': { descricao: 'Venda de produção do estabelecimento', categoria: 'VENDAS' },
  '5102': { descricao: 'Venda de mercadoria adquirida ou recebida de terceiros', categoria: 'VENDAS' },
  '6102': { descricao: 'Venda de mercadoria adquirida ou recebida de terceiros', categoria: 'VENDAS' },
  '5405': { descricao: 'Venda de mercadoria adquirida ou recebida de terceiros em operação com mercadoria sujeita ao regime de substituição tributária', categoria: 'VENDAS' },
  '5401': { descricao: 'Venda de produção do estabelecimento em operação com produto sujeito ao regime de substituição tributária', categoria: 'VENDAS' },

  // DEVOLUCAO DE ENTRADAS
  '5202': { descricao: 'Devolução de compra para comercialização, ou qualquer devolução de mercadorias efetuada', categoria: 'DEVOLUCAO_ENTRADAS' },
  '6202': { descricao: 'Devolução de compra para comercialização, ou qualquer devolução de mercadorias efetuada', categoria: 'DEVOLUCAO_ENTRADAS' },
  '5411': { descricao: 'Devolução de compra para comercialização em operação com mercadoria sujeita ao regime de substituição tributária', categoria: 'DEVOLUCAO_ENTRADAS' },
  '6411': { descricao: 'Devolução de compra para comercialização em operação com mercadoria sujeita ao regime de substituição tributária', categoria: 'DEVOLUCAO_ENTRADAS' },

  // SERVICOS
  '5933': { descricao: 'Prestação de serviço tributado pelo ISSQN', categoria: 'SERVICOS' },
}

export const CFOP_DICIONARIO: Record<string, CfopInfo> = Object.fromEntries(
  Object.entries(CFOP_DICIONARIO_RAW).map(([codigo, info]) => [
    codigo,
    { codigo, ...info },
  ])
)

// Fallback para CFOPs que não estão no dicionário oficial acima: classifica
// pelo primeiro dígito (1/2/3 = entradas, 5/6/7 = saídas), com as mesmas
// exceções do padrão fiscal (x.2xx = devolução, x933 = serviço), para que
// nenhum valor do PDF seja descartado por não constar na lista exata.
function classificarPorDigito(codigo: string): { descricao: string; categoria: CfopCategoria } {
  const primeiroDigito = codigo[0]
  const isEntradaDigito = primeiroDigito === '1' || primeiroDigito === '2' || primeiroDigito === '3'
  const isServico = codigo.endsWith('933')
  const isDevolucao = codigo[1] === '2'

  if (isServico) {
    return { descricao: 'Prestação de serviço tributado pelo ISSQN', categoria: 'SERVICOS' }
  }

  if (isEntradaDigito) {
    return isDevolucao
      ? { descricao: 'Devolução de venda (classificado por regra de dígito)', categoria: 'DEVOLUCAO_VENDAS' }
      : { descricao: 'Entrada de mercadoria ou serviço (classificado por regra de dígito)', categoria: 'ENTRADAS' }
  }

  return isDevolucao
    ? { descricao: 'Devolução de compra (classificado por regra de dígito)', categoria: 'DEVOLUCAO_ENTRADAS' }
    : { descricao: 'Venda de mercadoria ou serviço (classificado por regra de dígito)', categoria: 'VENDAS' }
}

export function buscarCfop(codigoBruto: string): CfopInfo | undefined {
  const codigo = normalizaCfop(codigoBruto)
  if (!codigo) return undefined

  const doDicionario = CFOP_DICIONARIO[codigo]
  if (doDicionario) return doDicionario

  return { codigo, ...classificarPorDigito(codigo) }
}

export const CATEGORIAS_ORDEM: CfopCategoria[] = [
  'VENDAS',
  'DEVOLUCAO_VENDAS',
  'ENTRADAS',
  'DEVOLUCAO_ENTRADAS',
  'SERVICOS',
]

export const CATEGORIA_LABEL: Record<CfopCategoria, string> = {
  VENDAS: 'VENDAS',
  DEVOLUCAO_VENDAS: 'DEVOLUÇÃO DE VENDAS',
  ENTRADAS: 'ENTRADAS',
  DEVOLUCAO_ENTRADAS: 'DEVOLUÇÃO DE ENTRADAS',
  SERVICOS: 'SERVIÇOS',
}
