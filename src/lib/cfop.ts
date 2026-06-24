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

export function buscarCfop(codigoBruto: string): CfopInfo | undefined {
  return CFOP_DICIONARIO[normalizaCfop(codigoBruto)]
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
