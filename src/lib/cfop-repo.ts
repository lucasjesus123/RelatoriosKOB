import 'server-only'
import { prisma } from './db'
import type { CfopInfo } from './cfop'

function normalizaCfop(codigo: string): string {
  return codigo.replace(/[^0-9]/g, '')
}

export type BuscarCfop = (codigoBruto: string) => CfopInfo | undefined

// Carrega o mapeamento de CFOP ativo do banco e devolve uma função de busca.
// Só os códigos cadastrados e ativos entram na apuração (regra do usuário:
// o que está fora da lista oficial é ignorado).
export async function carregarBuscadorCfop(): Promise<BuscarCfop> {
  const linhas = await prisma.cfopMapping.findMany({ where: { ativo: true } })

  const mapa = new Map<string, CfopInfo>()
  for (const linha of linhas) {
    const codigo = normalizaCfop(linha.cfop)
    mapa.set(codigo, { codigo, descricao: linha.descricao, categoria: linha.categoria })
  }

  return (codigoBruto: string) => mapa.get(normalizaCfop(codigoBruto))
}
